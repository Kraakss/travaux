import { IconeBase, type PropsIcone } from './Base'

// Icônes des fiches ajoutées : dessins au trait simples (64 x 64), dans le style des icônes d'origine.
const FOND = { fill: 'currentColor', fillOpacity: 0.15 }

/** Mur avec panneau isolant collé : mur, panneau hachuré, plots de colle. */
export function IconeDoublageColle(p: PropsIcone) {
  return (
    <IconeBase {...p}>
      <path d="M8 10v44M8 54h48" />
      <rect x="16" y="12" width="26" height="40" {...FOND} />
      <path d="M42 12h8v40h-8" />
      <circle cx="12" cy="22" r="1.5" />
      <circle cx="12" cy="32" r="1.5" />
      <circle cx="12" cy="42" r="1.5" />
      <path d="M22 20h14M22 30h14M22 40h14" strokeWidth={2} />
    </IconeBase>
  )
}

/** Doublage sur ossature : fourrures verticales, laine entre elles, plaque à droite. */
export function IconeDoublageOssature(p: PropsIcone) {
  return (
    <IconeBase {...p}>
      <path d="M8 10v44M8 54h48" />
      <path d="M18 10v44M32 10v44" />
      <path d="M22 16c3 2 3 4 0 6s-3 4 0 6 3 4 0 6 3 4 0 6" strokeWidth={2} />
      <path d="M36 16c3 2 3 4 0 6s-3 4 0 6 3 4 0 6 3 4 0 6" strokeWidth={2} />
      <rect x="44" y="10" width="10" height="44" {...FOND} />
    </IconeBase>
  )
}

/** Carreaux de plâtre : briques de plâtre posées en quinconce. */
export function IconeCarreauxPlatre(p: PropsIcone) {
  return (
    <IconeBase {...p}>
      <rect x="8" y="10" width="48" height="44" rx="2" />
      <path d="M8 24.7h48M8 39.3h48" />
      <path d="M32 10v14.7M20 24.7v14.6M44 24.7v14.6M32 39.3V54" />
      <path d="M12 17h3M12 32h3" strokeWidth={2} />
    </IconeBase>
  )
}

/** Cloison alvéolaire : panneau avec ses alvéoles en coupe. */
export function IconeAlveolaire(p: PropsIcone) {
  return (
    <IconeBase {...p}>
      <rect x="10" y="8" width="44" height="48" rx="2" />
      <path d="M10 16h44M10 48h44" />
      <path d="M20 16l6 8-6 8 6 8-6 8M34 16l6 8-6 8 6 8-6 8" strokeWidth={2} />
    </IconeBase>
  )
}

/** Combles perdus : toit en pente, couche de laine soufflée, flèche d'épaisseur. */
export function IconeCombles(p: PropsIcone) {
  return (
    <IconeBase {...p}>
      <path d="M6 30L32 10l26 20" />
      <path d="M12 54h40" />
      <path d="M12 54c3-6 6-6 9 0s6-6 9 0 6-6 9 0 6-6 9 0" {...FOND} />
      <path d="M32 22v14M28 26l4-4 4 4M28 32l4 4 4-4" strokeWidth={2} />
    </IconeBase>
  )
}

/** Isolation sous chape : trois couches (chape, isolant, dalle) en coupe. */
export function IconeSousChape(p: PropsIcone) {
  return (
    <IconeBase {...p}>
      <rect x="8" y="14" width="48" height="10" rx="1" />
      <rect x="8" y="24" width="48" height="14" {...FOND} />
      <path d="M14 31h6M26 31h6M38 31h6" strokeWidth={2} />
      <rect x="8" y="38" width="48" height="12" rx="1" />
      <path d="M8 56h48" />
    </IconeBase>
  )
}

/** Mur en briques creuses : appareil de briques avec leurs alvéoles. */
export function IconeBriques(p: PropsIcone) {
  return (
    <IconeBase {...p}>
      <rect x="6" y="14" width="52" height="36" rx="2" />
      <path d="M6 26h52M6 38h52" />
      <path d="M22 14v12M42 14v12M14 26v12M32 26v12M50 26v12M22 38v12M42 38v12" />
      <path d="M10 20h6M26 20h6M46 20h6" strokeWidth={2} />
    </IconeBase>
  )
}

/** Béton cellulaire : grand bloc percé de bulles d'air. */
export function IconeBetonCellulaire(p: PropsIcone) {
  return (
    <IconeBase {...p}>
      <rect x="6" y="18" width="52" height="28" rx="2" {...FOND} />
      <circle cx="16" cy="28" r="3" />
      <circle cx="28" cy="36" r="2.5" />
      <circle cx="38" cy="26" r="3.5" />
      <circle cx="48" cy="37" r="2.5" />
      <circle cx="22" cy="40" r="1.5" />
      <circle cx="50" cy="26" r="1.5" />
      <path d="M6 52h52" />
    </IconeBase>
  )
}

/** Chape : sol lissé à la règle. */
export function IconeChape(p: PropsIcone) {
  return (
    <IconeBase {...p}>
      <rect x="6" y="38" width="52" height="14" rx="1" {...FOND} />
      <path d="M14 20h36M14 20v-4M50 20v-4" />
      <path d="M18 30l-3 8M32 30l-3 8M46 30l-3 8" strokeWidth={2} />
    </IconeBase>
  )
}

