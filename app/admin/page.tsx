import { Suspense } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProductList } from "@/components/admin/ProductList";
import { requireAdmin } from "@/lib/admin/auth";
import { listAdminProducts } from "@/lib/admin/queries";

// Sin sesión ni datos en el cuerpo de la página: todo ocurre en el hijo async,
// bajo <Suspense> (cacheComponents).
export default function AdminHomePage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-600">Cargando productos...</p>}>
      <AdminHome />
    </Suspense>
  );
}

async function AdminHome() {
  const { supabase, email } = await requireAdmin();
  const products = await listAdminProducts(supabase);

  return (
    <>
      <AdminHeader email={email} />
      <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6 sm:pb-10">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h1 className="font-heading text-2xl font-bold text-navy">Productos</h1>
          <Link
            href="/admin/productos/nuevo"
            className="fixed inset-x-4 bottom-4 z-10 inline-flex min-h-12 items-center justify-center rounded-xl bg-brand px-5 text-sm font-bold text-white shadow-lg transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:static sm:min-h-11 sm:shadow-none"
          >
            Nuevo producto
          </Link>
        </div>
        <ProductList products={products} />
      </main>
    </>
  );
}
