import { IconeBase, type PropsIcone } from './Base'

/** Icône de secours pour une catégorie sans dessin. */
export function IconeDefaut(p: PropsIcone) {
  return (
    <IconeBase {...p}>
      <path d="M12 52l24-24" />
      <path d="M40 12a10 10 0 0 0-8 14l-4 4 6 6 4-4a10 10 0 0 0 14-8l-6 4-6-6z" />
    </IconeBase>
  )
}
