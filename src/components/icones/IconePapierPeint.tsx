import { IconeBase, type PropsIcone } from './Base'

/** Rouleau de papier peint qui se déroule sur un mur (lé orné de losanges). */
export function IconePapierPeint(p: PropsIcone) {
  return (
    <IconeBase {...p}>
      <path d="M6 58h52" />
      <path d="M30 12h22v42H30" />
      <path d="M41 22l5 5-5 5-5-5zM41 40l5 5-5 5-5-5z" strokeWidth={2} />
      <circle cx="19" cy="21" r="11" />
      <circle cx="19" cy="21" r="4" />
      <path d="M19 10h11" />
    </IconeBase>
  )
}
