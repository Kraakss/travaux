import { IconeBase, type PropsIcone } from './Base'

/** Damier de carreaux avec joints. */
export function IconeCarrelage(p: PropsIcone) {
  const cases: [number, number][] = [[0, 0], [2, 0], [1, 1], [3, 1], [0, 2], [2, 2], [1, 3], [3, 3]]
  return (
    <IconeBase {...p}>
      <rect x="8" y="8" width="48" height="48" rx="3" />
      <path d="M20 8v48M32 8v48M44 8v48M8 20h48M8 32h48M8 44h48" strokeWidth={2} />
      {cases.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={8 + x * 12 + 2} y={8 + y * 12 + 2} width="8" height="8" fill="currentColor" fillOpacity={0.35} stroke="none" />
      ))}
    </IconeBase>
  )
}
