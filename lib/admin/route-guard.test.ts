import { describe, expect, it } from "vitest";
import { decideAccess, decideAdminRedirect } from "@/lib/admin/route-guard";

describe("decideAdminRedirect (proxy optimista)", () => {
  it("sin claims en /admin redirige a /admin/login", () => {
    expect(decideAdminRedirect("/admin", false)).toBe("/admin/login");
  });

  it("sin claims en una subruta protegida redirige a /admin/login", () => {
    expect(decideAdminRedirect("/admin/productos/x", false)).toBe("/admin/login");
  });

  it("sin claims en /admin/login no redirige", () => {
    expect(decideAdminRedirect("/admin/login", false)).toBeNull();
  });

  it("con claims en /admin/login redirige a /admin", () => {
    expect(decideAdminRedirect("/admin/login", true)).toBe("/admin");
  });

  it("con claims en /admin no redirige", () => {
    expect(decideAdminRedirect("/admin", true)).toBeNull();
  });

  it("con claims en /admin/sin-acceso no redirige (evita el bucle)", () => {
    expect(decideAdminRedirect("/admin/sin-acceso", true)).toBeNull();
  });

  it("sin claims en /admin/sin-acceso redirige a /admin/login", () => {
    expect(decideAdminRedirect("/admin/sin-acceso", false)).toBe("/admin/login");
  });

  it("tolera la barra final en /admin/login/", () => {
    expect(decideAdminRedirect("/admin/login/", true)).toBe("/admin");
  });
});

describe("decideAccess (requireAdmin)", () => {
  it("sin claims devuelve login", () => {
    expect(decideAccess(false, false)).toBe("login");
  });

  it("claims sin fila en la allowlist devuelve forbidden", () => {
    expect(decideAccess(true, false)).toBe("forbidden");
  });

  it("claims con fila en la allowlist devuelve allow", () => {
    expect(decideAccess(true, true)).toBe("allow");
  });

  it("sin claims manda login aunque isAdmin sea true", () => {
    expect(decideAccess(false, true)).toBe("login");
  });
});
