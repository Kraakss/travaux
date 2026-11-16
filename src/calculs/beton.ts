// Mortier / béton « à la volée » et enduit de façade monocouche.
import {
  type Fiche, type Resultat, type Pertes, type Ouvertures, OUVERTURES_DEFAUT,
  nb, perteEffective, surfaceOuvertures,
} from './commun'

// ---------- 12) Mortier / béton à la volée ----------

export interface EntreesMelange {
  melange: string
  volume: number | null
  surface: number | null
  epaisseur: number | null
}

/** par m³ : ciment (kg), sable (m³), gravillons (m³) */
export const MELANGES: Record<string, { label: string; ciment: number; sable: number; gravillons: number }> = {
  beton: { label: 'Béton', ciment: 350, sable: 0.4, gravillons: 0.8 },
  montage: { label: 'Mortier de montage', ciment: 350, sable: 0.625, gravillons: 0 },
  scellement: { label: 'Mortier de scellement', ciment: 425, sable: 0.59, gravillons: 0 },
}

export function calculerMelange(e: EntreesMelange, _pertes?: Pertes): Resultat {
  const m = MELANGES[e.melange] ?? MELANGES.beton
  const V = nb(e.volume) > 0 ? nb(e.volume) : nb(e.surface) * (nb(e.epaisseur) / 100)
  const lignes: Resultat['lignes'] = [
    { materiauId: 'ciment', quantite: (V * m.ciment) / 35 },
    { materiauId: 'sable', quantite: V * m.sable },
    { materiauId: 'gravillons', quantite: V * m.gravillons },
  ]
  return {
    lignes: lignes.filter((x) => x.quantite > 0),
    infos: [
      { cle: 'volume', label: 'Volume à préparer', valeur: V, unite: 'm³' },
      { cle: 'cimentKg', label: 'Ciment', valeur: V * m.ciment, unite: 'kg' },
    ],
    avertissements: [],
  }
}

export const ficheMelange: Fiche<EntreesMelange> = {
  id: 'melange-beton',
  nom: 'Mortier / béton à la volée',
  groupe: 'maconnerie',
  icone: 'melange',
  champs: [
    {
      type: 'choix', id: 'melange', label: 'Mélange',
      options: [
        { valeur: 'beton', label: 'Béton' },
        { valeur: 'montage', label: 'Mortier de montage' },
        { valeur: 'scellement', label: 'Mortier de scellement' },
      ],
    },
    { type: 'nombre', id: 'volume', label: 'Volume', unite: 'm³', aide: 'Ou renseignez la surface et l’épaisseur ci-dessous' },
    { type: 'nombre', id: 'surface', label: 'Surface (si pas de volume)', unite: 'm²' },
    { type: 'nombre', id: 'epaisseur', label: 'Épaisseur (si pas de volume)', unite: 'cm' },
  ],
  defauts: () => ({ melange: 'beton', volume: null, surface: null, epaisseur: null }),
  calculer: calculerMelange,
  materiaux: ['ciment', 'sable', 'gravillons'],
}

// ---------- 11) Enduit de façade monocouche ----------

export interface EntreesFacade {
  longueur: number | null
  hauteur: number | null
  ouvertures: Ouvertures
  epaisseur: number | null
  angles: number | null
  perte: number | null
}

export function calculerFacade(e: EntreesFacade, _pertes?: Pertes): Resultat {
  const L = nb(e.longueur), H = nb(e.hauteur)
  const perte = perteEffective(e.perte, 10)
  const S = Math.max(0, L * H - surfaceOuvertures(e.ouvertures))
  const ep = nb(e.epaisseur)
  const kg = S * ep * 1.5 * (1 + perte)

  return {
    lignes: [
      { materiauId: 'enduit-monocouche', quantite: kg / 25 },
      { materiauId: 'profile-depart', quantite: L },
      { materiauId: 'baguette-angle', quantite: H * nb(e.angles) },
    ].filter((x) => x.quantite > 0),
    infos: [
      { cle: 'surface', label: 'Surface à enduire', valeur: S, unite: 'm²' },
      { cle: 'kg', label: 'Enduit monocouche', valeur: kg, unite: 'kg' },
    ],
    avertissements: ep > 0 && ep < 10 ? ['Moins de 10 mm : épaisseur insuffisante pour un monocouche.'] : [],
    notes: [
      'Déclaration préalable à prévoir si l’aspect change (couleur, matériau) : vérifiez le PLU en mairie. Échafaudage non inclus.',
    ],
  }
}

export const ficheFacade: Fiche<EntreesFacade> = {
  id: 'enduit-facade',
  nom: 'Enduit de façade',
  groupe: 'exterieur',
  icone: 'facade',
  champs: [
    { type: 'nombre', id: 'longueur', label: 'Longueur de façade', unite: 'm' },
    { type: 'nombre', id: 'hauteur', label: 'Hauteur', unite: 'm' },
    { type: 'ouvertures', id: 'ouvertures', label: 'Ouvertures (à retirer)' },
    { type: 'nombre', id: 'angles', label: 'Nombre d’angles', entier: true },
    { type: 'nombre', id: 'epaisseur', label: 'Épaisseur de l’enduit', unite: 'mm' },
  ],
  defauts: () => ({ longueur: null, hauteur: null, ouvertures: { ...OUVERTURES_DEFAUT }, angles: 0, epaisseur: 15, perte: null }),
  perteDefaut: () => 10,
  calculer: calculerFacade,
  materiaux: ['enduit-monocouche', 'profile-depart', 'baguette-angle'],
}
