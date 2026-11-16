import { IconeBase, type PropsIcone } from './Base'

/** Rouleau à peinture avec son manche. */
export function IconePeinture(p: PropsIcone) {
  return (
    <IconeBase {...p}>
      <rect x="8" y="8" width="40" height="16" rx="4" />
      <path d="M48 16h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H30a2 2 0 0 0-2 2v6" />
      <rect x="24" y="38" width="8" height="18" rx="3" />
      <path d="M14 14h28" strokeWidth={2} opacity={0.5} />
    </IconeBase>
  )
}
