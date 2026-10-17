import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminProduct, listBrands, listCategories } from "@/lib/admin/queries";
import { rowToFormValues } from "@/lib/admin/product-form";

// `params` es una promesa: se pasa tal cual al hijo async, que es quien la espera
// (así la página no bloquea el shell estático).
export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-600">Cargando producto...</p>}>
      <EditProduct params={params} />
    </Suspense>
  );
}

async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { supabase, email } = await requireAdmin();
  const { id } = await params;

  const [row, categories, brands] = await Promise.all([
    getAdminProduct(supabase, id),
    listCategories(supabase),
    listBrands(supabase),
  ]);
  if (!row) notFound();

  const initial = rowToFormValues(row);
  return (
    <>
      <AdminHeader email={email} />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <h1 className="mb-1 font-heading text-2xl font-bold text-navy">Editar producto</h1>
        <p className="mb-5 text-sm text-slate-600">{row.nombre}</p>
        <ProductForm
          productId={row.id}
          initial={initial}
          imagen={row.imagen}
          categories={categories}
          // Una marca desactivada solo se ofrece si el producto ya la tiene.
          brands={brands.filter((b) => b.activa || initial.marcaIds.includes(b.id))}
        />
      </main>
    </>
  );
}
