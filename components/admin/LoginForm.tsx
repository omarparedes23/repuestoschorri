"use client";

import { useActionState } from "react";
import { signIn, type SignInState } from "@/lib/admin/actions";
import { SubmitButton } from "@/components/admin/SubmitButton";

const INITIAL: SignInState = {};

const inputClass =
  "mt-1 block min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-ink placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand aria-[invalid=true]:border-accent";

// Sin registro ni recuperación de contraseña: auth.users es compartido con otras apps.
export function LoginForm() {
  const [state, formAction] = useActionState(signIn, INITIAL);
  const emailError = state.fieldErrors?.email;
  const passwordError = state.fieldErrors?.password;

  return (
    <form action={formAction} noValidate className="space-y-4">
      <div>
        <label htmlFor="email" className="text-sm font-semibold text-navy">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          required
          defaultValue={state.email ?? ""}
          aria-invalid={emailError ? true : undefined}
          aria-describedby={emailError ? "email-error" : undefined}
          className={inputClass}
        />
        {emailError ? (
          <p id="email-error" className="mt-1 text-sm text-accent">
            {emailError}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-semibold text-navy">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={passwordError ? true : undefined}
          aria-describedby={passwordError ? "password-error" : undefined}
          className={inputClass}
        />
        {passwordError ? (
          <p id="password-error" className="mt-1 text-sm text-accent">
            {passwordError}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <p role="alert" className="rounded-xl bg-accent/10 px-3 py-2 text-sm font-semibold text-accent">
          {state.message}
        </p>
      ) : null}

      <SubmitButton pendingText="Ingresando..." className="w-full">
        Ingresar
      </SubmitButton>
    </form>
  );
}
