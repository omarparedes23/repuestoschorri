import type { BrandOption } from "@/lib/admin/queries";

// Marcas de vehículo compatibles: casillas con defaultChecked (el formulario es
// no controlado; React lo reinicia al valor guardado tras cada envío).
export function BrandPicker({ brands, selected }: { brands: BrandOption[]; selected: string[] }) {
  return (
    <fieldset className="rounded-2xl border border-slate-200 bg-white p-4">
      <legend className="px-1 font-heading text-base font-bold text-navy">Marcas compatibles</legend>
      {brands.length === 0 ? (
        <p className="text-sm text-slate-600">No hay marcas disponibles.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {brands.map((brand) => (
            <label
              key={brand.id}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm text-ink has-[:checked]:border-brand has-[:checked]:bg-brand/5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand"
            >
              <input
                type="checkbox"
                name="marcaIds"
                value={brand.id}
                defaultChecked={selected.includes(brand.id)}
                className="h-5 w-5 accent-brand"
              />
              {brand.nombre}
              {brand.activa ? "" : " (inactiva)"}
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}
