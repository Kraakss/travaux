// Isolation : combles perdus (laine de roche soufflée) et sous chape (PSE ou polyuréthane).
import { type Fiche, type Resultat, type Pertes, nb, perteEffective, arrondiSup } from './commun'

// ---------- 5) Combles perdus ----------

export interface EntreesCombles {
  surface: number | null
  R: string
}

/** kg de laine de roche par m² et par unité de R (12,7 kg/m² pour R 15) */
export const KG_PAR_M2_ET_R = 0.846
/** épaisseur soufflée (mm) par unité de R */
export const MM_PAR_R = 45

export function calculerCombles(e: EntreesCombles, _pertes?: Pertes): Resultat {
  const S = nb(e.surface)
  const R = nb(Number(e.R)) || 7
  const kg = S * KG_PAR_M2_ET_R * R
  return {
    lignes: [{ materiauId: 'laine-roche-souffler', quantite: kg / 20 }].filter((x) => x.quantite > 0),
    infos: [
      { cle: 'kg', label: 'Laine de roche à souffler', valeur: kg, unite: 'kg' },
      { cle: 'epaisseur', label: 'Épaisseur à souffler', valeur: MM_PAR_R * R, unite: 'mm' },
    ],
    avertissements: R < 7 ? ['R inférieur à 7 : en dessous de la valeur courante pour des combles perdus.'] : [],
    notes: [
      'DTU 45.11 : cadres autour des spots et des conduits, trappe isolée, combles ventilés. La machine à souffler n’est pas dans le calcul.',
    ],
  }
}

export const ficheCombles: Fiche<EntreesCombles> = {
  id: 'isolation-combles',
  nom: 'Isolation des combles',
  groupe: 'isolation',
  icone: 'combles',
  champs: [
    { type: 'nombre', id: 'surface', label: 'Surface des combles', unite: 'm²' },
    {
      type: 'choix', id: 'R', label: 'R visé',
      options: [{ valeur: '6', label: 'R 6' }, { valeur: '7', label: 'R 7' }, { valeur: '8', label: 'R 8' }, { valeur: '10', label: 'R 10' }],
    },
  ],
  defauts: () => ({ surface: null, R: '7' }),
  calculer: calculerCombles,
  materiaux: ['laine-roche-souffler'],
}

// ---------- 6) Isolation sous chape ----------

export interface EntreesSousChape {
  longueur: number | null
  largeur: number | null
  isolant: string
  R: number | null
  perte: number | null
}

export const LAMBDA_SOUS_CHAPE: Record<string, number> = { pse: 0.038, pu: 0.025 }

/** Épaisseur (mm) pour atteindre R, arrondie aux 10 mm supérieurs */
export function epaisseurSousChape(R: number, isolant: string): number {
  const lambda = LAMBDA_SOUS_CHAPE[isolant] ?? LAMBDA_SOUS_CHAPE.pse
  return arrondiSup((R * lambda * 1000) / 10) * 10
}

export function calculerSousChape(e: EntreesSousChape, _pertes?: Pertes): Resultat {
  const L = nb(e.longueur), l = nb(e.largeur)
  const perte = perteEffective(e.perte, 5)
  const S = L * l
  const Sm = S * (1 + perte)
  const isolant = e.isolant === 'pu' ? 'pu' : 'pse'
  const ep = epaisseurSousChape(nb(e.R), isolant)
  const perimetre = 2 * (L + l)

  const lignes: Resultat['lignes'] = [
    {
      materiauId: isolant === 'pu' ? 'isolant-pu-mm' : 'isolant-pse-mm',
      quantite: ep > 0 ? Sm : 0,
      facteur: ep,
      detail: `${ep} mm`,
      unite: 'm²',
    },
    { materiauId: 'bande-peripherique', quantite: perimetre / 25 },
    { materiauId: 'film-polyane', quantite: (S * 1.2) / 100 },
  ]
  return {
    lignes: lignes.filter((x) => x.quantite > 0),
    infos: [
      { cle: 'epaisseur', label: 'Épaisseur d’isolant', valeur: ep, unite: 'mm' },
      { cle: 'panneaux', label: 'Panneaux (avec marge)', valeur: Sm, unite: 'm²' },
      { cle: 'bande', label: 'Bande périphérique', valeur: perimetre, unite: 'm' },
      { cle: 'polyane', label: 'Film polyane', valeur: S * 1.2, unite: 'm²' },
    ],
    avertissements: [],
  }
}

export const ficheSousChape: Fiche<EntreesSousChape> = {
  id: 'isolation-sous-chape',
  nom: 'Isolation sous chape',
  groupe: 'isolation',
  icone: 'sous-chape',
  champs: [
    { type: 'nombre', id: 'longueur', label: 'Longueur', unite: 'm' },
    { type: 'nombre', id: 'largeur', label: 'Largeur', unite: 'm' },
    {
      type: 'choix', id: 'isolant', label: 'Isolant',
      options: [{ valeur: 'pse', label: 'PSE' }, { valeur: 'pu', label: 'Polyuréthane' }],
    },
    { type: 'nombre', id: 'R', label: 'R visé', aide: 'Résistance thermique en m².K/W' },
  ],
  defauts: () => ({ longueur: null, largeur: null, isolant: 'pse', R: 3, perte: null }),
  perteDefaut: () => 5,
  calculer: calculerSousChape,
  materiaux: ['isolant-pse-mm', 'isolant-pu-mm', 'bande-peripherique', 'film-polyane'],
}
