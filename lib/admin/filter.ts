// Búsqueda del listado admin: PURA, sin distinguir mayúsculas ni acentos.

export interface Searchable {
  name: string;
  code: string;
  oemCode: string;
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** Filtra por nombre, código u OEM. Término vacío => todos. */
export function filterAdminProducts<T extends Searchable>(items: readonly T[], query: string): T[] {
  const term = normalize(query);
  if (!term) return [...items];
  return items.filter((item) =>
    [item.name, item.code, item.oemCode].some((field) => normalize(field).includes(term)),
  );
}
