// Modèle de données (chantier > pièces > travaux) et calculs de totaux. Aucune dépendance à l'interface.
import { trouverFiche } from './index'
import { construireDevis, type Devis, type Prix } from './devis'
import { resultatVide, type Entrees, type Pertes, type Resultat } from './commun'

export interface Travail {
  id: string
  categorie: string
  entrees: Entrees
}

export interface Piece {
  id: string
  nom: string
  travaux: Travail[]
}

export interface Chantier {
  id: string
  nom: string
  creeLe: string
  pieces: Piece[]
}

export function resultatTravail(t: Travail, pertes: Pertes): Resultat {
  const fiche = trouverFiche(t.categorie)
  if (!fiche) return resultatVide()
  return fiche.calculer(t.entrees, pertes)
}

/** Devis d'un seul travail (chaque quantité arrondie) */
export function devisTravail(t: Travail, pertes: Pertes, prix: Prix): Devis {
  return construireDevis([resultatTravail(t, pertes)], prix)
}

/** Sous-total d'une pièce : somme des travaux, chacun arrondi (estimation) */
export function totalPiece(p: Piece, pertes: Pertes, prix: Prix): number {
  const somme = p.travaux.reduce((s, t) => s + devisTravail(t, pertes, prix).total, 0)
  return Math.round(somme * 100) / 100
}

export function tousLesResultats(c: Chantier, pertes: Pertes): Resultat[] {
  return c.pieces.flatMap((p) => p.travaux.map((t) => resultatTravail(t, pertes)))
}

/** Devis global : quantités additionnées PUIS arrondies */
export function devisGlobal(c: Chantier, pertes: Pertes, prix: Prix): Devis {
  return construireDevis(tousLesResultats(c, pertes), prix)
}

export function nomTravail(t: Travail): string {
  return trouverFiche(t.categorie)?.nom ?? 'Travail'
}
