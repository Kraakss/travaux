import { type Fiche, type Resultat, nb, div, arrondiSup, arrondiInf, PERIMETRE_PORTE } from './commun'

export interface EntreesPapierPeint {
  longueur: number | null
  largeur: number | null
  hauteur: number | null
  portes: number | null
  rouleauLongueur: number | null
  rouleauLargeur: number | null
  raccord: number | null
  rouleauxParColle: number | null
}

const ROGNAGE = 0.1 // 10 cm

export function calculerPapierPeint(e: EntreesPapierPeint): Resultat {
  const L = nb(e.longueur), l = nb(e.largeur), H = nb(e.hauteur)
  const portes = Math.floor(nb(e.portes))
  const lr = nb(e.rouleauLongueur), wr = nb(e.rouleauLargeur)
  const raccord = nb(e.raccord) / 100

  const perimetreUtile = Math.max(0, 2 * (L + l) - PERIMETRE_PORTE * portes)
  const nbLes = arrondiSup(div(perimetreUtile, wr))
  const longueurLe = H + ROGNAGE + raccord
  const lesParRouleau = longueurLe > 0 ? arrondiInf(lr / longueurLe) : 0
  const rouleaux = lesParRouleau > 0 ? arrondiSup(nbLes / lesParRouleau) : 0
  const avertissements: string[] = []
  if (H > 0 && lr > 0 && lesParRouleau === 0) avertissements.push('Le rouleau est trop court pour la hauteur de la pièce.')

  return {
    lignes: [
      { materiauId: 'papier-peint', quantite: rouleaux },
      { materiauId: 'colle-papier-peint', quantite: div(rouleaux, nb(e.rouleauxParColle ?? 5)) },
    ].filter((x) => x.quantite > 0),
    infos: [
      { cle: 'perimetreUtile', label: 'Périmètre utile', valeur: perimetreUtile, unite: 'm' },
      { cle: 'les', label: 'Nombre de lés', valeur: nbLes },
      { cle: 'lesParRouleau', label: 'Lés par rouleau', valeur: lesParRouleau },
      { cle: 'rouleaux', label: 'Rouleaux', valeur: rouleaux },
    ],
    avertissements,
  }
}

export const fichePapierPeint: Fiche<EntreesPapierPeint> = {
  id: 'papier-peint',
  nom: 'Papier peint',
  groupe: 'sols',
  icone: 'papier-peint',
  champs: [
    { type: 'nombre', id: 'longueur', label: 'Longueur de la pièce', unite: 'm' },
    { type: 'nombre', id: 'largeur', label: 'Largeur de la pièce', unite: 'm' },
    { type: 'nombre', id: 'hauteur', label: 'Hauteur sous plafond', unite: 'm' },
    { type: 'nombre', id: 'portes', label: 'Nombre de portes', entier: true },
    { type: 'nombre', id: 'rouleauLongueur', label: 'Longueur du rouleau', unite: 'm' },
    { type: 'nombre', id: 'rouleauLargeur', label: 'Largeur du rouleau', unite: 'm' },
    { type: 'nombre', id: 'raccord', label: 'Raccord (0 si uni)', unite: 'cm' },
    { type: 'nombre', id: 'rouleauxParColle', label: 'Rouleaux par paquet de colle', entier: true, aide: "à vérifier sur l'emballage" },
  ],
  defauts: () => ({
    longueur: null, largeur: null, hauteur: 2.5, portes: 1,
    rouleauLongueur: 10.05, rouleauLargeur: 0.53, raccord: 0, rouleauxParColle: 5,
  }),
  calculer: (e) => calculerPapierPeint(e),
  materiaux: ['papier-peint', 'colle-papier-peint'],
}
