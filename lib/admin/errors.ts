// Traducción PURA de códigos SQLSTATE (los que lanza chorri_guardar_producto o el
// motor) a mensajes en español para el admin. Nunca se expone el texto crudo de BD.

export const DB_ERROR_MESSAGES: Record<string, string> = {
  "23505": "Ya existe un producto con ese nombre o identificador. Inténtalo de nuevo.",
  "42501": "No tienes permiso para realizar esta acción.",
  P0002: "El producto ya no existe.",
  "23503": "La categoría o alguna marca elegida ya no existe. Recarga la página e inténtalo de nuevo.",
};

export const GENERIC_DB_ERROR = "No se pudo guardar el producto. Inténtalo de nuevo.";

export function mapDbError(code: string | null | undefined): string {
  return (code ? DB_ERROR_MESSAGES[code] : undefined) ?? GENERIC_DB_ERROR;
}
