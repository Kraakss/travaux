import {
  type Fiche, type Resultat, type Pertes, type Carreau, type Ouvertures, OUVERTURES_DEFAUT,
  nb, div, perteEffective, nbPortes, PERIMETRE_PORTE,
} from './commun'

export interface EntreesCarrelage {
  longueur: number | null
  largeur: number | null
  retire: number | null
  carreau: Carreau
  surfaceCarton: number | null
  joint: number | null
  epaisseur: number | null
  pose: string
  primaire: boolean
  plinthes: boolean
  ouvertures: Ouvertures
  ragreage: boolean
  ragreageEpaisseur: number | null
  perte: number | null
}

export const PRESETS_CARREAU: Carreau[] = [
  { a: 30, b: 30 }, { a: 45, b: 45 }, { a: 60, b: 60 }, { a: 60, b: 120 },
]

export function perteCarrelageDefaut(e: Pick<EntreesCarrelage, 'pose'>, p: Pertes): number {
  return e.pose === 'diagonale' ? p.carrelageDiagonale : p.carrelageDroite
}

/** Consommation de colle (kg/m²) selon la surface du carreau (cm²) */
export function consoColle(surfaceCarreauCm2: number): number {
  if (surfaceCarreauCm2 <= 500) return 4
  if (surfaceCarreauCm2 <= 1200) return 5
  if (surfaceCarreauCm2 <= 3600) return 7
  return 8
}

/** Données des carreaux, communes au carrelage de sol et au carrelage mural. */
export interface ParamCarreaux {
  /** surface nette à carreler (m²) */
  S: number
  /** surface avec marge de perte (m²) */
  Sm: number
  carreau: Carreau
  surfaceCarton: number | null
  /** largeur de joint (mm) */
  joint: number | null
  /** épaisseur du carreau (mm) */
  epaisseur: number | null
}

/** Cartons, colle, joint et croisillons : mêmes formules pour le sol et pour le mur. */
export function calculCarreaux(p: ParamCarreaux) {
  const { S, Sm } = p
  const ca = nb(p.carreau?.a) / 100, cb = nb(p.carreau?.b) / 100 // en mètres
  const surfaceCarreau = ca * cb
  const nbCarreaux = div(Sm, surfaceCarreau)
  const surfCarton = nb(p.surfaceCarton)
  const cartons = div(Sm, surfCarton)
  const k = consoColle(nb(p.carreau?.a) * nb(p.carreau?.b))
  const colleKg = Sm * k
  const j = nb(p.joint) / 1000
  const ep = nb(p.epaisseur) / 1000
  const jointKg = surfaceCarreau > 0 ? S * ((ca + cb) / surfaceCarreau) * j * ep * 1600 * 1.1 : 0

  const lignes: Resultat['lignes'] = [
    {
      materiauId: 'carrelage-m2',
      quantite: cartons,
      facteur: surfCarton,
      detail: `carton de ${String(surfCarton).replace('.', ',')} m²`,
    },
    { materiauId: 'colle-carrelage', quantite: colleKg / 25 },
    { materiauId: 'joint-carrelage', quantite: jointKg / 5 },
    { materiauId: 'croisillons', quantite: (nbCarreaux * 1.1) / 200 },
  ]
  return {
    lignes,
    colleKg,
    jointKg,
    nbCarreaux,
    avertissements: surfCarton <= 0 ? ['Indiquez la surface par carton.'] : [],
    notes: nb(p.carreau?.a) * nb(p.carreau?.b) > 500 ? ['Double encollage recommandé au-dessus de 500 cm²'] : [],
  }
}

