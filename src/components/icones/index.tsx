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

const ICONES: Record<string, ComponentType<PropsIcone>> = {
  plafond: IconePlafond,
  cloison: IconeCloison,
  carrelage: IconeCarrelage,
  peinture: IconePeinture,
  'papier-peint': IconePapierPeint,
  dalle: IconeDalle,
  parpaings: IconeParpaings,
}

/** Icône d'une catégorie (identifiant `icone` de la fiche). */
export function IconeCategorie({ nom, taille, titre }: { nom: string } & PropsIcone) {
  const Composant = ICONES[nom] ?? IconeDefaut
  return <Composant taille={taille} titre={titre} />
}
