import {
  type Fiche, type Resultat, type Pertes, type Ouvertures, OUVERTURES_DEFAUT,
  nb, div, perteEffective, surfaceOuvertures,
} from './commun'

export interface EntreesPeinture {
  longueur: number | null
  largeur: number | null
  hauteur: number | null
  ouvertures: Ouvertures
  plafond: boolean
  couches: number | null
  rendement: number | null
  rendementSousCouche: number | null
  sousCouche: boolean
  consommables: boolean
  perte: number | null
}

/** Litres de peinture pour une surface donnée (fonction de base, testée seule). */
export function litresPeinture(surface: number, couches: number, perte: number, rendement: number): number {
  return div(surface * couches * (1 + perte), rendement)
}

export function calculerPeinture(e: EntreesPeinture, pertes: Pertes): Resultat {
  const L = nb(e.longueur), l = nb(e.largeur), H = nb(e.hauteur)
  const perte = perteEffective(e.perte, pertes.peinture)
  const couches = nb(e.couches)
  const rendement = nb(e.rendement)
  const rendementSC = nb(e.rendementSousCouche ?? 9)
  const surfaceMurs = Math.max(0, 2 * (L + l) * H - surfaceOuvertures(e.ouvertures))
  const surfacePlafond = e.plafond ? L * l : 0
  const perimetre = 2 * (L + l)

  const litresMurs = litresPeinture(surfaceMurs, couches, perte, rendement)
  const litresPlafond = litresPeinture(surfacePlafond, couches, perte, rendement)
  const litresSousCouche = e.sousCouche ? litresPeinture(surfaceMurs + surfacePlafond, 1, perte, rendementSC) : 0

  const lignes: Resultat['lignes'] = [
    { materiauId: 'peinture-murs', quantite: litresMurs },
    { materiauId: 'peinture-plafond', quantite: litresPlafond },
    { materiauId: 'sous-couche', quantite: litresSousCouche },
  ]
  if (e.consommables) {
    lignes.push({ materiauId: 'ruban-masquage', quantite: (perimetre * 2) / 25 })
    lignes.push({ materiauId: 'bache', quantite: 1 })
  }

  return {
    lignes: lignes.filter((x) => x.quantite > 0),
    infos: [
      { cle: 'surfaceMurs', label: 'Surface des murs', valeur: surfaceMurs, unite: 'm²' },
      { cle: 'surfacePlafond', label: 'Surface du plafond', valeur: surfacePlafond, unite: 'm²' },
      { cle: 'litresMurs', label: 'Peinture murs', valeur: litresMurs, unite: 'L' },
      { cle: 'litresPlafond', label: 'Peinture plafond', valeur: litresPlafond, unite: 'L' },
      { cle: 'litresSousCouche', label: 'Sous-couche', valeur: litresSousCouche, unite: 'L' },
    ],
    avertissements: rendement <= 0 ? ['Indiquez le rendement de la peinture.'] : [],
  }
}

export const fichePeinture: Fiche<EntreesPeinture> = {
  id: 'peinture',
  nom: 'Peinture',
  groupe: 'sols',
  icone: 'peinture',
  champs: [
    { type: 'nombre', id: 'longueur', label: 'Longueur de la pièce', unite: 'm' },
    { type: 'nombre', id: 'largeur', label: 'Largeur de la pièce', unite: 'm' },
    { type: 'nombre', id: 'hauteur', label: 'Hauteur sous plafond', unite: 'm' },
    { type: 'ouvertures', id: 'ouvertures', label: 'Ouvertures (portes, fenêtres)' },
    { type: 'oui_non', id: 'plafond', label: 'Peindre aussi le plafond' },
    { type: 'nombre', id: 'couches', label: 'Nombre de couches', unite: '', entier: true },
    { type: 'nombre', id: 'rendement', label: 'Rendement de la peinture', unite: 'm²/L/couche' },
    { type: 'oui_non', id: 'sousCouche', label: 'Ajouter une sous-couche (1 couche)' },
    { type: 'nombre', id: 'rendementSousCouche', label: 'Rendement de la sous-couche', unite: 'm²/L', visible: (e: EntreesPeinture) => e.sousCouche },
    { type: 'oui_non', id: 'consommables', label: 'Ruban de masquage et bâche' },
  ],
  defauts: () => ({
    longueur: null, largeur: null, hauteur: 2.5, ouvertures: { ...OUVERTURES_DEFAUT },
    plafond: true, couches: 2, rendement: 10, rendementSousCouche: 9, sousCouche: false, consommables: false, perte: null,
  }),
  perteDefaut: (_e, p) => p.peinture,
  calculer: calculerPeinture,
  materiaux: ['peinture-murs', 'peinture-plafond', 'sous-couche', 'ruban-masquage', 'bache'],
}
