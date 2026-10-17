"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/admin/login-schema";
import { ADMIN_ROUTES } from "@/lib/admin/route-guard";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminProduct, listTakenSlugs } from "@/lib/admin/queries";
import { formToRpcPayload, parseProductFormData, readFormValues, type ProductFormValues } from "@/lib/admin/product-form";
import { mapDbError } from "@/lib/admin/errors";
import { nextAvailableSlug, slugify } from "@/lib/admin/slug";

export interface SignInState {
  message?: string;
  fieldErrors?: { email?: string; password?: string };
  /** Email enviado, para repoblar el campo tras un error (nunca la contraseña). */
  email?: string;
}

// Mismo texto para credenciales malas y para usuarios que no son admin: evita
// revelar qué cuentas de las otras apps (auth.users compartido) existen.
const INVALID_CREDENTIALS = "Correo o contraseña incorrectos";

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const rawEmail = String(formData.get("email") ?? "");
  const parsed = loginSchema.safeParse({
    email: rawEmail,
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    const fieldErrors: NonNullable<SignInState["fieldErrors"]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if ((key === "email" || key === "password") && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { fieldErrors, email: rawEmail };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { message: INVALID_CREDENTIALS, email: parsed.data.email };

  const { data: isAdmin, error: adminError } = await supabase.rpc("chorri_is_admin");
  if (adminError || isAdmin !== true) {
    // scope "local": el global cerraría las sesiones del usuario en las demás apps.
    await supabase.auth.signOut({ scope: "local" });
    return { message: INVALID_CREDENTIALS, email: parsed.data.email };
  }

  // redirect() lanza una excepción: va fuera de cualquier try/catch.
  redirect(ADMIN_ROUTES.home);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut({ scope: "local" });
  redirect(ADMIN_ROUTES.login);
}

export interface SaveProductState {
  message?: string;
  /** Clave = nombre del campo; `especificaciones.N` para la fila N. */
  fieldErrors?: Record<string, string>;
  /** Valores enviados, para repoblar el formulario tras un error. */
  values?: ProductFormValues;
}

const VALIDATION_MESSAGE = "Revisa los campos marcados en rojo.";
// Colisión de id/slug por una carrera entre dos altas: un único reintento con la lista fresca.
const UNIQUE_VIOLATION = "23505";

/**
 * Alta (`productId` null) o edición. Nunca confía en el cliente: requireAdmin()
 * primero, validación Zod, y la RPC (SECURITY INVOKER) + RLS como barrera final.
 * R17: la `imagen` que envíe el cliente se ignora (alta => null; edición => la de BD).
 */
export async function saveProduct(
  productId: string | null,
  _prev: SaveProductState,
  formData: FormData,
): Promise<SaveProductState> {
  const { supabase } = await requireAdmin();

  const parsed = parseProductFormData(formData);
  if (!parsed.success) {
    return { message: VALIDATION_MESSAGE, fieldErrors: parsed.fieldErrors, values: parsed.values };
  }
  const input = parsed.data;

  let errorCode: string | undefined;

  if (productId === null) {
    const base = slugify(input.nombre);
    for (let attempt = 0; attempt < 2; attempt++) {
      const taken = await listTakenSlugs(supabase, base);
      const slug = nextAvailableSlug(base, taken);
      const { producto, marcas } = formToRpcPayload(input, { crear: true, id: slug, slug });
      const { error } = await supabase.rpc("chorri_guardar_producto", {
        p_producto: producto,
        p_marcas: marcas,
        p_crear: true,
      });
      errorCode = error ? (error.code ?? "unknown") : undefined;
      if (errorCode !== UNIQUE_VIOLATION) break;
    }
  } else {
    const current = await getAdminProduct(supabase, productId);
    if (!current) return { message: mapDbError("P0002") };
    const { producto, marcas } = formToRpcPayload(input, {
      crear: false,
      id: current.id,
      imagenActual: current.imagen,
    });
    const { error } = await supabase.rpc("chorri_guardar_producto", {
      p_producto: producto,
      p_marcas: marcas,
      p_crear: false,
    });
    errorCode = error ? (error.code ?? "unknown") : undefined;
  }

  if (errorCode) return { message: mapDbError(errorCode), values: readFormValues(formData) };

  revalidatePath(ADMIN_ROUTES.home);
  // redirect() lanza una excepción: va fuera de cualquier try/catch.
  redirect(ADMIN_ROUTES.home);
}

const setActiveSchema = z.object({
  id: z.string().min(1).max(80),
  activo: z.boolean(),
});

export interface SetActiveResult {
  ok: boolean;
  message?: string;
}

/** Alterna `activo` bajo RLS (solo admin). No existe borrado en ninguna capa. */
export async function setProductActive(id: string, activo: boolean): Promise<SetActiveResult> {
  const { supabase } = await requireAdmin();

  const parsed = setActiveSchema.safeParse({ id, activo });
  if (!parsed.success) return { ok: false, message: "Solicitud no válida." };

  const { data, error } = await supabase
    .from("chorri_productos")
    .update({ activo: parsed.data.activo })
    .eq("id", parsed.data.id)
    .select("id");
  if (error) return { ok: false, message: mapDbError(error.code) };
  if (!data || data.length === 0) return { ok: false, message: mapDbError("P0002") };

  revalidatePath(ADMIN_ROUTES.home);
  return { ok: true };
}
