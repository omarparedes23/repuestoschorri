"use server";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/admin/login-schema";
import { ADMIN_ROUTES } from "@/lib/admin/route-guard";

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
