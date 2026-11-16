// Doublages de murs : collé (panneaux isolants + plaque) et sur ossature (fourrures F530 + laine de verre).
import {
  type Fiche, type Resultat, type Pertes, type Ouvertures, OUVERTURES_DEFAUT,
  nb, perteEffective, arrondiSup, surfaceOuvertures,
} from './commun'

const PERTE_DOUBLAGE = 5

// ---------- 1) Doublage collé ----------

export interface EntreesDoublageColle {
  longueur: number | null
  hauteur: number | null
  ouvertures: Ouvertures
  epaisseur: string
  perte: number | null
}

/** Résistance thermique indicative : e (mm) / 32 (λ = 0,032) */
export const resistanceDoublageColle = (epaisseurMm: number) => epaisseurMm / 32

export function calculerDoublageColle(e: EntreesDoublageColle, _pertes?: Pertes): Resultat {
  const L = nb(e.longueur), H = nb(e.hauteur)
  const perte = perteEffective(e.perte, PERTE_DOUBLAGE)
  const S = Math.max(0, L * H - surfaceOuvertures(e.ouvertures))
  const Sm = S * (1 + perte)
  const ep = ['80', '100', '120', '140'].includes(e.epaisseur) ? e.epaisseur : '100'

  const lignes: Resultat['lignes'] = [
    { materiauId: `doublage-pse-${ep}`, quantite: Sm / 3 },
    { materiauId: 'mortier-adhesif', quantite: (S * 2.5) / 25 },
    { materiauId: 'bande-joint', quantite: (S * 1.75) / 150 },
    { materiauId: 'enduit-poudre', quantite: (S * 0.5) / 25 },
  ]
  return {
    lignes: lignes.filter((x) => x.quantite > 0),
    infos: [
      { cle: 'surface', label: 'Surface à doubler', valeur: S, unite: 'm²' },
      { cle: 'surfaceMarge', label: 'Surface avec marge', valeur: Sm, unite: 'm²' },
      { cle: 'R', label: 'Résistance thermique R (indicatif)', valeur: resistanceDoublageColle(Number(ep)), unite: 'm².K/W' },
    ],
    avertissements: H > 4 ? ['Hauteur de plus de 4 m : vérifiez la limite de pose collée dans la notice du fabricant.'] : [],
  }
}

export const ficheDoublageColle: Fiche<EntreesDoublageColle> = {
  id: 'doublage-colle',
  nom: 'Doublage collé',
  groupe: 'cloisons',
  icone: 'doublage-colle',
  champs: [
    { type: 'nombre', id: 'longueur', label: 'Longueur du mur', unite: 'm' },
    { type: 'nombre', id: 'hauteur', label: 'Hauteur', unite: 'm' },
    { type: 'ouvertures', id: 'ouvertures', label: 'Ouvertures (à retirer)' },
    {
      type: 'choix', id: 'epaisseur', label: "Épaisseur d'isolant",
      options: [
        { valeur: '80', label: '80 mm' }, { valeur: '100', label: '100 mm' },
        { valeur: '120', label: '120 mm' }, { valeur: '140', label: '140 mm' },
      ],
    },
  ],
  defauts: () => ({ longueur: null, hauteur: 2.5, ouvertures: { ...OUVERTURES_DEFAUT }, epaisseur: '100', perte: null }),
  perteDefaut: () => PERTE_DOUBLAGE,
  calculer: calculerDoublageColle,
  materiaux: ['doublage-pse-80', 'doublage-pse-100', 'doublage-pse-120', 'doublage-pse-140', 'mortier-adhesif', 'bande-joint', 'enduit-poudre'],
}

// ---------- 2) Doublage sur ossature ----------

export interface EntreesDoublageOssature {
  longueur: number | null
  hauteur: number | null
  ouvertures: Ouvertures
  epaisseur: string
  perte: number | null
}

export const R_LAINE: Record<string, number> = { '100': 3.15, '120': 3.75, '140': 4.4 }

export function calculerDoublageOssature(e: EntreesDoublageOssature, _pertes?: Pertes): Resultat {
  const L = nb(e.longueur), H = nb(e.hauteur)
  const perte = perteEffective(e.perte, PERTE_DOUBLAGE)
  const S = Math.max(0, L * H - surfaceOuvertures(e.ouvertures))
  const Sm = S * (1 + perte)
  const ep = e.epaisseur in R_LAINE ? e.epaisseur : '100'
  const colonnes = L > 0 ? arrondiSup(L / 0.6) + 1 : 0
  const appuisParColonne = Math.max(1, arrondiSup(H / 1.35) - 1)

  const lignes: Resultat['lignes'] = [
    { materiauId: 'fourrure-f530', quantite: colonnes * arrondiSup(H / 3) },
    { materiauId: 'rail-r48', quantite: (2 * L) / 3 },
    { materiauId: 'appui-intermediaire', quantite: H > 0 ? colonnes * appuisParColonne : 0 },
    { materiauId: `laine-verre-${ep}`, quantite: Sm / 3.24 },
    { materiauId: 'plaque-standard-250', quantite: Sm / 3 },
    { materiauId: 'vis-25', quantite: (Sm * 15) / 1000 },
    { materiauId: 'bande-joint', quantite: (S * 1.4) / 150 },
    { materiauId: 'enduit-poudre', quantite: (S * 0.5) / 25 },
  ]
  return {
    lignes: lignes.filter((x) => x.quantite > 0),
    infos: [
      { cle: 'surface', label: 'Surface à doubler', valeur: S, unite: 'm²' },
      { cle: 'surfaceMarge', label: 'Surface avec marge', valeur: Sm, unite: 'm²' },
      { cle: 'R', label: 'Résistance thermique R de la laine', valeur: R_LAINE[ep], unite: 'm².K/W' },
    ],
    avertissements: [],
  }
}

export const ficheDoublageOssature: Fiche<EntreesDoublageOssature> = {
  id: 'doublage-ossature',
  nom: 'Doublage sur ossature',
  groupe: 'cloisons',
  icone: 'doublage-ossature',
  champs: [
    { type: 'nombre', id: 'longueur', label: 'Longueur du mur', unite: 'm' },
    { type: 'nombre', id: 'hauteur', label: 'Hauteur', unite: 'm' },
    { type: 'ouvertures', id: 'ouvertures', label: 'Ouvertures (à retirer)' },
    {
      type: 'choix', id: 'epaisseur', label: 'Laine de verre',
      options: [{ valeur: '100', label: '100 mm' }, { valeur: '120', label: '120 mm' }, { valeur: '140', label: '140 mm' }],
    },
  ],
  defauts: () => ({ longueur: null, hauteur: 2.5, ouvertures: { ...OUVERTURES_DEFAUT }, epaisseur: '100', perte: null }),
  perteDefaut: () => PERTE_DOUBLAGE,
  calculer: calculerDoublageOssature,
  materiaux: [
    'fourrure-f530', 'rail-r48', 'appui-intermediaire', 'laine-verre-100', 'laine-verre-120', 'laine-verre-140',
    'plaque-standard-250', 'vis-25', 'bande-joint', 'enduit-poudre',
  ],
}
