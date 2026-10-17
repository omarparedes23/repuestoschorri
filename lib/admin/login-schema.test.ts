import { describe, expect, it } from "vitest";
import { loginSchema } from "@/lib/admin/login-schema";

function fieldErrors(input: unknown): Record<string, string> {
  const result = loginSchema.safeParse(input);
  if (result.success) return {};
  const out: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0]);
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

describe("loginSchema", () => {
  it("acepta credenciales válidas y recorta el email", () => {
    const result = loginSchema.safeParse({ email: "  admin@correo.com  ", password: "secreto" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("admin@correo.com");
  });

  it("email vacío falla con mensaje en español", () => {
    expect(fieldErrors({ email: "", password: "x" }).email).toBe("Ingresa tu correo");
  });

  it("email solo con espacios falla como vacío", () => {
    expect(fieldErrors({ email: "   ", password: "x" }).email).toBe("Ingresa tu correo");
  });

  it("email con formato inválido falla con mensaje en español", () => {
    expect(fieldErrors({ email: "no-es-correo", password: "x" }).email).toBe(
      "Ingresa un correo válido"
    );
  });

  it("contraseña vacía falla con mensaje en español", () => {
    expect(fieldErrors({ email: "a@b.com", password: "" }).password).toBe(
      "Ingresa tu contraseña"
    );
  });

  it("reporta ambos campos a la vez", () => {
    const errors = fieldErrors({ email: "", password: "" });
    expect(Object.keys(errors).sort()).toEqual(["email", "password"]);
  });

  it("campos ausentes fallan sin lanzar", () => {
    const errors = fieldErrors({});
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
  });
});