export function calculerCarrelage(e: EntreesCarrelage, pertes: Pertes): Resultat {
  const L = nb(e.longueur), l = nb(e.largeur)
  const perte = perteEffective(e.perte, perteCarrelageDefaut(e, pertes))
  const S = Math.max(0, L * l - nb(e.retire))
  const Sm = S * (1 + perte)
  const perimetre = 2 * (L + l)
  const c = calculCarreaux({ S, Sm, carreau: e.carreau, surfaceCarton: e.surfaceCarton, joint: e.joint, epaisseur: e.epaisseur })

  const lignes = [...c.lignes]
  if (e.primaire) lignes.push({ materiauId: 'primaire-accroche', quantite: (S * 0.15) / 5 })
  if (e.plinthes)
    lignes.push({
      materiauId: 'plinthe-carrelage',
      quantite: Math.max(0, perimetre - PERIMETRE_PORTE * nbPortes(e.ouvertures)) / 0.6,
    })
  if (e.ragreage) lignes.push({ materiauId: 'ragreage', quantite: (S * 1.5 * nb(e.ragreageEpaisseur)) / 25 })

  return {
    lignes: lignes.filter((x) => x.quantite > 0),
    infos: [
      { cle: 'surface', label: 'Surface à carreler', valeur: S, unite: 'm²' },
      { cle: 'surfaceMarge', label: 'Surface avec marge', valeur: Sm, unite: 'm²' },
      { cle: 'carreaux', label: 'Nombre de carreaux', valeur: c.nbCarreaux },
      { cle: 'colleKg', label: 'Colle nécessaire', valeur: c.colleKg, unite: 'kg' },
      { cle: 'jointKg', label: 'Joint nécessaire', valeur: c.jointKg, unite: 'kg' },
    ],
    avertissements: c.avertissements,
    notes: c.notes,
  }
}

export const ficheCarrelage: Fiche<EntreesCarrelage> = {
  id: 'carrelage',
  nom: 'Carrelage sol',
  groupe: 'sols',
  icone: 'carrelage',
  champs: [
    { type: 'nombre', id: 'longueur', label: 'Longueur', unite: 'm' },
    { type: 'nombre', id: 'largeur', label: 'Largeur', unite: 'm' },
    { type: 'nombre', id: 'retire', label: 'Surface à retirer (meuble, baignoire…)', unite: 'm²' },
    { type: 'carreau', id: 'carreau', label: 'Taille du carreau' },
    { type: 'nombre', id: 'surfaceCarton', label: 'Surface par carton', unite: 'm²' },
    { type: 'nombre', id: 'joint', label: 'Largeur de joint', unite: 'mm' },
    { type: 'nombre', id: 'epaisseur', label: 'Épaisseur du carreau', unite: 'mm' },
    { type: 'choix', id: 'pose', label: 'Type de pose', options: [{ valeur: 'droite', label: 'Pose droite' }, { valeur: 'diagonale', label: 'Pose diagonale' }] },
    { type: 'titre', id: 't1', label: 'Options' },
    { type: 'oui_non', id: 'primaire', label: "Primaire d'accroche" },
    { type: 'oui_non', id: 'plinthes', label: 'Plinthes' },
    { type: 'ouvertures', id: 'ouvertures', label: 'Portes (à retirer des plinthes)', portesSeulement: true, visible: (e: EntreesCarrelage) => e.plinthes },
    { type: 'oui_non', id: 'ragreage', label: 'Ragréage' },
    { type: 'nombre', id: 'ragreageEpaisseur', label: 'Épaisseur du ragréage', unite: 'mm', visible: (e: EntreesCarrelage) => e.ragreage },
  ],
  defauts: () => ({
    longueur: null, largeur: null, retire: null, carreau: { a: 60, b: 60 }, surfaceCarton: 1.44,
    joint: 3, epaisseur: 10, pose: 'droite', primaire: false, plinthes: false,
    ouvertures: { ...OUVERTURES_DEFAUT }, ragreage: false, ragreageEpaisseur: 3, perte: null,
  }),
  perteDefaut: perteCarrelageDefaut,
  calculer: calculerCarrelage,
  materiaux: ['carrelage-m2', 'colle-carrelage', 'joint-carrelage', 'croisillons', 'primaire-accroche', 'plinthe-carrelage', 'ragreage'],
}
