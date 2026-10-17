import { SubmitButton } from "@/components/admin/SubmitButton";
import { signOutAction } from "@/lib/admin/actions";

// Destino de usuarios con sesión que NO están en la allowlist. Sin requireAdmin():
// debe poder verlo cualquier usuario autenticado para poder cerrar sesión.
export default function SinAccesoPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <h1 className="font-heading text-xl font-bold text-navy">Sin acceso</h1>
        <p className="mt-2 text-sm text-slate-600">
          Tu cuenta no tiene permiso para usar este panel. Cierra sesión e ingresa con otra
          cuenta.
        </p>
        <form action={signOutAction} className="mt-6">
          <SubmitButton pendingText="Saliendo..." className="w-full">
            Cerrar sesión
          </SubmitButton>
        </form>
      </div>
    </main>
  );
}
