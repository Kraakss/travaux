// Électricité, pièce par pièce (estimation inspirée de la NF C 15-100 ; à faire valider par un électricien).
import { type Fiche, type Resultat, type Pertes, nb, arrondiSup } from './commun'

export interface EntreesElectricite {
  piece: string
  surface: number | null
  section: string
  speciaux: string
  tableau: boolean
  metresPrise: number | null
  metresPointLumineux: number | null
  metresSpecial: number | null
}

export const TYPES_PIECE = [
  { valeur: 'sejour', label: 'Séjour' },
  { valeur: 'chambre', label: 'Chambre' },
  { valeur: 'cuisine', label: 'Cuisine' },
  { valeur: 'sdb', label: 'Salle de bain' },
  { valeur: 'wc', label: 'WC ou 4 m² et moins' },
  { valeur: 'autre', label: 'Autre (plus de 4 m²)' },
]

export const CIRCUITS_SPECIAUX = [
  { valeur: 'lave-linge', label: 'Lave-linge' },
  { valeur: 'lave-vaisselle', label: 'Lave-vaisselle' },
  { valeur: 'four', label: 'Four' },
  { valeur: 'chauffe-eau', label: 'Chauffe-eau' },
  { valeur: 'plaque', label: 'Plaque de cuisson (32 A, 6 mm²)' },
]

/** Nombre de prises 2P+T selon la pièce */
export function nombrePrises(piece: string, S: number): number {
  switch (piece) {
    case 'sejour':
      return S <= 28 ? Math.max(5, arrondiSup(S / 4)) : Math.max(7, arrondiSup(S / 4))
    case 'chambre':
      return 3
    case 'cuisine':
      return S <= 4 ? 3 : 6
    case 'sdb':
      return 1
    case 'wc':
      return 0
    default:
      return S > 28 ? 3 : 1
  }
}

export function calculerElectricite(e: EntreesElectricite, _pertes?: Pertes): Resultat {
  const S = nb(e.surface)
  const piece = TYPES_PIECE.some((t) => t.valeur === e.piece) ? e.piece : 'sejour'
  const prises = nombrePrises(piece, S)
  const points = 1
  const interrupteurs = 1
  const rj45 = piece === 'sejour' ? 2 : piece === 'chambre' ? 1 : 0
  const speciaux = (e.speciaux ?? '').split(',').filter((s) => CIRCUITS_SPECIAUX.some((c) => c.valeur === s))
  const plaque = speciaux.includes('plaque') ? 1 : 0
  const speciaux25 = speciaux.length - plaque
  const section15 = e.section === '1.5'
  const parCircuit = section15 ? 8 : 12
  const mPrise = e.metresPrise ?? 6, mPoint = e.metresPointLumineux ?? 8, mSpecial = e.metresSpecial ?? 10

  // circuits : prises hors cuisine, cuisine dédiée, éclairage, circuits spécialisés
  const cuisine = piece === 'cuisine'
  const circuitsPrises = cuisine ? 0 : arrondiSup(prises / parCircuit)
  const circuitsCuisine = cuisine ? 1 : 0
  const circuitsEclairage = arrondiSup(points / 8)
  const circuits = circuitsPrises + circuitsCuisine + circuitsEclairage + speciaux.length

  // câbles (en mètres) : les prises de cuisine sont toujours en 2,5 mm²
  const prises25 = section15 && !cuisine ? 0 : prises
  const prises15 = section15 && !cuisine ? prises : 0
  const metres25 = prises25 * mPrise + speciaux25 * mSpecial
  const metres15 = points * mPoint + prises15 * mPrise
  const metres6 = plaque * 15

  const lignes: Resultat['lignes'] = [
    { materiauId: 'prise-2pt', quantite: prises },
    { materiauId: 'interrupteur', quantite: interrupteurs },
    { materiauId: 'boite-encastrement', quantite: prises + interrupteurs + rj45 },
    { materiauId: 'boite-dcl', quantite: points },
    { materiauId: 'cable-3g25-100', quantite: metres25 / 100 },
    { materiauId: 'cable-3g15-100', quantite: metres15 / 100 },
    { materiauId: 'cable-3g6-m', quantite: metres6 },
    { materiauId: 'gaine-icta-100', quantite: (metres25 + metres15) / 100 },
    { materiauId: 'prise-rj45', quantite: rj45 },
    { materiauId: 'cable-cat6-100', quantite: (rj45 * 12) / 100 },
    { materiauId: 'disjoncteur', quantite: circuits },
  ]
  if (e.tableau) lignes.push({ materiauId: 'tableau-3-rangees', quantite: 1 })

  return {
    lignes: lignes.filter((x) => x.quantite > 0),
    infos: [
      { cle: 'prises', label: 'Prises 2P+T', valeur: prises },
      { cle: 'rj45', label: 'Prises RJ45', valeur: rj45 },
      { cle: 'points', label: 'Points lumineux', valeur: points },
      { cle: 'interrupteurs', label: 'Interrupteurs', valeur: interrupteurs },
      { cle: 'circuits', label: 'Circuits (disjoncteurs)', valeur: circuits },
      { cle: 'cable25', label: 'Câble 3G2,5', valeur: metres25, unite: 'm' },
      { cle: 'cable15', label: 'Câble 3G1,5', valeur: metres15, unite: 'm' },
      ...(metres6 > 0 ? [{ cle: 'cable6', label: 'Câble 3G6', valeur: metres6, unite: 'm' }] : []),
    ],
    avertissements: [],
    notes: ['Estimation, pas un plan d’installation : faites-la valider par un électricien.'],
  }
}

export const ficheElectricite: Fiche<EntreesElectricite> = {
  id: 'electricite',
  nom: 'Électricité (une pièce)',
  groupe: 'reseaux',
  icone: 'electricite',
  champs: [
    { type: 'choix', id: 'piece', label: 'Type de pièce', options: TYPES_PIECE },
    { type: 'nombre', id: 'surface', label: 'Surface de la pièce', unite: 'm²' },
    {
      type: 'choix', id: 'section', label: 'Section des prises',
      options: [
        { valeur: '1.5', label: '1,5 mm² (8 prises, 16 A)' },
        { valeur: '2.5', label: '2,5 mm² (12 prises, 20 A)' },
      ],
    },
    { type: 'multi', id: 'speciaux', label: 'Circuits spécialisés', options: CIRCUITS_SPECIAUX },
    { type: 'oui_non', id: 'tableau', label: 'Tableau électrique pré-équipé' },
    { type: 'titre', id: 'options', label: 'Options' },
    { type: 'nombre', id: 'metresPrise', label: 'Câble par prise', unite: 'm', aide: 'Estimation, modifiable' },
    { type: 'nombre', id: 'metresPointLumineux', label: 'Câble par point lumineux', unite: 'm', aide: 'Estimation, modifiable' },
    { type: 'nombre', id: 'metresSpecial', label: 'Câble par circuit spécialisé', unite: 'm', aide: 'Estimation, modifiable (15 m fixes en 6 mm²)' },
  ],
  defauts: () => ({
    piece: 'sejour', surface: null, section: '2.5', speciaux: '', tableau: false,
    metresPrise: 6, metresPointLumineux: 8, metresSpecial: 10,
  }),
  calculer: calculerElectricite,
  materiaux: [
    'prise-2pt', 'interrupteur', 'boite-encastrement', 'boite-dcl', 'cable-3g25-100', 'cable-3g15-100', 'cable-3g6-m',
    'gaine-icta-100', 'prise-rj45', 'cable-cat6-100', 'disjoncteur', 'tableau-3-rangees',
  ],
}
