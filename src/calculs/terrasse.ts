// Terrasses : sur lambourdes (lames bois / composite) et en dalles sur plots.
import { type Fiche, type Resultat, type Pertes, type Carreau, nb, div, perteEffective, arrondiSup } from './commun'

const PERTE = 10

// ---------- 15) Terrasse sur lambourdes ----------

export interface EntreesLambourdes {
  longueur: number | null
  largeur: number | null
  type: string
  largeurLame: number | null
  longueurLame: number | null
  hauteurSol: number | null
  perte: number | null
}

/** entraxe des lambourdes (m), espacement des plots (m), matériau de lame et sa longueur de référence (m) */
export const TYPES_LAME: Record<string, { label: string; entraxe: number; plots: number; id: string; longueurRef: number }> = {
  pin: { label: 'Pin 21-23 mm', entraxe: 0.4, plots: 0.5, id: 'lame-pin-21', longueurRef: 2.4 },
  bois: { label: 'Bois 27 mm et plus ou exotique', entraxe: 0.5, plots: 0.7, id: 'lame-bois-27', longueurRef: 2.4 },
  composite: { label: 'Composite', entraxe: 0.4, plots: 0.5, id: 'lame-composite', longueurRef: 3.6 },
}

export function calculerLambourdes(e: EntreesLambourdes, _pertes?: Pertes): Resultat {
  const L = nb(e.longueur), l = nb(e.largeur)
  const perte = perteEffective(e.perte, PERTE)
  const S = L * l
  const Sm = S * (1 + perte)
  const t = TYPES_LAME[e.type] ?? TYPES_LAME.pin
  const largeurLame = nb(e.largeurLame), longueurLame = nb(e.longueurLame)
  const pasLame = largeurLame + 0.007 // lame + espace de 7 mm
  const n = l > 0 ? arrondiSup(l / t.entraxe) + 1 : 0
  const plots = L > 0 ? n * (arrondiSup(L / t.plots) + 1) : 0
  const lames = div(Sm, pasLame * longueurLame)
  const vis = div(Sm * 2, pasLame * t.entraxe) / 450

  const lignes: Resultat['lignes'] = [
    { materiauId: 'lambourde-45x70', quantite: (n * L * 1.05) / 3 },
    { materiauId: 'plot-reglable', quantite: plots },
    {
      // le prix de la lame est proportionnel à sa longueur (prix de référence : lame de 2,4 m ou 3,6 m)
      materiauId: t.id,
      quantite: lames,
      facteur: longueurLame / t.longueurRef,
      detail: `lame de ${String(longueurLame).replace('.', ',')} m`,
      unite: 'lame',
    },
    { materiauId: 'vis-terrasse-450', quantite: vis },
  ]
  const hauteur = nb(e.hauteurSol)
  return {
    lignes: lignes.filter((x) => x.quantite > 0),
    infos: [
      { cle: 'surface', label: 'Surface de terrasse', valeur: S, unite: 'm²' },
      { cle: 'lambourdes', label: 'Lambourdes (nombre de files)', valeur: n },
      { cle: 'lambourdesM', label: 'Longueur de lambourdes', valeur: n * L * 1.05, unite: 'm' },
      { cle: 'vis', label: 'Vis inox', valeur: vis * 450 },
    ],
    avertissements: hauteur > 0 && hauteur < 10 ? ['Moins de 10 cm sous la structure : ventilation insuffisante.'] : [],
    notes: [
      'Terrasse de plain-pied (moins de 60 cm de haut) : pas d’autorisation en général ; au-delà, vérifiez le PLU en mairie.',
      'Sur sol naturel : géotextile et gravier non calculés.',
    ],
  }
}

