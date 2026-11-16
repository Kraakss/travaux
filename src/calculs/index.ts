// Liste des fiches de calcul.
// Pour ajouter une catégorie : créer un fichier (comme plafond.ts), l'ajouter ici et dans la bonne famille du menu.
import type { Fiche } from './commun'
import { fichePlafond } from './plafond'
import { ficheCloison } from './cloison'
import { ficheCarrelage } from './carrelage'
import { fichePeinture } from './peinture'
import { fichePapierPeint } from './papierPeint'
import { ficheDalle } from './dalle'
import { ficheParpaings } from './parpaings'
import { ficheDoublageColle, ficheDoublageOssature } from './doublage'
import { ficheCarreauxPlatre, ficheAlveolaire } from './cloisonsLegeres'
import { ficheCombles, ficheSousChape } from './isolation'
import { ficheBriques, ficheBetonCellulaire } from './murs'
import { ficheChape, ficheRagreage, ficheParquet } from './sols'
import { ficheMelange, ficheFacade } from './beton'
import { ficheCarrelageMural } from './carrelageMural'
import { ficheLambourdes, ficheDallesPlots } from './terrasse'
import { ficheToiture } from './toiture'
import { ficheElectricite } from './electricite'
import { fichePlomberie } from './plomberie'

export const FICHES: Fiche[] = [
  fichePlafond,
  ficheCloison,
  ficheDoublageColle,
  ficheDoublageOssature,
  ficheCarreauxPlatre,
  ficheAlveolaire,
  ficheCombles,
  ficheSousChape,
  ficheDalle,
  ficheParpaings,
  ficheBriques,
  ficheBetonCellulaire,
  ficheChape,
  ficheMelange,
  ficheCarrelage,
  ficheCarrelageMural,
  ficheParquet,
  ficheRagreage,
  fichePeinture,
  fichePapierPeint,
  ficheFacade,
  ficheLambourdes,
  ficheDallesPlots,
  ficheToiture,
  ficheElectricite,
  fichePlomberie,
]

/** Familles du menu « Ajouter un travail » (dans l'ordre d'affichage) */
export const GROUPES_FICHES: { id: string; nom: string }[] = [
  { id: 'cloisons', nom: 'Cloisons et doublage' },
  { id: 'isolation', nom: 'Isolation' },
  { id: 'maconnerie', nom: 'Maçonnerie' },
  { id: 'sols', nom: 'Sols et murs' },
  { id: 'exterieur', nom: 'Extérieur' },
  { id: 'reseaux', nom: 'Réseaux (électricité, plomberie)' },
]

export function trouverFiche(id: string): Fiche | undefined {
  return FICHES.find((f) => f.id === id)
}
