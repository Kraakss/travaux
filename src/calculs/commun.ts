// Types et outils communs à toutes les fiches de calcul (aucune dépendance à l'interface).

export interface Pertes {
  placo: number
  carrelageDroite: number
  carrelageDiagonale: number
  peinture: number
  maconnerie: number
}

export const PERTES_DEFAUT: Pertes = {
  placo: 10,
  carrelageDroite: 10,
  carrelageDiagonale: 15,
  peinture: 10,
  maconnerie: 5,
}

/** Une ligne de matériau : quantité EXPRIMÉE EN UNITÉS DE VENTE (fractionnaire). */
export interface LigneQte {
  /** id d'un matériau, ou d'un groupe au litre (peinture) */
  materiauId: string
  quantite: number
  /**
   * Nombre d'unités de prix dans une unité de vente (ex. carton de 1,44 m²
   * pour un carrelage vendu au m²). Vaut 1 par défaut.
   */
  facteur?: number
  /** Précision affichée après le nom (ex. « carton de 1,44 m² ») */
  detail?: string
}

export interface Info {
  cle: string
  label: string
  valeur: number
  unite?: string
}

export interface Resultat {
  lignes: LigneQte[]
  infos: Info[]
  avertissements: string[]
  /** Conseils neutres (non bloquants), affichés sans alerte */
  notes?: string[]
}

export interface Ouvertures {
  portes: number
  fenetres: number
  persoNb: number
  persoSurface: number
  surfPorte: number
  surfFenetre: number
}

export const OUVERTURES_DEFAUT: Ouvertures = {
  portes: 0,
  fenetres: 0,
  persoNb: 0,
  persoSurface: 1,
  surfPorte: 1.7,
  surfFenetre: 1.4,
}

export interface Carreau {
  /** côtés en cm */
  a: number
  b: number
}

export type Valeur = number | string | boolean | null | Ouvertures | Carreau
export type Entrees = Record<string, Valeur>

// ---------- Définition d'un champ de saisie ----------

interface ChampBase {
  id: string
  label: string
  /** Petite explication affichée sous le libellé */
  aide?: string
  /** Si défini et renvoie false, le champ est masqué */
  visible?: (e: any) => boolean
}
export type ChampDef =
  | (ChampBase & { type: 'nombre'; unite?: string; entier?: boolean })
  | (ChampBase & { type: 'choix'; options: { valeur: string; label: string }[] })
  | (ChampBase & { type: 'oui_non' })
  | (ChampBase & { type: 'ouvertures'; portesSeulement?: boolean })
  | (ChampBase & { type: 'carreau' })
  | (ChampBase & { type: 'titre' })

export interface Fiche<E = any> {
  id: string
  nom: string
  /** Identifiant de l'icône (voir src/components/icones) */
  icone: string
  /** Champs affichés dans le formulaire, dans l'ordre */
  champs: ChampDef[]
  /** Valeurs initiales d'un nouveau travail */
  defauts: () => E
  /** Perte par défaut (en %) ; absent = pas de champ « perte » */
  perteDefaut?: (e: E, pertes: Pertes) => number
  calculer: (e: E, pertes: Pertes) => Resultat
  /** Ids des matériaux (ou groupes) que cette fiche peut utiliser */
  materiaux: string[]
}

// ---------- Outils numériques ----------

const EPS = 1e-9

/** Arrondi au supérieur tolérant aux erreurs de virgule flottante (9,4000000001 → 10, mais 9,4 → 9,4). */
export function arrondiSup(x: number): number {
  return Math.ceil(x - EPS)
}

export function arrondiInf(x: number): number {
  return Math.floor(x + EPS)
}

/** Valeur numérique sûre : vide/NaN → 0, négatif → 0 */
export function nb(v: unknown): number {
  const x = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(x) && x > 0 ? x : 0
}

export function div(a: number, b: number): number {
  return b > 0 ? a / b : 0
}

/** Lit un nombre saisi par l'utilisateur : accepte virgule et point. */
export function parseNombre(texte: string): number | null {
  const t = texte.trim().replace(',', '.')
  if (t === '' || t === '.') return null
  if (!/^\d*\.?\d*$/.test(t)) return null
  const x = Number(t)
  return Number.isFinite(x) ? x : null
}

export function surfaceOuvertures(o: Partial<Ouvertures> | null | undefined): number {
  if (!o) return 0
  const d = OUVERTURES_DEFAUT
  return (
    nb(o.portes) * nb(o.surfPorte ?? d.surfPorte) +
    nb(o.fenetres) * nb(o.surfFenetre ?? d.surfFenetre) +
    nb(o.persoNb) * nb(o.persoSurface ?? d.persoSurface)
  )
}

export function nbPortes(o: Partial<Ouvertures> | null | undefined): number {
  return o ? nb(o.portes) : 0
}

export function nbOuvertures(o: Partial<Ouvertures> | null | undefined): number {
  return o ? nb(o.portes) + nb(o.fenetres) + nb(o.persoNb) : 0
}

/** Perte en fraction (0,05) à partir de la saisie (5) ou de la valeur par défaut */
export function perteEffective(saisie: number | null | undefined, defaut: number): number {
  const p = saisie === null || saisie === undefined ? defaut : saisie
  return nb(p) / 100
}

// ---------- Plaques de plâtre ----------

export const FORMATS_PLAQUE: { valeur: string; label: string; surface: number }[] = [
  { valeur: '250', label: '250 × 120 cm (3,0 m²)', surface: 3.0 },
  { valeur: '240', label: '240 × 120 cm (2,88 m²)', surface: 2.88 },
  { valeur: '300', label: '300 × 120 cm (3,6 m²)', surface: 3.6 },
]

export const TYPES_PLAQUE = [
  { valeur: 'standard', label: 'Standard' },
  { valeur: 'hydro', label: 'Hydrofuge' },
  { valeur: 'feu', label: 'Feu' },
]

export function surfacePlaque(format: string): number {
  return FORMATS_PLAQUE.find((f) => f.valeur === format)?.surface ?? 3.0
}

export function idPlaque(type: string, format: string): string {
  return `plaque-${type}-${format}`
}

export function resultatVide(): Resultat {
  return { lignes: [], infos: [], avertissements: [] }
}

export const PERIMETRE_PORTE = 0.83 // largeur d'une porte retirée du périmètre (plinthes, papier peint)
