import { IconeBase, type PropsIcone } from './Base'

/** Mur de blocs en appareil à joints décalés. */
export function IconeParpaings(p: PropsIcone) {
  return (
    <IconeBase {...p}>
      <rect x="6" y="10" width="52" height="44" rx="2" />
      <path d="M6 24.7h52M6 39.3h52" />
      <path d="M32 10v14.7M19 24.7v14.6M45 24.7v14.6M32 39.3V54" />
    </IconeBase>
  )
}
