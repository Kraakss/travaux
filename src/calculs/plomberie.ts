// Plomberie : alimentation PER et évacuation PVC, par appareil.
import { type Fiche, type Resultat, type Pertes, nb, arrondiSup } from './commun'

export interface EntreesPlomberie {
  lavabos: number
  wc: number
  douches: number
  baignoires: number
  eviers: number
  lavelinge: number
  lavevaisselle: number
  distanceAlim: number | null
  distanceEvac: number | null
}

/** arrivées d'eau, diamètre du PER (12 ou 16) et diamètre d'évacuation (PVC) de chaque appareil */
export const APPAREILS: { id: keyof EntreesPlomberie; label: string; arrivees: number; per: 12 | 16; evac: 32 | 40 | 100 }[] = [
  { id: 'lavabos', label: 'Lavabo', arrivees: 2, per: 12, evac: 32 },
  { id: 'wc', label: 'WC', arrivees: 1, per: 12, evac: 100 },
  { id: 'douches', label: 'Douche', arrivees: 2, per: 16, evac: 40 },
  { id: 'baignoires', label: 'Baignoire', arrivees: 2, per: 16, evac: 40 },
  { id: 'eviers', label: 'Évier', arrivees: 2, per: 16, evac: 40 },
  { id: 'lavelinge', label: 'Lave-linge', arrivees: 1, per: 16, evac: 40 },
  { id: 'lavevaisselle', label: 'Lave-vaisselle', arrivees: 1, per: 16, evac: 40 },
]

export function calculerPlomberie(e: EntreesPlomberie, _pertes?: Pertes): Resultat {
  const dAlim = nb(e.distanceAlim), dEvac = nb(e.distanceEvac)
  const arrivees = { 12: 0, 16: 0 }
  const appareilsParDiametre: Record<number, number> = { 32: 0, 40: 0, 100: 0 }
  let total = 0, appareils = 0, horsWc = 0
  for (const a of APPAREILS) {
    const n = Math.floor(nb(e[a.id]))
    arrivees[a.per] += n * a.arrivees
    appareilsParDiametre[a.evac] += n
    total += n * a.arrivees
    appareils += n
    if (a.id !== 'wc') horsWc += n
  }

  const lignes: Resultat['lignes'] = [
    { materiauId: 'per-12', quantite: (arrivees[12] * dAlim) / 25 },
    { materiauId: 'per-16', quantite: (arrivees[16] * dAlim) / 25 },
    { materiauId: 'robinet-arret', quantite: total },
    { materiauId: 'raccord-per', quantite: total * 2 },
  ]
  for (const d of [32, 40, 100]) {
    lignes.push({ materiauId: `tube-pvc-${d}`, quantite: (appareilsParDiametre[d] * dEvac) / 2 })
    lignes.push({ materiauId: `coude-pvc-${d}`, quantite: appareilsParDiametre[d] * 2 })
  }
  lignes.push({ materiauId: 'siphon-bonde', quantite: horsWc })
  lignes.push({ materiauId: 'colle-pvc', quantite: arrondiSup(appareils / 8) })

  const notes = [
    'Pente des évacuations : de 1 à 3 cm par mètre (DTU 60.11)' +
      (dEvac > 0 ? `, soit une chute de ${Math.round(dEvac * 1)} à ${Math.round(dEvac * 3)} cm sur ${String(dEvac).replace('.', ',')} m.` : '.'),
    'Hors calcul : chauffe-eau, groupe de sécurité et appareils.',
  ]
  return {
    lignes: lignes.filter((x) => x.quantite > 0),
    infos: [
      { cle: 'appareils', label: 'Appareils', valeur: appareils },
      { cle: 'arrivees', label: 'Arrivées d’eau', valeur: total },
      { cle: 'per12', label: 'Tube PER Ø 12', valeur: arrivees[12] * dAlim, unite: 'm' },
      { cle: 'per16', label: 'Tube PER Ø 16', valeur: arrivees[16] * dAlim, unite: 'm' },
    ],
    avertissements: [],
    notes,
  }
}

export const fichePlomberie: Fiche<EntreesPlomberie> = {
  id: 'plomberie',
  nom: 'Plomberie',
  groupe: 'reseaux',
  icone: 'plomberie',
  champs: [
    {
      type: 'compteurs', id: 'appareils', label: 'Appareils à raccorder',
      items: APPAREILS.map((a) => ({ id: a.id as string, label: a.label })),
    },
    { type: 'titre', id: 'options', label: 'Options' },
    { type: 'nombre', id: 'distanceAlim', label: 'Distance moyenne d’alimentation', unite: 'm', aide: 'Estimation, modifiable' },
    { type: 'nombre', id: 'distanceEvac', label: 'Distance moyenne d’évacuation', unite: 'm', aide: 'Estimation, modifiable' },
  ],
  defauts: () => ({
    lavabos: 0, wc: 0, douches: 0, baignoires: 0, eviers: 0, lavelinge: 0, lavevaisselle: 0, distanceAlim: 5, distanceEvac: 3,
  }),
  calculer: calculerPlomberie,
  materiaux: [
    'per-12', 'per-16', 'robinet-arret', 'raccord-per', 'tube-pvc-32', 'tube-pvc-40', 'tube-pvc-100',
    'coude-pvc-32', 'coude-pvc-40', 'coude-pvc-100', 'siphon-bonde', 'colle-pvc',
  ],
}
