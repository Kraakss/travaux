// Liste des fiches de calcul.
// Pour ajouter une catégorie : créer un fichier (comme plafond.ts) et l'ajouter ici.
import type { Fiche } from './commun'
import { fichePlafond } from './plafond'
import { ficheCloison } from './cloison'
import { ficheCarrelage } from './carrelage'
import { fichePeinture } from './peinture'
import { fichePapierPeint } from './papierPeint'
import { ficheDalle } from './dalle'
import { ficheParpaings } from './parpaings'

export const FICHES: Fiche[] = [
  fichePlafond,
  ficheCloison,
  ficheCarrelage,
  fichePeinture,
  fichePapierPeint,
  ficheDalle,
  ficheParpaings,
]

export function trouverFiche(id: string): Fiche | undefined {
  return FICHES.find((f) => f.id === id)
}