export const ficheLambourdes: Fiche<EntreesLambourdes> = {
  id: 'terrasse-lambourdes',
  nom: 'Terrasse sur lambourdes',
  groupe: 'exterieur',
  icone: 'terrasse-lames',
  champs: [
    { type: 'nombre', id: 'longueur', label: 'Longueur (sens des lambourdes)', unite: 'm' },
    { type: 'nombre', id: 'largeur', label: 'Largeur', unite: 'm' },
    {
      type: 'choix', id: 'type', label: 'Type de lame',
      options: [
        { valeur: 'pin', label: 'Pin 21-23 mm' },
        { valeur: 'bois', label: 'Bois 27 mm+ / exotique' },
        { valeur: 'composite', label: 'Composite' },
      ],
    },
    { type: 'titre', id: 'options', label: 'Options' },
    { type: 'nombre', id: 'largeurLame', label: 'Largeur d’une lame', unite: 'm' },
    { type: 'nombre', id: 'longueurLame', label: 'Longueur d’une lame', unite: 'm' },
    { type: 'nombre', id: 'hauteurSol', label: 'Hauteur sous la structure (facultatif)', unite: 'cm' },
  ],
  defauts: () => ({ longueur: null, largeur: null, type: 'pin', largeurLame: 0.145, longueurLame: 3, hauteurSol: null, perte: null }),
  perteDefaut: () => PERTE,
  calculer: calculerLambourdes,
  materiaux: ['lambourde-45x70', 'plot-reglable', 'lame-pin-21', 'lame-bois-27', 'lame-composite', 'vis-terrasse-450'],
}

// ---------- 16) Terrasse en dalles sur plots ----------

export interface EntreesDallesPlots {
  longueur: number | null
  largeur: number | null
  dalle: Carreau
  perte: number | null
}

export const PRESETS_DALLE: Carreau[] = [
  { a: 40, b: 40 }, { a: 50, b: 50 }, { a: 60, b: 60 }, { a: 60, b: 120 },
]

export function calculerDallesPlots(e: EntreesDallesPlots, _pertes?: Pertes): Resultat {
  const L = nb(e.longueur), l = nb(e.largeur)
  const perte = perteEffective(e.perte, PERTE)
  const S = L * l
  const Sm = S * (1 + perte)
  const a = nb(e.dalle?.a) / 100, b = nb(e.dalle?.b) / 100
  const dalles = div(Sm, a * b)
  const plots = a > 0 && b > 0 && L > 0 && l > 0 ? (arrondiSup(L / a) + 1) * (arrondiSup(l / b) + 1) : 0

  return {
    lignes: [
      {
        // le prix de référence est celui d'une dalle de 60 x 60 cm ; il est proportionnel à la surface
        materiauId: 'dalle-gres-60x60',
        quantite: dalles,
        facteur: (a * b) / 0.36,
        detail: `dalle de ${nb(e.dalle?.a)} × ${nb(e.dalle?.b)} cm`,
        unite: 'dalle',
      },
      { materiauId: 'plot-reglable', quantite: plots },
    ].filter((x) => x.quantite > 0),
    infos: [
      { cle: 'surface', label: 'Surface de terrasse', valeur: S, unite: 'm²' },
      { cle: 'dalles', label: 'Nombre de dalles (avec marge)', valeur: dalles },
      { cle: 'plots', label: 'Nombre de plots', valeur: plots },
    ],
    avertissements: [],
    notes: ['Terrasse de plain-pied (moins de 60 cm de haut) : pas d’autorisation en général ; au-delà, vérifiez le PLU en mairie.'],
  }
}

export const ficheDallesPlots: Fiche<EntreesDallesPlots> = {
  id: 'terrasse-dalles',
  nom: 'Terrasse en dalles sur plots',
  groupe: 'exterieur',
  icone: 'terrasse-dalles',
  champs: [
    { type: 'nombre', id: 'longueur', label: 'Longueur', unite: 'm' },
    { type: 'nombre', id: 'largeur', label: 'Largeur', unite: 'm' },
    { type: 'carreau', id: 'dalle', label: 'Format de dalle', presets: PRESETS_DALLE },
  ],
  defauts: () => ({ longueur: null, largeur: null, dalle: { a: 60, b: 60 }, perte: null }),
  perteDefaut: () => PERTE,
  calculer: calculerDallesPlots,
  materiaux: ['dalle-gres-60x60', 'plot-reglable'],
}
