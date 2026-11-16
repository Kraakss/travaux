import { IconeBase, type PropsIcone } from './Base'

/** Mur à ossature métallique : rails haut et bas, montants, une plaque posée à droite. */
export function IconeCloison(p: PropsIcone) {
  return (
    <IconeBase {...p}>
      <path d="M8 10h48M8 54h48" />
      <path d="M16 10v44M28 10v44M40 10v44" />
      <rect x="40" y="14" width="16" height="36" rx="1" fill="currentColor" fillOpacity={0.15} />
      <path d="M44 22l8 0M44 30l8 0M44 38l8 0" strokeWidth={2} />
    </IconeBase>
  )
}
