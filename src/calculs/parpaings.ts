import {
  type Fiche, type Resultat, type Pertes, type Ouvertures, OUVERTURES_DEFAUT,
  nb, perteEffective, surfaceOuvertures, nbOuvertures,
} from './commun'

export interface EntreesParpaings {
  longueur: number | null
  hauteur: number | null
  ouvertures: Ouvertures
  epaisseurBloc: string
  jointsVerticaux: boolean
  perte: number | null
}

export function calculerParpaings(e: EntreesParpaings, pertes: Pertes): Resultat {
  const L = nb(e.longueur), H = nb(e.hauteur)
  const perte = perteEffective(e.perte, pertes.maconnerie)
  const ep = e.epaisseurBloc === '10' ? 10 : e.epaisseurBloc === '15' ? 15 : 20
  const S = Math.max(0, L * H - surfaceOuvertures(e.ouvertures))
  // kg de mortier par m² de mur pour un bloc de 20 cm (proportionnel à l'épaisseur)
  const m = e.jointsVerticaux ? 55 : 35
  const mortierKg = (S * m * ep) / 20

  return {
    lignes: [
      { materiauId: `parpaing-${ep}`, quantite: S * 10 * (1 + perte) },
      { materiauId: 'mortier', quantite: mortierKg / 25 },
      { materiauId: 'linteau', quantite: nbOuvertures(e.ouvertures) },
    ].filter((x) => x.quantite > 0),
    infos: [
      { cle: 'surface', label: 'Surface de mur', valeur: S, unite: 'm²' },
      { cle: 'mortierKg', label: 'Mortier', valeur: mortierKg, unite: 'kg' },
    ],
    avertissements: [],
  }
}

export const ficheParpaings: Fiche<EntreesParpaings> = {
  id: 'mur-parpaings',
  nom: 'Mur en parpaings',
  groupe: 'maconnerie',
  icone: 'parpaings',
  champs: [
    { type: 'nombre', id: 'longueur', label: 'Longueur', unite: 'm' },
    { type: 'nombre', id: 'hauteur', label: 'Hauteur', unite: 'm' },
    { type: 'ouvertures', id: 'ouvertures', label: 'Ouvertures (portes, fenêtres)' },
    { type: 'choix', id: 'epaisseurBloc', label: 'Épaisseur du bloc', options: [{ valeur: '10', label: '10 cm' }, { valeur: '15', label: '15 cm' }, { valeur: '20', label: '20 cm' }] },
    { type: 'oui_non', id: 'jointsVerticaux', label: 'Joints verticaux garnis de mortier' },
  ],
  defauts: () => ({ longueur: null, hauteur: 2.5, ouvertures: { ...OUVERTURES_DEFAUT }, epaisseurBloc: '20', jointsVerticaux: false, perte: null }),
  perteDefaut: (_e, p) => p.maconnerie,
  calculer: calculerParpaings,
  materiaux: ['parpaing-10', 'parpaing-15', 'parpaing-20', 'mortier', 'linteau'],
}
