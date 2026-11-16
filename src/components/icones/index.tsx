import type { ComponentType } from 'react'
import type { PropsIcone } from './Base'
import { IconePlafond } from './IconePlafond'
import { IconeCloison } from './IconeCloison'
import { IconeCarrelage } from './IconeCarrelage'
import { IconePeinture } from './IconePeinture'
import { IconePapierPeint } from './IconePapierPeint'
import { IconeDalle } from './IconeDalle'
import { IconeParpaings } from './IconeParpaings'
import { IconeDefaut } from './IconeDefaut'
import * as N from './IconesNouvelles'

const ICONES: Record<string, ComponentType<PropsIcone>> = {
  plafond: IconePlafond,
  cloison: IconeCloison,
  carrelage: IconeCarrelage,
  peinture: IconePeinture,
  'papier-peint': IconePapierPeint,
  dalle: IconeDalle,
  parpaings: IconeParpaings,
  'doublage-colle': N.IconeDoublageColle,
  'doublage-ossature': N.IconeDoublageOssature,
  'carreaux-platre': N.IconeCarreauxPlatre,
  alveolaire: N.IconeAlveolaire,
  combles: N.IconeCombles,
  'sous-chape': N.IconeSousChape,
  briques: N.IconeBriques,
  'beton-cellulaire': N.IconeBetonCellulaire,
  chape: N.IconeChape,
  melange: N.IconeMelange,
  'carrelage-mural': N.IconeCarrelageMural,
  parquet: N.IconeParquet,
  ragreage: N.IconeRagreage,
  facade: N.IconeFacade,
  'terrasse-lames': N.IconeTerrasseLames,
  'terrasse-dalles': N.IconeTerrasseDalles,
  toiture: N.IconeToiture,
  electricite: N.IconeElectricite,
  plomberie: N.IconePlomberie,
}

/** Icône d'une catégorie (identifiant `icone` de la fiche). */
export function IconeCategorie({ nom, taille, titre }: { nom: string } & PropsIcone) {
  const Composant = ICONES[nom] ?? IconeDefaut
  return <Composant taille={taille} titre={titre} />
}
