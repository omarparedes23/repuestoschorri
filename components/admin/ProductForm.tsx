"use client";

import { useActionState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { saveProduct, type SaveProductState } from "@/lib/admin/actions";
import type { ProductFormValues } from "@/lib/admin/product-form";
import type { BrandOption, CategoryOption } from "@/lib/admin/queries";
import { availabilitySchema } from "@/lib/product-schema";
import { BrandPicker } from "@/components/admin/BrandPicker";
import { SpecsEditor } from "@/components/admin/SpecsEditor";
import { SubmitButton } from "@/components/admin/SubmitButton";

const INITIAL: SaveProductState = {};

const CONTROL =
  "mt-1 block min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-ink placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand aria-[invalid=true]:border-accent";
const SECTION = "rounded-2xl border border-slate-200 bg-white p-4";
const LEGEND = "px-1 font-heading text-base font-bold text-navy";

function Field({
  name,
  label,
  error,
  hint,
  required = false,
  children,
}: {
  name: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-semibold text-navy">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {children}
      {hint ? (
        <p id={`${name}-hint`} className="mt-1 text-sm text-slate-600">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${name}-error`} className="mt-1 text-sm text-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}

// Atributos de un control: id/name, aria-invalid y aria-describedby (pista y/o error).
function a11y(name: string, error?: string, hasHint = false) {
  const described = [hasHint ? `${name}-hint` : null, error ? `${name}-error` : null]
    .filter(Boolean)
    .join(" ");
  return {
    id: name,
    name,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": described || undefined,
  } as const;
}

export function ProductForm({
  productId,
  initial,
  imagen,
  categories,
  brands,
}: {
  productId: string | null;
  initial: ProductFormValues;
  imagen: string | null;
  categories: CategoryOption[];
  brands: BrandOption[];
}) {
  const [state, formAction] = useActionState(saveProduct.bind(null, productId), INITIAL);
  const formRef = useRef<HTMLFormElement>(null);
  const alertRef = useRef<HTMLParagraphElement>(null);
  const values = state.values ?? initial;
  const errors = state.fieldErrors ?? {};

  // Foco al primer campo con error (orden del DOM); si no hay, al aviso general.
  useEffect(() => {
    if (!state.message) return;
    const firstInvalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    (firstInvalid ?? alertRef.current)?.focus();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} noValidate className="space-y-5 pb-4">
      {state.message ? (
        <p
          ref={alertRef}
          tabIndex={-1}
          role="alert"
          className="rounded-xl bg-accent/10 px-3 py-2 text-sm font-semibold text-accent"
        >
          {state.message}
        </p>
      ) : null}

      {/* R17: en esta etapa el servidor ignora `imagen`; la foto actual se conserva. */}
      <input type="hidden" name="imagen" value={imagen ?? ""} />

      <fieldset className={`${SECTION} space-y-4`}>
        <legend className={LEGEND}>Datos del producto</legend>
        <Field name="nombre" label="Nombre" required error={errors.nombre}>
          <input {...a11y("nombre", errors.nombre)} defaultValue={values.nombre} autoComplete="off" className={CONTROL} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="codigo" label="Código interno" required error={errors.codigo}>
            <input {...a11y("codigo", errors.codigo)} defaultValue={values.codigo} autoComplete="off" className={CONTROL} />
          </Field>
          <Field name="oem" label="Código OEM" required error={errors.oem}>
            <input {...a11y("oem", errors.oem)} defaultValue={values.oem} autoComplete="off" className={CONTROL} />
          </Field>
        </div>
        <Field name="compatibilidad" label="Compatibilidad" required error={errors.compatibilidad}>
          <input
            {...a11y("compatibilidad", errors.compatibilidad)}
            defaultValue={values.compatibilidad}
            autoComplete="off"
            className={CONTROL}
          />
        </Field>
        <Field name="descripcion" label="Descripción" error={errors.descripcion}>
          <textarea
            {...a11y("descripcion", errors.descripcion)}
            defaultValue={values.descripcion}
            rows={4}
            className={`${CONTROL} py-2`}
          />
        </Field>
      </fieldset>

      <fieldset className={`${SECTION} space-y-4`}>
        <legend className={LEGEND}>Categoría y disponibilidad</legend>
        <Field name="categoriaId" label="Categoría" required error={errors.categoriaId}>
          <select {...a11y("categoriaId", errors.categoriaId)} defaultValue={values.categoriaId} className={CONTROL}>
            <option value="">Elige una categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nombre}
              </option>
            ))}
          </select>
        </Field>
        <Field name="disponibilidad" label="Disponibilidad" required error={errors.disponibilidad}>
          <select
            {...a11y("disponibilidad", errors.disponibilidad)}
            defaultValue={values.disponibilidad}
            className={CONTROL}
          >
            <option value="">Elige una disponibilidad</option>
            {availabilitySchema.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <Field name="garantia" label="Garantía" required error={errors.garantia}>
          <input {...a11y("garantia", errors.garantia)} defaultValue={values.garantia} autoComplete="off" className={CONTROL} />
        </Field>
      </fieldset>

      <BrandPicker brands={brands} selected={values.marcaIds} />

      <fieldset className={SECTION}>
        <legend className={LEGEND}>Foto</legend>
        <p className="text-sm text-slate-600">
          {imagen
            ? "Este producto ya tiene foto y se conserva al guardar."
            : "Aún sin foto. La subida de fotos se habilitará en la siguiente etapa."}
        </p>
      </fieldset>

      <SpecsEditor initial={values.especificaciones} errors={errors} />

      <fieldset className={`${SECTION} space-y-4`}>
        <legend className={LEGEND}>Precio (opcional)</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            name="precio"
            label="Precio en soles (S/)"
            error={errors.precio}
            hint="Opcional. Deja vacío para mostrar «Precio a cotizar»."
          >
            <input
              {...a11y("precio", errors.precio, true)}
              defaultValue={values.precio}
              inputMode="decimal"
              autoComplete="off"
              placeholder="12,50"
              className={CONTROL}
            />
          </Field>
          <Field name="precioNota" label="Nota del precio" error={errors.precioNota} hint="Por ejemplo: (par) o (juego x4).">
            <input
              {...a11y("precioNota", errors.precioNota, true)}
              defaultValue={values.precioNota}
              autoComplete="off"
              className={CONTROL}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className={SECTION}>
        <legend className={LEGEND}>Estado</legend>
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm text-ink">
          <input type="checkbox" name="activo" defaultChecked={values.activo} className="h-5 w-5 accent-brand" />
          Visible en la web
        </label>
      </fieldset>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 sm:mx-0 sm:rounded-2xl sm:border">
        <Link
          href="/admin"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-navy transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Cancelar
        </Link>
        <SubmitButton pendingText="Guardando...">Guardar</SubmitButton>
      </div>
    </form>
  );
}
