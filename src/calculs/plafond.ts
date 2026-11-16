import {
  type Fiche, type Resultat, type Pertes, FORMATS_PLAQUE, TYPES_PLAQUE,
  idPlaque, surfacePlaque, nb, div, perteEffective,
} from './commun'

export interface EntreesPlafond {
  longueur: number | null
  largeur: number | null
  format: string
  type: string
  enduit: string
  isolant: boolean
  perte: number | null
}

export function calculerPlafond(e: EntreesPlafond, pertes: Pertes): Resultat {
  const L = nb(e.longueur), l = nb(e.largeur)
  const perte = perteEffective(e.perte, pertes.placo)
  const S = L * l
  const Sm = S * (1 + perte)
  const perimetre = 2 * (L + l)
  const suspentes = Sm * 1.75

  const lignes: Resultat['lignes'] = [
    { materiauId: idPlaque(e.type, e.format), quantite: div(Sm, surfacePlaque(e.format)) },
    { materiauId: 'fourrure-f530', quantite: Sm / 0.55 / 3 },
    { materiauId: 'suspente', quantite: suspentes },
    { materiauId: 'cheville', quantite: suspentes },
    { materiauId: 'rail-rive', quantite: perimetre / 3 },
    { materiauId: 'vis-25', quantite: (Sm * 15) / 1000 },
    { materiauId: 'bande-joint', quantite: (Sm * 1.5) / 150 },
    { materiauId: e.enduit === 'pate' ? 'enduit-pate' : 'enduit-poudre', quantite: (Sm * 0.5) / 25 },
  ]
  if (e.isolant) lignes.push({ materiauId: 'isolant-rouleau', quantite: Sm / 9 })

  return {
    lignes: lignes.filter((x) => x.quantite > 0),
    infos: [
      { cle: 'surface', label: 'Surface', valeur: S, unite: 'm²' },
      { cle: 'surfaceMarge', label: 'Surface avec marge', valeur: Sm, unite: 'm²' },
    ],
    avertissements: [],
  }
}

export const fichePlafond: Fiche<EntreesPlafond> = {
  id: 'plafond-placo',
  nom: 'Plafond placo',
  icone: '🔲',
  champs: [
    { type: 'nombre', id: 'longueur', label: 'Longueur', unite: 'm' },
    { type: 'nombre', id: 'largeur', label: 'Largeur', unite: 'm' },
    { type: 'choix', id: 'format', label: 'Format des plaques', options: FORMATS_PLAQUE.map((f) => ({ valeur: f.valeur, label: f.label })) },
    { type: 'choix', id: 'type', label: 'Type de plaque', options: TYPES_PLAQUE },
    { type: 'choix', id: 'enduit', label: 'Enduit à joint', options: [{ valeur: 'poudre', label: 'En poudre' }, { valeur: 'pate', label: 'En pâte' }] },
    { type: 'oui_non', id: 'isolant', label: 'Ajouter un isolant' },
  ],
  defauts: () => ({ longueur: null, largeur: null, format: '250', type: 'standard', enduit: 'poudre', isolant: false, perte: null }),
  perteDefaut: (_e, p) => p.placo,
  calculer: calculerPlafond,
  materiaux: [
    ...['standard', 'hydro', 'feu'].flatMap((t) => ['250', '240', '300'].map((f) => idPlaque(t, f))),
    'fourrure-f530', 'suspente', 'cheville', 'rail-rive', 'vis-25', 'bande-joint', 'enduit-poudre', 'enduit-pate', 'isolant-rouleau',
  ],
}
