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

export function calculerCarrelage(e: EntreesCarrelage, pertes: Pertes): Resultat {
  const L = nb(e.longueur), l = nb(e.largeur)
  const perte = perteEffective(e.perte, perteCarrelageDefaut(e, pertes))
  const S = Math.max(0, L * l - nb(e.retire))
  const Sm = S * (1 + perte)
  const ca = nb(e.carreau?.a) / 100, cb = nb(e.carreau?.b) / 100 // en mètres
  const surfaceCarreau = ca * cb
  const nbCarreaux = div(Sm, surfaceCarreau)
  const surfCarton = nb(e.surfaceCarton)
  const cartons = div(Sm, surfCarton)
  const grandCote = Math.max(ca, cb) * 100 // cm
  const k = grandCote <= 30 ? 4 : grandCote <= 60 ? 5 : 7
  const j = nb(e.joint) / 1000
  const ep = nb(e.epaisseur) / 1000
  const jointKg = surfaceCarreau > 0 ? S * ((ca + cb) / surfaceCarreau) * j * ep * 1600 * 1.1 : 0
  const perimetre = 2 * (L + l)

  const lignes: Resultat['lignes'] = [
    {
      materiauId: 'carrelage-m2',
      quantite: cartons,
      facteur: surfCarton,
      detail: `carton de ${String(surfCarton).replace('.', ',')} m²`,
    },
    { materiauId: 'colle-carrelage', quantite: (Sm * k) / 25 },
    { materiauId: 'joint-carrelage', quantite: jointKg / 5 },
    { materiauId: 'croisillons', quantite: (nbCarreaux * 1.1) / 200 },
  ]
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
      { cle: 'carreaux', label: 'Nombre de carreaux', valeur: nbCarreaux },
      { cle: 'jointKg', label: 'Joint nécessaire', valeur: jointKg, unite: 'kg' },
    ],
    avertissements: surfCarton <= 0 ? ['Indiquez la surface par carton.'] : [],
  }
}

export const ficheCarrelage: Fiche<EntreesCarrelage> = {
  id: 'carrelage',
  nom: 'Carrelage sol',
  icone: '🟫',
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
