import { type Fiche, type Resultat, type Pertes, nb, perteEffective } from './commun'

export interface EntreesDalle {
  longueur: number | null
  largeur: number | null
  epaisseur: number | null
  mode: string
  dosage: string
  terrePlein: boolean
  herisson: boolean
  herissonEpaisseur: number | null
  isolant: boolean
  perte: number | null
}

/** Surface utile d'un panneau de treillis ST25C 6 x 2,4 m avec recouvrement de 0,32 m (≈ 11,8 m²) */
export const SURFACE_UTILE_TREILLIS = (6 - 0.32) * (2.4 - 0.32)

export function calculerDalle(e: EntreesDalle, pertes: Pertes): Resultat {
  const L = nb(e.longueur), l = nb(e.largeur)
  const perte = perteEffective(e.perte, pertes.maconnerie)
  const S = L * l
  const epaisseur = nb(e.epaisseur)
  const V = ((S * epaisseur) / 100) * (1 + perte)
  const perimetre = 2 * (L + l)
  const malaxer = e.mode !== 'pret'
  const dosage = e.dosage === '300' ? 300 : 350
  const cimentKg = V * dosage

  const lignes: Resultat['lignes'] = malaxer
    ? [
        { materiauId: 'ciment', quantite: cimentKg / 35 },
        { materiauId: 'sable', quantite: V * 0.4 },
        { materiauId: 'gravillons', quantite: V * 0.8 },
      ]
    : [{ materiauId: 'beton-pret', quantite: V }]

  lignes.push({ materiauId: 'treillis-st25c', quantite: S / SURFACE_UTILE_TREILLIS })
  if (e.terrePlein) lignes.push({ materiauId: 'film-polyane', quantite: (S * 1.2) / 100 })
  lignes.push({ materiauId: 'bande-peripherique', quantite: perimetre / 25 })
  if (e.terrePlein && e.herisson) {
    lignes.push({ materiauId: 'herisson', quantite: S * (nb(e.herissonEpaisseur) / 100) * 1.1 })
  }
  if (e.isolant) lignes.push({ materiauId: 'isolant-sous-dalle', quantite: S * 1.05 })

  const infos: Resultat['infos'] = [
    { cle: 'surface', label: 'Surface', valeur: S, unite: 'm²' },
    { cle: 'volume', label: 'Volume de béton (avec marge)', valeur: V, unite: 'm³' },
  ]
  if (malaxer) infos.push({ cle: 'cimentKg', label: 'Ciment', valeur: cimentKg, unite: 'kg' })

  return {
    lignes: lignes.filter((x) => x.quantite > 0),
    infos,
    avertissements:
      epaisseur > 0 && epaisseur < 12 ? ['DTU 13.3 : 12 cm minimum en maison individuelle'] : [],
  }
}

export const ficheDalle: Fiche<EntreesDalle> = {
  id: 'dalle-beton',
  nom: 'Dalle béton',
  icone: 'dalle',
  champs: [
    { type: 'nombre', id: 'longueur', label: 'Longueur', unite: 'm' },
    { type: 'nombre', id: 'largeur', label: 'Largeur', unite: 'm' },
    { type: 'nombre', id: 'epaisseur', label: 'Épaisseur', unite: 'cm' },
    { type: 'choix', id: 'mode', label: 'Béton', options: [{ valeur: 'malaxer', label: 'À malaxer' }, { valeur: 'pret', label: "Prêt à l'emploi" }] },
    {
      type: 'choix', id: 'dosage', label: 'Dosage du ciment',
      options: [{ valeur: '350', label: '350 kg/m³' }, { valeur: '300', label: '300 kg/m³' }],
      visible: (e: EntreesDalle) => e.mode !== 'pret',
    },
    { type: 'oui_non', id: 'terrePlein', label: 'Sur terre-plein (ajoute le film polyane)' },
    { type: 'oui_non', id: 'herisson', label: 'Hérisson en gravier 20/40', visible: (e: EntreesDalle) => e.terrePlein },
    { type: 'nombre', id: 'herissonEpaisseur', label: 'Épaisseur du hérisson', unite: 'cm', visible: (e: EntreesDalle) => e.terrePlein && e.herisson },
    { type: 'oui_non', id: 'isolant', label: 'Isolant sous dalle' },
  ],
  defauts: () => ({
    longueur: null, largeur: null, epaisseur: 12, mode: 'malaxer', dosage: '350', terrePlein: true,
    herisson: false, herissonEpaisseur: 12, isolant: false, perte: null,
  }),
  perteDefaut: (_e, p) => p.maconnerie,
  calculer: calculerDalle,
  materiaux: ['ciment', 'sable', 'gravillons', 'beton-pret', 'treillis-st25c', 'film-polyane', 'bande-peripherique', 'herisson', 'isolant-sous-dalle'],
}
