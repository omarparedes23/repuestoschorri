import { Suspense } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { requireAdmin } from "@/lib/admin/auth";

// Provisional (fase 2): la fase 3 lo reemplaza por el listado de productos.
export default function AdminHomePage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-600">Cargando panel...</p>}>
      <AdminHome />
    </Suspense>
  );
}

async function AdminHome() {
  const { email } = await requireAdmin();
  return (
    <>
      <AdminHeader email={email} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="font-heading text-2xl font-bold text-navy">Panel</h1>
      </main>
    </>
  );
}
