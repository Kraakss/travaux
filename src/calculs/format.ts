// Mise en forme des nombres (français).
const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

export function fmtEuro(x: number): string {
  return euro.format(Number.isFinite(x) ? x : 0)
}

/** Nombre avec au plus `max` décimales, virgule française */
export function fmtNombre(x: number, max = 2): string {
  const v = Number.isFinite(x) ? x : 0
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: max }).format(v)
}
