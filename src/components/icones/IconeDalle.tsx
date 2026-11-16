import { IconeBase, type PropsIcone } from './Base'

/** Dalle de béton vue en perspective, avec son treillis soudé. */
export function IconeDalle(p: PropsIcone) {
  return (
    <IconeBase {...p}>
      <path d="M32 12l26 12-26 12L6 24z" />
      <path d="M6 24v10l26 12 26-12V24" />
      <path d="M32 36v10" />
      <path d="M19 18l26 12M45 18L19 30" strokeWidth={2} />
    </IconeBase>
  )
}
