// Cloisons légères : carreaux de plâtre et cloison alvéolaire (Placopan 50).
import {
  type Fiche, type Resultat, type Pertes, type Ouvertures, OUVERTURES_DEFAUT,
  nb, perteEffective, arrondiSup, surfaceOuvertures,
} from './commun'

const PERTE = 5

// ---------- 3) Carreaux de plâtre ----------

export interface EntreesCarreauxPlatre {
  longueur: number | null
  hauteur: number | null
  ouvertures: Ouvertures
  epaisseur: string
  hydrofuge: boolean
  perte: number | null
}

/** Consommation de colle de base (kg/m²) selon l'épaisseur du carreau */
export const K_CARREAU_PLATRE: Record<string, number> = { '5': 1.4, '7': 1.8, '10': 2.5 }

export function calculerCarreauxPlatre(e: EntreesCarreauxPlatre, _pertes?: Pertes): Resultat {
  const L = nb(e.longueur), H = nb(e.hauteur)
  const perte = perteEffective(e.perte, PERTE)
  const S = Math.max(0, L * H - surfaceOuvertures(e.ouvertures))
  const Sm = S * (1 + perte)
  const ep = e.epaisseur in K_CARREAU_PLATRE ? e.epaisseur : '7'
  const k = K_CARREAU_PLATRE[ep]

  const lignes: Resultat['lignes'] = [
    { materiauId: e.hydrofuge ? `carreau-platre-hydro-${ep}` : `carreau-platre-${ep}`, quantite: Sm / 0.333 },
    { materiauId: 'colle-carreaux-platre', quantite: (S * k * 1.5) / 25 },
    { materiauId: 'platre-a-enduire', quantite: (S * k * 0.5) / 25 },
    { materiauId: 'bande-resiliente-m', quantite: L },
    { materiauId: 'bande-joint', quantite: (S * 0.8) / 150 },
  ]
  return {
    lignes: lignes.filter((x) => x.quantite > 0),
    infos: [
      { cle: 'surface', label: 'Surface de cloison', valeur: S, unite: 'm²' },
      { cle: 'surfaceMarge', label: 'Surface avec marge', valeur: Sm, unite: 'm²' },
    ],
    avertissements: [],
  }
}

export const ficheCarreauxPlatre: Fiche<EntreesCarreauxPlatre> = {
  id: 'carreaux-platre',
  nom: 'Carreaux de plâtre',
  groupe: 'cloisons',
  icone: 'carreaux-platre',
  champs: [
    { type: 'nombre', id: 'longueur', label: 'Longueur de la cloison', unite: 'm' },
    { type: 'nombre', id: 'hauteur', label: 'Hauteur', unite: 'm' },
    { type: 'ouvertures', id: 'ouvertures', label: 'Portes (à retirer)', portesSeulement: true },
    {
      type: 'choix', id: 'epaisseur', label: 'Épaisseur',
      options: [{ valeur: '5', label: '5 cm' }, { valeur: '7', label: '7 cm' }, { valeur: '10', label: '10 cm' }],
    },
    { type: 'oui_non', id: 'hydrofuge', label: 'Carreaux hydrofugés (pièce humide)' },
  ],
  defauts: () => ({ longueur: null, hauteur: 2.5, ouvertures: { ...OUVERTURES_DEFAUT }, epaisseur: '7', hydrofuge: false, perte: null }),
  perteDefaut: () => PERTE,
  calculer: calculerCarreauxPlatre,
  materiaux: [
    'carreau-platre-5', 'carreau-platre-7', 'carreau-platre-10',
    'carreau-platre-hydro-5', 'carreau-platre-hydro-7', 'carreau-platre-hydro-10',
    'colle-carreaux-platre', 'platre-a-enduire', 'bande-resiliente-m', 'bande-joint',
  ],
}

// ---------- 4) Cloison alvéolaire (Placopan 50) ----------

export interface EntreesAlveolaire {
  longueur: number | null
  hauteur: number | null
  ouvertures: Ouvertures
  perte: number | null
}

export function calculerAlveolaire(e: EntreesAlveolaire, _pertes?: Pertes): Resultat {
  const L = nb(e.longueur), H = nb(e.hauteur)
  const perte = perteEffective(e.perte, PERTE)
  const S = Math.max(0, L * H - surfaceOuvertures(e.ouvertures))
  const joints = L > 0 ? arrondiSup(L / 1.2) + 1 : 0

  const lignes: Resultat['lignes'] = [
    { materiauId: 'panneau-alveolaire-50', quantite: (L * (1 + perte)) / 1.2 },
    { materiauId: 'semelle-bois', quantite: (L * 1.05) / 1.85 },
    { materiauId: 'rail-bois', quantite: (L * 1.05) / 1.85 },
    { materiauId: 'clavette-bois', quantite: arrondiSup((joints * 0.6) / 2) },
    { materiauId: 'vis-ttpc-35-500', quantite: (S * 8) / 500 },
    { materiauId: 'vis-ttpc-70-200', quantite: (S * 1) / 200 },
    { materiauId: 'enduit-poudre', quantite: (S * 0.66) / 25 },
    { materiauId: 'bande-joint', quantite: (S * 1.7) / 150 },
  ]
  return {
    lignes: lignes.filter((x) => x.quantite > 0),
    infos: [
      { cle: 'surface', label: 'Surface de cloison', valeur: S, unite: 'm²' },
      { cle: 'joints', label: 'Joints entre panneaux', valeur: joints },
    ],
    avertissements: H > 2.6 ? ['Hauteur au-dessus de 2,60 m : choisissez plutôt le Placopan 72 (jusqu’à 3,60 m).'] : [],
    notes: ['Isolement acoustique de 27 à 29 dB : insuffisant entre deux logements.'],
  }
}

export const ficheAlveolaire: Fiche<EntreesAlveolaire> = {
  id: 'cloison-alveolaire',
  nom: 'Cloison alvéolaire',
  groupe: 'cloisons',
  icone: 'alveolaire',
  champs: [
    { type: 'nombre', id: 'longueur', label: 'Longueur de la cloison', unite: 'm' },
    { type: 'nombre', id: 'hauteur', label: 'Hauteur', unite: 'm' },
    { type: 'ouvertures', id: 'ouvertures', label: 'Portes (à retirer)', portesSeulement: true },
  ],
  defauts: () => ({ longueur: null, hauteur: 2.5, ouvertures: { ...OUVERTURES_DEFAUT }, perte: null }),
  perteDefaut: () => PERTE,
  calculer: calculerAlveolaire,
  materiaux: [
    'panneau-alveolaire-50', 'semelle-bois', 'rail-bois', 'clavette-bois', 'vis-ttpc-35-500', 'vis-ttpc-70-200',
    'enduit-poudre', 'bande-joint',
  ],
}
