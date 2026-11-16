import {
  type Fiche, type Resultat, type Pertes, type Ouvertures, OUVERTURES_DEFAUT, FORMATS_PLAQUE, TYPES_PLAQUE,
  idPlaque, surfacePlaque, nb, div, arrondiSup, perteEffective, surfaceOuvertures, nbPortes,
} from './commun'

export interface EntreesCloison {
  longueur: number | null
  hauteur: number | null
  ouvertures: Ouvertures
  faces: string
  peaux: string
  format: string
  type: string
  isolant: boolean
  resiliente: boolean
  perte: number | null
}

export function calculerCloison(e: EntreesCloison, pertes: Pertes): Resultat {
  const L = nb(e.longueur), H = nb(e.hauteur)
  const perte = perteEffective(e.perte, pertes.placo)
  const faces = e.faces === '1' ? 1 : 2
  const peaux = e.peaux === '2' ? 2 : 1
  const S = Math.max(0, L * H - surfaceOuvertures(e.ouvertures))
  const A = S * faces * peaux
  const Am = A * (1 + perte)
  const portes = nbPortes(e.ouvertures)
  const montants = L > 0 && H > 0 ? (arrondiSup(L / 0.6) + 1 + 2 * portes) * arrondiSup(H / 3) : 0

  const lignes: Resultat['lignes'] = [
    { materiauId: idPlaque(e.type, e.format), quantite: div(Am, surfacePlaque(e.format)) },
    { materiauId: 'montant-m48', quantite: montants },
    { materiauId: 'rail-r48', quantite: (2 * L) / 3 },
    { materiauId: peaux === 2 ? 'vis-35' : 'vis-25', quantite: (Am * 15) / 1000 },
    { materiauId: 'bande-joint', quantite: (Am * 1.5) / 150 },
    { materiauId: 'enduit-poudre', quantite: (Am * 0.5) / 25 },
  ]
  if (e.isolant) lignes.push({ materiauId: 'isolant-rouleau', quantite: (S * (1 + perte)) / 9 })
  if (e.resiliente) lignes.push({ materiauId: 'bande-resiliente', quantite: (2 * L) / 30 })

  return {
    lignes: lignes.filter((x) => x.quantite > 0),
    infos: [
      { cle: 'surface', label: 'Surface de cloison', valeur: S, unite: 'm²' },
      { cle: 'surfacePlaques', label: 'Surface de plaques (avec marge)', valeur: Am, unite: 'm²' },
    ],
    avertissements: [],
  }
}

export const ficheCloison: Fiche<EntreesCloison> = {
  id: 'cloison-placo',
  nom: 'Cloison placo',
  icone: '🧱',
  champs: [
    { type: 'nombre', id: 'longueur', label: 'Longueur', unite: 'm' },
    { type: 'nombre', id: 'hauteur', label: 'Hauteur', unite: 'm' },
    { type: 'ouvertures', id: 'ouvertures', label: 'Ouvertures (portes, fenêtres)' },
    { type: 'choix', id: 'faces', label: 'Faces à plaquer', options: [{ valeur: '1', label: '1 face' }, { valeur: '2', label: '2 faces' }] },
    { type: 'choix', id: 'peaux', label: 'Peaux par face', options: [{ valeur: '1', label: '1 peau' }, { valeur: '2', label: '2 peaux' }] },
    { type: 'choix', id: 'format', label: 'Format des plaques', options: FORMATS_PLAQUE.map((f) => ({ valeur: f.valeur, label: f.label })) },
    { type: 'choix', id: 'type', label: 'Type de plaque', options: TYPES_PLAQUE },
    { type: 'oui_non', id: 'isolant', label: 'Ajouter un isolant' },
    { type: 'oui_non', id: 'resiliente', label: 'Ajouter une bande résiliente' },
  ],
  defauts: () => ({
    longueur: null, hauteur: 2.5, ouvertures: { ...OUVERTURES_DEFAUT }, faces: '2', peaux: '1',
    format: '250', type: 'standard', isolant: false, resiliente: false, perte: null,
  }),
  perteDefaut: (_e, p) => p.placo,
  calculer: calculerCloison,
  materiaux: [
    ...['standard', 'hydro', 'feu'].flatMap((t) => ['250', '240', '300'].map((f) => idPlaque(t, f))),
    'montant-m48', 'rail-r48', 'vis-25', 'vis-35', 'bande-joint', 'enduit-poudre', 'isolant-rouleau', 'bande-resiliente',
  ],
}
