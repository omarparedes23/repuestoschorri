import { Logo } from "@/components/Logo";
import { LoginForm } from "@/components/admin/LoginForm";

// No lee cookies: si ya hay sesión, el proxy redirige a /admin.
export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Logo className="h-14" />
          <h1 className="font-heading text-xl font-bold text-navy">Panel de administración</h1>
          <p className="text-sm text-slate-600">Acceso solo para el personal autorizado.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
