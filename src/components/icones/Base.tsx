import type { ReactNode } from 'react'

/** Cadre commun des icônes : dessin au trait, 64 x 64, couleur = texte courant. */
export function IconeBase({ taille = 48, titre, children }: { taille?: number; titre?: string; children: ReactNode }) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={titre ? 'img' : undefined}
      aria-label={titre}
      aria-hidden={titre ? undefined : true}
    >
      {children}
    </svg>
  )
}

export interface PropsIcone {
  taille?: number
  titre?: string
}