/** Mortier / béton à la volée : seau de maçon et truelle. */
export function IconeMelange(p: PropsIcone) {
  return (
    <IconeBase {...p}>
      <path d="M12 24h32l-4 28H16z" {...FOND} />
      <path d="M12 24c0-6 6-8 16-8s16 2 16 8" />
      <path d="M18 34h20M19 43h18" strokeWidth={2} />
      <path d="M50 10l6 6-12 14" />
      <path d="M44 30l-6-4" />
    </IconeBase>
  )
}

/** Carrelage mural : mur carrelé avec une douchette. */
export function IconeCarrelageMural(p: PropsIcone) {
  return (
    <IconeBase {...p}>
      <rect x="6" y="8" width="52" height="48" rx="2" />
      <path d="M6 20h52M6 32h52M6 44h52M19 8v48M32 8v48M45 8v48" strokeWidth={2} />
      <path d="M44 8v8a4 4 0 0 1-8 0" />
      <path d="M34 20l-3 5M40 20v6M46 20l3 5" strokeWidth={2} />
    </IconeBase>
  )
}

/** Parquet : lames posées en quinconce. */
export function IconeParquet(p: PropsIcone) {
  return (
    <IconeBase {...p}>
      <rect x="6" y="10" width="52" height="44" rx="2" />
      <path d="M6 24.7h52M6 39.3h52" />
      <path d="M26 10v14.7M44 24.7v14.6M18 39.3V54" />
      <path d="M10 17h8M30 17h8M10 32h8M48 32h6M24 47h8M40 47h8" strokeWidth={1.5} />
    </IconeBase>
  )
}

/** Ragréage : sol coulé qui s'étale, avec une lisseuse. */
export function IconeRagreage(p: PropsIcone) {
  return (
    <IconeBase {...p}>
      <path d="M6 44c6-4 10 0 16-2s10-2 16 0 12-2 20 0v10H6z" {...FOND} />
      <path d="M6 54h52" />
      <path d="M22 14h24l-4 10H18z" />
      <path d="M32 14V8" />
    </IconeBase>
  )
}

/** Enduit de façade : maison avec une partie enduite à la taloche. */
export function IconeFacade(p: PropsIcone) {
  return (
    <IconeBase {...p}>
      <path d="M8 28L32 10l24 18" />
      <rect x="12" y="28" width="40" height="26" />
      <rect x="18" y="34" width="10" height="10" />
      <rect x="38" y="34" width="8" height="20" />
      <path d="M13 50l4-4M13 44l4-4M13 38l4-4" strokeWidth={2} />
    </IconeBase>
  )
}

/** Terrasse en lames : lames sur lambourdes, vue en coupe, avec deux plots. */
export function IconeTerrasseLames(p: PropsIcone) {
  return (
    <IconeBase {...p}>
      <path d="M6 22l12-8h40l-12 8z" {...FOND} />
      <path d="M6 22v6h40v-6M46 22v6M46 28l12-8v-6" />
      <path d="M16 22l12-8M28 22l12-8" strokeWidth={2} />
      <path d="M16 28v14M36 28v14" />
      <path d="M12 42h12M32 42h12M14 42v8h8v-8M34 42v8h8v-8" />
      <path d="M6 56h52" />
    </IconeBase>
  )
}

/** Terrasse en dalles : dalles carrées posées sur des plots. */
export function IconeTerrasseDalles(p: PropsIcone) {
  return (
    <IconeBase {...p}>
      <path d="M8 26l16-10h32L40 26z" {...FOND} />
      <path d="M8 26v5h32v-5M40 31l16-10v-5" />
      <path d="M24 16L8 26M40 16L24 26" strokeWidth={2} />
      <path d="M16 31v14M32 31v14" />
      <path d="M10 45h12M26 45h12" />
      <path d="M6 56h52" />
    </IconeBase>
  )
}

/** Toiture en tuiles : pan de toit avec ses rangs de tuiles et une gouttière. */
export function IconeToiture(p: PropsIcone) {
  return (
    <IconeBase {...p}>
      <path d="M6 44L32 12l26 32z" {...FOND} />
      <path d="M17 31h30M11.5 38h41M24 22h16" strokeWidth={2} />
      <path d="M24 31v7M32 31v7M40 31v7M28 22v9M36 22v9" strokeWidth={2} />
      <path d="M4 48h58v4H4z" />
      <path d="M58 52v6" />
    </IconeBase>
  )
}

/** Électricité : prise murale avec un éclair. */
export function IconeElectricite(p: PropsIcone) {
  return (
    <IconeBase {...p}>
      <rect x="10" y="10" width="44" height="44" rx="8" />
      <circle cx="32" cy="32" r="14" />
      <path d="M34 22l-8 11h6l-2 9 8-12h-6z" {...FOND} />
    </IconeBase>
  )
}

/** Plomberie : robinet avec une goutte. */
export function IconePlomberie(p: PropsIcone) {
  return (
    <IconeBase {...p}>
      <path d="M12 14h22a8 8 0 0 1 8 8v6" />
      <path d="M26 14V8M20 8h12" />
      <rect x="36" y="28" width="12" height="8" rx="1" />
      <path d="M42 46c-4 5-6 8-6 11a6 6 0 0 0 12 0c0-3-2-6-6-11z" {...FOND} />
      <path d="M12 14v10" />
    </IconeBase>
  )
}
