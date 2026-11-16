import { IconeBase, type PropsIcone } from './Base'

/** Plaque de plâtre suspendue au plafond par des suspentes. */
export function IconePlafond(p: PropsIcone) {
  return (
    <IconeBase {...p}>
      <path d="M6 8h52" />
      <path d="M16 8v14M32 8v14M48 8v14" />
      <rect x="6" y="22" width="52" height="10" rx="2" />
      <path d="M18 27h0M32 27h0M46 27h0" strokeWidth={4} />
      <path d="M12 44h40M12 52h24" strokeDasharray="2 6" opacity={0.5} />
    </IconeBase>
  )
}
