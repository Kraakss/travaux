// Sources des ratios utilisés dans les calculs (affichées en lecture seule dans Réglages).
//
// Statut « verifie »     : ratio confirmé par une source technique (DTU, documentation de fabricant…).
// Statut « a_confirmer » : pratique courante de chantier, à confirmer sur la notice du produit choisi.
//
// Les références citées sont des documents de référence du métier ; les valeurs exactes
// peuvent varier d'un fabricant à l'autre : se fier à la notice du produit acheté.

export type StatutFormule = 'verifie' | 'a_confirmer'

export interface SourceFormule {
  id: string
  /** Fiche de calcul concernée */
  fiche: string
  /** Ce que mesure le ratio */
  ratio: string
  /** Valeur utilisée dans l'appli */
  valeur: string
  source: string
  statut: StatutFormule
}

export const SOURCES_FORMULES: SourceFormule[] = [
  // ----- Placo -----
  {
    id: 'plaques-surface', fiche: 'Plafond placo / Cloison placo', ratio: 'Plaques de plâtre',
    valeur: '1,05 m² de plaque par m² à plaquer (avant marge de perte personnelle)',
    source: 'Documentation des fabricants de plaques (Placo®, Knauf, Siniat) et DTU 25.41', statut: 'verifie',
  },
  {
    id: 'fourrures', fiche: 'Plafond placo', ratio: 'Fourrures F530 (barre de 3 m)',
    valeur: 'surface / entraxe (0,50 ou 0,60 m) / 3', source: 'DTU 25.41 et guides de pose des fabricants d’ossatures', statut: 'verifie',
  },
  {
    id: 'suspentes', fiche: 'Plafond placo', ratio: 'Suspentes',
    valeur: '2 par m² de plafond (chevilles : autant)', source: 'Guides de pose des fabricants d’ossatures (Placo®, Siniat)', statut: 'verifie',
  },
  {
    id: 'vis-10', fiche: 'Plafond placo', ratio: 'Vis TTPC 25',
    valeur: '10 par m² de plaque', source: 'Guides de pose des fabricants de plaques', statut: 'verifie',
  },
  {
    id: 'bande-14', fiche: 'Plafond placo / Cloison placo', ratio: 'Bande à joint',
    valeur: '1,4 m par m² de plaque', source: 'Guides de pose et fiches produits des fabricants', statut: 'verifie',
  },
  {
    id: 'enduit', fiche: 'Plafond placo / Cloison placo', ratio: 'Enduit à joint',
    valeur: '0,3 à 0,5 kg par m² (on retient 0,5 kg, côté prudent)', source: 'Fiches techniques des enduits à joint (fabricants)', statut: 'verifie',
  },
  {
    id: 'hauteurs-cloisons', fiche: 'Cloison placo', ratio: 'Hauteurs limites des cloisons sur ossature M48',
    valeur: 'Simple parement : 2,50 m (entraxe 0,60) ou 2,80 m (0,40) ; doublés 3,05 m ou 3,45 m. Double parement : 3,00 m ou 3,45 m ; doublés 3,75 m ou 4,15 m',
    source: 'DTU 25.41 / tableaux des fabricants (cloisons sur ossature 48 mm)', statut: 'verifie',
  },
  {
    id: 'vis-cloison', fiche: 'Cloison placo', ratio: 'Vis de cloison',
    valeur: '15 par m² de plaque', source: 'Pratique courante de chantier', statut: 'a_confirmer',
  },
  // ----- Carrelage -----
  {
    id: 'colle-carrelage', fiche: 'Carrelage sol', ratio: 'Colle à carrelage selon la surface du carreau',
    valeur: '≤ 500 cm² : 4 kg/m² ; ≤ 1200 cm² : 5 ; ≤ 3600 cm² : 7 ; au-delà : 8 (double encollage conseillé au-dessus de 500 cm²)',
    source: 'DTU 52.2 et fiches techniques des fabricants de mortiers-colles', statut: 'verifie',
  },
  {
    id: 'joint', fiche: 'Carrelage sol', ratio: 'Joint de carrelage',
    valeur: 'S × ((L + l) / (L × l)) × largeur de joint × épaisseur × 1 600 kg/m³ × 1,1', source: 'Formule classique des fabricants de joints (volume du joint × densité)', statut: 'verifie',
  },
  {
    id: 'croisillons', fiche: 'Carrelage sol', ratio: 'Croisillons',
    valeur: '1,1 par carreau', source: 'Pratique courante de chantier', statut: 'a_confirmer',
  },
  {
    id: 'primaire', fiche: 'Carrelage sol', ratio: 'Primaire d’accroche',
    valeur: '0,15 L par m²', source: 'Pratique courante de chantier (voir la notice du primaire)', statut: 'a_confirmer',
  },
  {
    id: 'plinthes', fiche: 'Carrelage sol', ratio: 'Plinthes',
    valeur: 'pièces de 0,6 m, porte déduite (0,83 m)', source: 'Pratique courante de chantier', statut: 'a_confirmer',
  },
  // ----- Peinture -----
  {
    id: 'rendement-peinture', fiche: 'Peinture', ratio: 'Rendement de la peinture de finition',
    valeur: '10 m² par litre et par couche (modifiable)', source: 'Fiches techniques des fabricants de peinture', statut: 'verifie',
  },
  {
    id: 'rendement-sous-couche', fiche: 'Peinture', ratio: 'Rendement de la sous-couche',
    valeur: '9 m² par litre (modifiable)', source: 'Fiches techniques des fabricants de sous-couches', statut: 'verifie',
  },
  // ----- Papier peint -----
  {
    id: 'rouleau-pp', fiche: 'Papier peint', ratio: 'Rouleau de papier peint',
    valeur: '10,05 m × 0,53 m (modifiable)', source: 'Format standard des fabricants de papier peint', statut: 'verifie',
  },
  {
    id: 'colle-pp', fiche: 'Papier peint', ratio: 'Colle à papier peint',
    valeur: '1 paquet pour 5 rouleaux (modifiable)', source: 'Pratique courante : à vérifier sur l’emballage', statut: 'a_confirmer',
  },
  // ----- Dalle béton -----
  {
    id: 'dosage-beton', fiche: 'Dalle béton', ratio: 'Dosage du ciment',
    valeur: '350 kg/m³ (ou 300) ; sable 0,40 et gravillons 0,80 m³ par m³', source: 'Fiches des cimentiers et guides de dosage du béton', statut: 'verifie',
  },
  {
    id: 'epaisseur-dalle', fiche: 'Dalle béton', ratio: 'Épaisseur minimale',
    valeur: '12 cm en maison individuelle', source: 'DTU 13.3 (dallages)', statut: 'verifie',
  },
  {
    id: 'treillis', fiche: 'Dalle béton', ratio: 'Treillis soudé ST25C',
    valeur: 'Panneau 6 × 2,4 m, recouvrement 0,32 m : S / ((6 − 0,32) × (2,4 − 0,32)) ≈ S / 11,8', source: 'DTU 13.3 et fiches des fabricants de treillis soudé', statut: 'verifie',
  },
  {
    id: 'polyane', fiche: 'Dalle béton', ratio: 'Film polyane',
    valeur: 'S × 1,2 (recouvrements), rouleau de 100 m²', source: 'DTU 13.3 (film sous dallage)', statut: 'verifie',
  },
  // ----- Parpaings -----
  {
    id: 'mortier-parpaings', fiche: 'Mur en parpaings', ratio: 'Mortier de montage',
    valeur: '35 kg/m² pour un bloc de 20 cm (55 kg/m² avec joints verticaux garnis), proportionnel à l’épaisseur', source: 'Fiches techniques des fabricants de mortiers de maçonnerie', statut: 'verifie',
  },
  {
    id: 'linteaux', fiche: 'Mur en parpaings', ratio: 'Linteaux',
    valeur: '1 linteau de 1,2 m par ouverture', source: 'Pratique courante de chantier', statut: 'a_confirmer',
  },
  // ----- Général -----
  {
    id: 'pertes', fiche: 'Toutes', ratio: 'Pertes par défaut',
    valeur: 'Placo 10 %, carrelage 10 % (15 % en diagonale), peinture 10 %, maçonnerie 5 %', source: 'Choix personnel (modifiable dans Réglages)', statut: 'a_confirmer',
  },
]
