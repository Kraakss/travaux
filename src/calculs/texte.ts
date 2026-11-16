// Texte du devis (partage / presse-papiers).
import type { Devis } from './devis'
import { fmtEuro, fmtNombre } from './format'

export function texteDevis(
  nomChantier: string,
  devis: Devis,
  sousTotaux: { nom: string; total: number }[],
): string {
  const l: string[] = [`Devis – ${nomChantier}`, '']
  for (const f of devis.familles) {
    l.push(f.nom.toUpperCase())
    for (const x of f.lignes) {
      l.push(`- ${fmtNombre(x.quantite)} × ${x.nom} (${x.unite}) : ${fmtEuro(x.total)}`)
    }
    l.push(`Sous-total ${f.nom.toLowerCase()} : ${fmtEuro(f.total)}`, '')
  }
  l.push(`TOTAL TTC : ${fmtEuro(devis.total)}`)
  if (sousTotaux.length > 0) {
    l.push('', 'Estimation par pièce :')
    for (const s of sousTotaux) l.push(`- ${s.nom} : ${fmtEuro(s.total)}`)
  }
  return l.join('\n')
}
