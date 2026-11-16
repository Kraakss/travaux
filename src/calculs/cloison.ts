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
  entraxe: string
  doubler: boolean
  format: string
  type: string
  isolant: boolean
  resiliente: boolean
  perte: number | null
}

/** Hauteur maximale (m) d'une cloison sur ossature M48 */
export function hauteurLimite(peaux: number, entraxe: number, doubles: boolean): number {
  const simple = entraxe === 0.4
  if (peaux === 1) return doubles ? (simple ? 3.45 : 3.05) : simple ? 2.8 : 2.5
  return doubles ? (simple ? 4.15 : 3.75) : simple ? 3.45 : 3.0
}

export function calculerCloison(e: EntreesCloison, pertes: Pertes): Resultat {
  const L = nb(e.longueur), H = nb(e.hauteur)
  const perte = perteEffective(e.perte, pertes.placo)
  const faces = e.faces === '1' ? 1 : 2
  const peaux = e.peaux === '2' ? 2 : 1
  const entraxe = e.entraxe === '0.4' ? 0.4 : 0.6
  const doubler = Boolean(e.doubler)
  const S = Math.max(0, L * H - surfaceOuvertures(e.ouvertures))
  const A = S * faces * peaux // surface de plaques sans perte
  const Am = A * (1 + perte)
  const portes = nbPortes(e.ouvertures)
  const montants =
    L > 0 && H > 0 ? (arrondiSup(L / entraxe) + 1 + 2 * portes) * arrondiSup(H / 3) * (doubler ? 2 : 1) : 0
  const bandeM = A * 1.4

  const lignes: Resultat['lignes'] = [
    { materiauId: idPlaque(e.type, e.format), quantite: div(Am, surfacePlaque(e.format)) },
    { materiauId: 'montant-m48', quantite: montants },
    { materiauId: 'rail-r48', quantite: (2 * L) / 3 },
    { materiauId: peaux === 2 ? 'vis-35' : 'vis-25', quantite: (Am * 15) / 1000 },
    { materiauId: 'bande-joint', quantite: bandeM / 150 },
    { materiauId: 'enduit-poudre', quantite: (A * 0.5) / 25 },
  ]
  if (e.isolant) lignes.push({ materiauId: 'isolant-rouleau', quantite: (S * (1 + perte)) / 9 })
  if (e.resiliente) lignes.push({ materiauId: 'bande-resiliente', quantite: (2 * L) / 30 })

  const avertissements: string[] = []
  const limite = hauteurLimite(peaux, entraxe, doubler)
  if (H > limite) {
    const conseils: string[] = []
    if (entraxe !== 0.4) conseils.push("passer à l'entraxe 0,40 m")
    if (!doubler) conseils.push('doubler les montants')
    avertissements.push(
      `Hauteur au-dessus de la limite pour cette ossature (M48) : ${String(limite).replace('.', ',')} m maximum.` +
        (conseils.length ? ` Essayez de ${conseils.join(' ou de ')}.` : ' Prévoyez une ossature plus large (M70 ou M100).'),
    )
  }

  return {
    lignes: lignes.filter((x) => x.quantite > 0),
    infos: [
      { cle: 'surface', label: 'Surface de cloison', valeur: S, unite: 'm²' },
      { cle: 'surfacePlaques', label: 'Surface de plaques (avec marge)', valeur: Am, unite: 'm²' },
      { cle: 'bandeM', label: 'Bande à joint', valeur: bandeM, unite: 'm' },
    ],
    avertissements,
  }
}

export const ficheCloison: Fiche<EntreesCloison> = {
  id: 'cloison-placo',
  nom: 'Cloison placo',
  icone: 'cloison',
  champs: [
    { type: 'nombre', id: 'longueur', label: 'Longueur', unite: 'm' },
    { type: 'nombre', id: 'hauteur', label: 'Hauteur', unite: 'm' },
    { type: 'ouvertures', id: 'ouvertures', label: 'Ouvertures (portes, fenêtres)' },
    { type: 'choix', id: 'faces', label: 'Faces à plaquer', options: [{ valeur: '1', label: '1 face' }, { valeur: '2', label: '2 faces' }] },
    { type: 'choix', id: 'peaux', label: 'Peaux par face', options: [{ valeur: '1', label: '1 peau' }, { valeur: '2', label: '2 peaux' }] },
    { type: 'choix', id: 'entraxe', label: 'Entraxe des montants', options: [{ valeur: '0.6', label: '0,60 m' }, { valeur: '0.4', label: '0,40 m' }] },
    { type: 'oui_non', id: 'doubler', label: 'Doubler les montants' },
    { type: 'choix', id: 'format', label: 'Format des plaques', options: FORMATS_PLAQUE.map((f) => ({ valeur: f.valeur, label: f.label })) },
    { type: 'choix', id: 'type', label: 'Type de plaque', options: TYPES_PLAQUE },
    { type: 'oui_non', id: 'isolant', label: 'Ajouter un isolant' },
    { type: 'oui_non', id: 'resiliente', label: 'Ajouter une bande résiliente' },
  ],
  defauts: () => ({
    longueur: null, hauteur: 2.5, ouvertures: { ...OUVERTURES_DEFAUT }, faces: '2', peaux: '1',
    entraxe: '0.6', doubler: false, format: '250', type: 'standard', isolant: false, resiliente: false, perte: null,
  }),
  perteDefaut: (_e, p) => p.placo,
  calculer: calculerCloison,
  materiaux: [
    ...['standard', 'hydro', 'feu'].flatMap((t) => ['250', '240', '300'].map((f) => idPlaque(t, f))),
    'montant-m48', 'rail-r48', 'vis-25', 'vis-35', 'bande-joint', 'enduit-poudre', 'isolant-rouleau', 'bande-resiliente',
  ],
}
