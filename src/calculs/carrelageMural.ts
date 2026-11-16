// Carrelage mural : mêmes formules de carreaux que le carrelage de sol (voir carrelage.ts),
// avec en plus le primaire et, en zone d'eau, le SPEC et la bande d'étanchéité.
import {
  type Fiche, type Resultat, type Pertes, type Carreau, type Ouvertures, OUVERTURES_DEFAUT,
  nb, perteEffective, surfaceOuvertures,
} from './commun'
import { calculCarreaux } from './carrelage'

export interface EntreesCarrelageMural {
  longueur: number | null
  hauteur: number | null
  ouvertures: Ouvertures
  carreau: Carreau
  surfaceCarton: number | null
  joint: number | null
  epaisseur: number | null
  zoneEau: boolean
  surfaceEau: number | null
  longueurEau: number | null
  anglesEau: number | null
  perte: number | null
}

export function calculerCarrelageMural(e: EntreesCarrelageMural, _pertes?: Pertes): Resultat {
  const L = nb(e.longueur), H = nb(e.hauteur)
  const perte = perteEffective(e.perte, 10)
  const S = Math.max(0, L * H - surfaceOuvertures(e.ouvertures))
  const Sm = S * (1 + perte)
  const c = calculCarreaux({ S, Sm, carreau: e.carreau, surfaceCarton: e.surfaceCarton, joint: e.joint, epaisseur: e.epaisseur })

  const lignes = [...c.lignes, { materiauId: 'primaire-litre', quantite: S * 0.15 }]
  const surfaceEau = e.zoneEau ? nb(e.surfaceEau) : 0
  const specKg = surfaceEau * 1.6 * 1.1
  if (e.zoneEau) {
    lignes.push({ materiauId: 'spec', quantite: specKg / 5 })
    lignes.push({ materiauId: 'bande-etancheite', quantite: nb(e.longueurEau) + H * nb(e.anglesEau) })
  }

  const infos: Resultat['infos'] = [
    { cle: 'surface', label: 'Surface à carreler', valeur: S, unite: 'm²' },
    { cle: 'surfaceMarge', label: 'Surface avec marge', valeur: Sm, unite: 'm²' },
    { cle: 'colleKg', label: 'Colle nécessaire', valeur: c.colleKg, unite: 'kg' },
    { cle: 'jointKg', label: 'Joint nécessaire', valeur: c.jointKg, unite: 'kg' },
  ]
  if (e.zoneEau) infos.push({ cle: 'specKg', label: 'SPEC (étanchéité)', valeur: specKg, unite: 'kg' })

  return {
    lignes: lignes.filter((x) => x.quantite > 0),
    infos,
    avertissements: c.avertissements,
    notes: [
      ...c.notes,
      'Plaques hydrofugées sur au moins 1,80 m de hauteur (DTU 25.41).',
      ...(e.zoneEau ? ['Étanchéité de douche relevée de 10 cm au-dessus du receveur.'] : []),
    ],
  }
}

export const ficheCarrelageMural: Fiche<EntreesCarrelageMural> = {
  id: 'carrelage-mural',
  nom: 'Carrelage mural',
  groupe: 'sols',
  icone: 'carrelage-mural',
  champs: [
    { type: 'nombre', id: 'longueur', label: 'Longueur développée des murs', unite: 'm' },
    { type: 'nombre', id: 'hauteur', label: 'Hauteur carrelée', unite: 'm' },
    { type: 'ouvertures', id: 'ouvertures', label: 'Ouvertures (à retirer)' },
    { type: 'carreau', id: 'carreau', label: 'Taille du carreau' },
    { type: 'nombre', id: 'surfaceCarton', label: 'Surface par carton', unite: 'm²' },
    { type: 'titre', id: 'options', label: 'Options' },
    { type: 'nombre', id: 'joint', label: 'Largeur de joint', unite: 'mm' },
    { type: 'nombre', id: 'epaisseur', label: 'Épaisseur du carreau', unite: 'mm' },
    { type: 'oui_non', id: 'zoneEau', label: 'Zone d’eau (douche, baignoire)' },
    { type: 'nombre', id: 'surfaceEau', label: 'Surface de la zone d’eau', unite: 'm²', visible: (e: EntreesCarrelageMural) => e.zoneEau },
    { type: 'nombre', id: 'longueurEau', label: 'Longueur de la zone d’eau au sol', unite: 'm', visible: (e: EntreesCarrelageMural) => e.zoneEau },
    { type: 'nombre', id: 'anglesEau', label: 'Nombre d’angles', entier: true, visible: (e: EntreesCarrelageMural) => e.zoneEau },
  ],
  defauts: () => ({
    longueur: null, hauteur: null, ouvertures: { ...OUVERTURES_DEFAUT }, carreau: { a: 30, b: 60 }, surfaceCarton: 1.08,
    joint: 2, epaisseur: 9, zoneEau: false, surfaceEau: null, longueurEau: null, anglesEau: 0, perte: null,
  }),
  perteDefaut: () => 10,
  calculer: calculerCarrelageMural,
  materiaux: ['carrelage-m2', 'colle-carrelage', 'joint-carrelage', 'croisillons', 'primaire-litre', 'spec', 'bande-etancheite'],
}
