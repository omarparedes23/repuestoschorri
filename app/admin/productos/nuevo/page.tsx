import { Suspense } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin/auth";
import { listBrands, listCategories } from "@/lib/admin/queries";
import type { ProductFormValues } from "@/lib/admin/product-form";

const EMPTY_VALUES: ProductFormValues = {
  nombre: "",
  codigo: "",
  oem: "",
  categoriaId: "",
  marcaIds: [],
  compatibilidad: "",
  disponibilidad: "",
  garantia: "",
  descripcion: "",
  precio: "",
  precioNota: "",
  activo: true,
  especificaciones: [],
};

export default function NewProductPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-600">Cargando formulario...</p>}>
      <NewProduct />
    </Suspense>
  );
}

async function NewProduct() {
  const { supabase, email } = await requireAdmin();
  const [categories, brands] = await Promise.all([listCategories(supabase), listBrands(supabase)]);

  return (
    <>
      <AdminHeader email={email} />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <h1 className="mb-5 font-heading text-2xl font-bold text-navy">Nuevo producto</h1>
        <ProductForm
          productId={null}
          initial={EMPTY_VALUES}
          imagen={null}
          categories={categories}
          brands={brands.filter((b) => b.activa)}
        />
      </main>
    </>
  );
}
