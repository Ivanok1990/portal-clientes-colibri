// Utilidades de formato compartidas.

// Formatea una fecha ISO ("2026-07-15") a "15 jul 2026".
// Se agrega "T00:00:00" para interpretarla en la zona horaria local y
// evitar el desfase de un día que ocurre al parsear como UTC.
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Versión corta ("15 Jul"), usada en las tarjetas de la vista móvil.
export function formatShortDate(iso: string): string {
  const s = new Date(`${iso}T00:00:00`).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
  });
  // Capitaliza el mes: "15 jul" -> "15 Jul".
  return s.replace(/\b([a-záéíóú])/g, (m, c, offset) =>
    offset > 2 ? c.toUpperCase() : m
  );
}
