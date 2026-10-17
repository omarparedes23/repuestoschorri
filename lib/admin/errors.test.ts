import { describe, expect, it } from "vitest";
import { mapDbError } from "@/lib/admin/errors";

describe("mapDbError", () => {
  it("23505 (unique) -> mensaje de identificador duplicado", () => {
    expect(mapDbError("23505")).toBe(
      "Ya existe un producto con ese nombre o identificador. Inténtalo de nuevo.",
    );
  });

  it("42501 (no autorizado) -> mensaje de permiso", () => {
    expect(mapDbError("42501")).toBe("No tienes permiso para realizar esta acción.");
  });

  it("P0002 (producto inexistente) -> mensaje de no encontrado", () => {
    expect(mapDbError("P0002")).toBe("El producto ya no existe.");
  });

  it("23503 (FK) -> categoría o marca inexistente", () => {
    expect(mapDbError("23503")).toBe(
      "La categoría o alguna marca elegida ya no existe. Recarga la página e inténtalo de nuevo.",
    );
  });

  it("código desconocido o ausente -> mensaje genérico", () => {
    const generic = "No se pudo guardar el producto. Inténtalo de nuevo.";
    expect(mapDbError("XX000")).toBe(generic);
    expect(mapDbError(undefined)).toBe(generic);
  });
});
