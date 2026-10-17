import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { signOutAction } from "@/lib/admin/actions";

// Cabecera del panel. El email llega por prop desde la página (que ya pasó por
// requireAdmin() bajo <Suspense>): este componente no lee la sesión.
export function AdminHeader({ email }: { email?: string }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <Link href="/admin" aria-label="Panel de administración" className="flex items-center">
          <Logo className="h-10" />
        </Link>
        <div className="flex items-center gap-3">
          {email ? (
            <span className="hidden max-w-[16rem] truncate text-sm text-slate-600 sm:inline">
              {email}
            </span>
          ) : null}
          <form action={signOutAction}>
            <SubmitButton variant="secondary" pendingText="Saliendo...">
              Cerrar sesión
            </SubmitButton>
          </form>
        </div>
      </div>
    </header>
  );
}
