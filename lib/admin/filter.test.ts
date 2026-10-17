import { describe, expect, it } from "vitest";
import { filterAdminProducts } from "@/lib/admin/filter";

const items = [
  { id: "a", name: "Amortiguador delantero", code: "PE-1450", oemCode: "48190-02050" },
  { id: "b", name: "Pastillas de freno Ñandú", code: "FR-200", oemCode: "04465-0K240" },
  { id: "c", name: "Perno de rueda", code: "PN-10", oemCode: "90942-02049" },
];

const ids = (list: typeof items) => list.map((i) => i.id);

describe("filterAdminProducts", () => {
  it("ignora mayúsculas", () => {
    expect(ids(filterAdminProducts(items, "AMORTIGUADOR"))).toEqual(["a"]);
  });

  it("ignora acentos en el término y en el nombre", () => {
    expect(ids(filterAdminProducts(items, "delántero"))).toEqual(["a"]);
    expect(ids(filterAdminProducts(items, "nandu"))).toEqual(["b"]);
  });

  it("busca por código y por OEM", () => {
    expect(ids(filterAdminProducts(items, "fr-200"))).toEqual(["b"]);
    expect(ids(filterAdminProducts(items, "90942"))).toEqual(["c"]);
  });

  it("sin coincidencias devuelve lista vacía", () => {
    expect(filterAdminProducts(items, "zzzz")).toEqual([]);
  });

  it("término vacío o solo espacios devuelve todos", () => {
    expect(ids(filterAdminProducts(items, ""))).toEqual(["a", "b", "c"]);
    expect(ids(filterAdminProducts(items, "   "))).toEqual(["a", "b", "c"]);
  });
});
