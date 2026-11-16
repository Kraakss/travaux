// Murs porteurs : briques à joint mince et béton cellulaire.
import {
  type Fiche, type Resultat, type Pertes, type Ouvertures, OUVERTURES_DEFAUT,
  nb, perteEffective, surfaceOuvertures, nbOuvertures,
} from './commun'

const PERTE = 5

// ---------- 7) Mur en briques (joint mince) ----------

export interface EntreesBriques {
  longueur: number | null
  hauteur: number | null
  ouvertures: Ouvertures
  epaisseur: string
  jointsVerticaux: boolean
  perte: number | null
}

/** par épaisseur (cm) : briques/m², mortier horizontal, mortier vertical (kg/m²) */
export const TABLE_BRIQUES: Record<string, { n: number; horizontal: number; vertical: number; id: string }> = {
  '20': { n: 8, horizontal: 1.8, vertical: 1.5, id: 'brique-20' },
  '30': { n: 10.7, horizontal: 3.0, vertical: 3.1, id: 'brique-30' },
  '36.5': { n: 16, horizontal: 4.3, vertical: 5.7, id: 'brique-36_5' },
}

export function calculerBriques(e: EntreesBriques, _pertes?: Pertes): Resultat {
  const L = nb(e.longueur), H = nb(e.hauteur)
  const perte = perteEffective(e.perte, PERTE)
  const S = Math.max(0, L * H - surfaceOuvertures(e.ouvertures))
  const Sm = S * (1 + perte)
  const t = TABLE_BRIQUES[e.epaisseur] ?? TABLE_BRIQUES['20']
  const mortierKg = Sm * (t.horizontal + (e.jointsVerticaux ? t.vertical : 0))

  return {
    lignes: [
      { materiauId: t.id, quantite: Sm * t.n },
      { materiauId: 'mortier-joint-mince', quantite: mortierKg / 25 },
      { materiauId: 'linteau', quantite: nbOuvertures(e.ouvertures) },
    ].filter((x) => x.quantite > 0),
    infos: [
      { cle: 'surface', label: 'Surface de mur', valeur: S, unite: 'm²' },
      { cle: 'surfaceMarge', label: 'Surface avec marge', valeur: Sm, unite: 'm²' },
      { cle: 'mortierKg', label: 'Mortier de joint mince', valeur: mortierKg, unite: 'kg' },
    ],
    avertissements: [],
    notes: e.epaisseur === '20' ? ['Brique de 20 cm non isolante seule : prévoir un doublage ou une isolation par l’extérieur.'] : [],
  }
}

export const ficheBriques: Fiche<EntreesBriques> = {
  id: 'mur-briques',
  nom: 'Mur en briques',
  groupe: 'maconnerie',
  icone: 'briques',
  champs: [
    { type: 'nombre', id: 'longueur', label: 'Longueur du mur', unite: 'm' },
    { type: 'nombre', id: 'hauteur', label: 'Hauteur', unite: 'm' },
    { type: 'ouvertures', id: 'ouvertures', label: 'Ouvertures (à retirer)' },
    {
      type: 'choix', id: 'epaisseur', label: 'Épaisseur',
      options: [{ valeur: '20', label: '20 cm' }, { valeur: '30', label: '30 cm' }, { valeur: '36.5', label: '36,5 cm' }],
    },
    { type: 'oui_non', id: 'jointsVerticaux', label: 'Joints verticaux garnis' },
  ],
  defauts: () => ({ longueur: null, hauteur: 2.5, ouvertures: { ...OUVERTURES_DEFAUT }, epaisseur: '20', jointsVerticaux: false, perte: null }),
  perteDefaut: () => PERTE,
  calculer: calculerBriques,
  materiaux: ['brique-20', 'brique-30', 'brique-36_5', 'mortier-joint-mince', 'linteau'],
}

// ---------- 8) Mur en béton cellulaire ----------

export interface EntreesBetonCellulaire {
  longueur: number | null
  hauteur: number | null
  ouvertures: Ouvertures
  epaisseur: string
  perte: number | null
}

export const EPAISSEURS_CELLULAIRE = ['15', '17.5', '20', '22.5', '25', '30']

export function calculerBetonCellulaire(e: EntreesBetonCellulaire, _pertes?: Pertes): Resultat {
  const L = nb(e.longueur), H = nb(e.hauteur)
  const perte = perteEffective(e.perte, PERTE)
  const S = Math.max(0, L * H - surfaceOuvertures(e.ouvertures))
  const Sm = S * (1 + perte)
  const ep = EPAISSEURS_CELLULAIRE.includes(e.epaisseur) ? e.epaisseur : '20'
  const epCm = Number(ep)
  const colleKg = (Sm * 4 * epCm) / 20
  const departKg = L * (epCm / 100) * 28.5

  return {
    lignes: [
      { materiauId: `beton-cell-${ep.replace('.', '_')}`, quantite: Sm * 6.4 },
      { materiauId: 'colle-beton-cellulaire', quantite: colleKg / 25 },
      { materiauId: 'mortier', quantite: departKg / 25 },
      { materiauId: 'linteau', quantite: nbOuvertures(e.ouvertures) },
    ].filter((x) => x.quantite > 0),
    infos: [
      { cle: 'surface', label: 'Surface de mur', valeur: S, unite: 'm²' },
      { cle: 'surfaceMarge', label: 'Surface avec marge', valeur: Sm, unite: 'm²' },
      { cle: 'colleKg', label: 'Colle pour béton cellulaire', valeur: colleKg, unite: 'kg' },
      { cle: 'departKg', label: 'Mortier du rang de départ', valeur: departKg, unite: 'kg' },
    ],
    avertissements: [],
  }
}

export const ficheBetonCellulaire: Fiche<EntreesBetonCellulaire> = {
  id: 'mur-beton-cellulaire',
  nom: 'Mur en béton cellulaire',
  groupe: 'maconnerie',
  icone: 'beton-cellulaire',
  champs: [
    { type: 'nombre', id: 'longueur', label: 'Longueur du mur', unite: 'm' },
    { type: 'nombre', id: 'hauteur', label: 'Hauteur', unite: 'm' },
    { type: 'ouvertures', id: 'ouvertures', label: 'Ouvertures (à retirer)' },
    {
      type: 'choix', id: 'epaisseur', label: 'Épaisseur',
      options: EPAISSEURS_CELLULAIRE.map((v) => ({ valeur: v, label: `${v.replace('.', ',')} cm` })),
    },
  ],
  defauts: () => ({ longueur: null, hauteur: 2.5, ouvertures: { ...OUVERTURES_DEFAUT }, epaisseur: '20', perte: null }),
  perteDefaut: () => PERTE,
  calculer: calculerBetonCellulaire,
  materiaux: [
    'beton-cell-15', 'beton-cell-17_5', 'beton-cell-20', 'beton-cell-22_5', 'beton-cell-25', 'beton-cell-30',
    'colle-beton-cellulaire', 'mortier', 'linteau',
  ],
}
