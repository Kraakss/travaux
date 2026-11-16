import { type Fiche, type Resultat, type Pertes, nb, perteEffective } from './commun'

export interface EntreesDalle {
  longueur: number | null
  largeur: number | null
  epaisseur: number | null
  mode: string
  terrePlein: boolean
  herisson: boolean
  isolant: boolean
  perte: number | null
}

export function calculerDalle(e: EntreesDalle, pertes: Pertes): Resultat {
  const L = nb(e.longueur), l = nb(e.largeur)
  const perte = perteEffective(e.perte, pertes.maconnerie)
  const S = L * l
  const V = ((S * nb(e.epaisseur)) / 100) * (1 + perte)
  const perimetre = 2 * (L + l)
  const malaxer = e.mode !== 'pret'

  const lignes: Resultat['lignes'] = malaxer
    ? [
        { materiauId: 'ciment', quantite: (V * 350) / 35 },
        { materiauId: 'sable', quantite: V * 0.4 },
        { materiauId: 'gravillons', quantite: V * 0.8 },
      ]
    : [{ materiauId: 'beton-pret', quantite: V }]

  lignes.push({ materiauId: 'treillis-st25c', quantite: (S * 1.15) / 14.4 })
  if (e.terrePlein) lignes.push({ materiauId: 'film-polyane', quantite: (S * 1.2) / 100 })
  lignes.push({ materiauId: 'bande-peripherique', quantite: perimetre / 25 })
  if (e.terrePlein && e.herisson) lignes.push({ materiauId: 'herisson', quantite: S * 0.15 * 1.1 })
  if (e.isolant) lignes.push({ materiauId: 'isolant-sous-dalle', quantite: S * 1.05 })

  return {
    lignes: lignes.filter((x) => x.quantite > 0),
    infos: [
      { cle: 'surface', label: 'Surface', valeur: S, unite: 'm²' },
      { cle: 'volume', label: 'Volume de béton (avec marge)', valeur: V, unite: 'm³' },
    ],
    avertissements: [],
  }
}

export const ficheDalle: Fiche<EntreesDalle> = {
  id: 'dalle-beton',
  nom: 'Dalle béton',
  icone: '⬜',
  champs: [
    { type: 'nombre', id: 'longueur', label: 'Longueur', unite: 'm' },
    { type: 'nombre', id: 'largeur', label: 'Largeur', unite: 'm' },
    { type: 'nombre', id: 'epaisseur', label: 'Épaisseur', unite: 'cm' },
    { type: 'choix', id: 'mode', label: 'Béton', options: [{ valeur: 'malaxer', label: 'À malaxer' }, { valeur: 'pret', label: "Prêt à l'emploi" }] },
    { type: 'oui_non', id: 'terrePlein', label: 'Sur terre-plein (ajoute le film polyane)' },
    { type: 'oui_non', id: 'herisson', label: 'Hérisson en gravier 20/40', visible: (e: EntreesDalle) => e.terrePlein },
    { type: 'oui_non', id: 'isolant', label: 'Isolant sous dalle' },
  ],
  defauts: () => ({
    longueur: null, largeur: null, epaisseur: 12, mode: 'malaxer', terrePlein: true,
    herisson: false, isolant: false, perte: null,
  }),
  perteDefaut: (_e, p) => p.maconnerie,
  calculer: calculerDalle,
  materiaux: ['ciment', 'sable', 'gravillons', 'beton-pret', 'treillis-st25c', 'film-polyane', 'bande-peripherique', 'herisson', 'isolant-sous-dalle'],
}
