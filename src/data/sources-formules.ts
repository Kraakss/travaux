// Sources des ratios utilisés dans les calculs (affichées en lecture seule dans Réglages).
//
// Statut « verifie »     : ratio confirmé par une source technique (DTU, documentation de fabricant…).
// Statut « a_confirmer » : pratique courante de chantier, à confirmer sur la notice du produit choisi.
//
// Les références citées sont des documents de référence du métier ; les valeurs exactes
// peuvent varier d'un fabricant à l'autre : se fier à la notice du produit acheté.

export type StatutFormule = 'verifie' | 'fourchette' | 'a_confirmer'

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
  // ----- Doublages, cloisons légères -----
  {
    id: 'plaques-105', fiche: 'Doublage collé / sur ossature / Cloison alvéolaire', ratio: 'Plaques de plâtre ou panneaux de doublage',
    valeur: '1,05 m² par m² (marge de 5 %)', source: 'Documentation des fabricants (Placo®, Knauf, Siniat)', statut: 'verifie',
  },
  {
    id: 'mortier-adhesif', fiche: 'Doublage collé', ratio: 'Mortier adhésif (plots)',
    valeur: '2,5 kg par m² (fourchette courante : 2 à 3 kg/m²)', source: 'Fiches techniques des mortiers adhésifs pour doublage', statut: 'verifie',
  },
  {
    id: 'doublage-bande', fiche: 'Doublage collé / Cloison alvéolaire / Carreaux de plâtre', ratio: 'Bande à joint et enduit',
    valeur: 'Doublage collé : 1,75 m de bande par m² ; alvéolaire : 1,7 m et 0,66 kg ; carreaux de plâtre : 0,8 m ; enduit 0,5 kg/m² (doublage)', source: 'Guides de pose des fabricants', statut: 'a_confirmer',
  },
  {
    id: 'fourrures-060', fiche: 'Doublage sur ossature', ratio: 'Fourrures F530 tous les 0,60 m',
    valeur: 'colonnes = L / 0,60 arrondi au supérieur + 1 ; appuis intermédiaires tous les 1,35 m', source: 'DTU 25.41 (ouvrages en plaques de plâtre) et guides des fabricants d’ossatures', statut: 'verifie',
  },
  {
    id: 'laine-verre-doublage', fiche: 'Doublage sur ossature', ratio: 'Laine de verre, vis, résistance thermique',
    valeur: 'Rouleau de 3,24 m² ; vis TTPC 25 : 15 par m² ; R de 3,15 / 3,75 / 4,4 pour 100 / 120 / 140 mm', source: 'Fiches techniques des laines de verre (ACERMI) et des fabricants de vis', statut: 'a_confirmer',
  },
  {
    id: 'carreaux-platre-colle', fiche: 'Carreaux de plâtre', ratio: 'Colle et plâtre de blocage',
    valeur: 'kg/m² : 1,4 (5 cm), 1,8 (7 cm), 2,5 (10 cm) ; colle = ×1,5, plâtre de blocage = ×0,5', source: 'Fiches des fabricants de carreaux de plâtre (consommation variable selon la marque)', statut: 'fourchette',
  },
  {
    id: 'carreaux-platre-format', fiche: 'Carreaux de plâtre', ratio: 'Format des carreaux',
    valeur: '66,6 × 50 cm = 0,333 m², soit 3 carreaux au m²', source: 'Fiches des fabricants de carreaux de plâtre', statut: 'a_confirmer',
  },
  {
    id: 'alveolaire-accessoires', fiche: 'Cloison alvéolaire', ratio: 'Semelle, rail, clavettes, vis',
    valeur: 'Semelle et rail : L × 1,05 / 1,85 ; clavettes : (joints × 0,6 m) / 2 ; vis 35 mm : 8 par m² ; vis 70 mm : 1 par m²', source: 'Pratique courante de chantier (cloison alvéolaire)', statut: 'a_confirmer',
  },
  {
    id: 'alveolaire-hauteur', fiche: 'Cloison alvéolaire', ratio: 'Hauteur et acoustique',
    valeur: 'Placopan 50 jusqu’à 2,60 m, Placopan 72 jusqu’à 3,60 m ; isolement de 27 à 29 dB', source: 'Documentation Placo® (Placopan)', statut: 'a_confirmer',
  },
  // ----- Isolation -----
  {
    id: 'laine-roche-soufflee', fiche: 'Isolation des combles', ratio: 'Laine de roche soufflée',
    valeur: '0,846 kg par m² et par unité de R (12,7 kg/m² pour R 15) ; épaisseur soufflée : 45 mm par unité de R', source: 'Fiches des fabricants de laine de roche soufflable (Rockwool, Knauf Insulation)', statut: 'verifie',
  },
  {
    id: 'combles-dtu', fiche: 'Isolation des combles', ratio: 'Mise en œuvre',
    valeur: 'Cadres autour des spots et conduits, trappe isolée, combles ventilés', source: 'DTU 45.11 (isolation thermique des combles)', statut: 'verifie',
  },
  {
    id: 'sous-chape', fiche: 'Isolation sous chape', ratio: 'Conductivité et épaisseur',
    valeur: 'λ PSE 0,038 ; λ polyuréthane 0,025 ; épaisseur = R × λ, arrondie aux 10 mm supérieurs', source: 'Fiches ACERMI des panneaux PSE et polyuréthane', statut: 'a_confirmer',
  },
  // ----- Maçonnerie -----
  {
    id: 'briques', fiche: 'Mur en briques', ratio: 'Briques par m² et mortier de joint mince',
    valeur: '8 / 10,7 / 16 briques par m² (20 / 30 / 36,5 cm) ; mortier horizontal 1,8 / 3,0 / 4,3 kg/m², vertical garni 1,5 / 3,1 / 5,7 kg/m²', source: 'Fiches techniques Wienerberger (briques à joint mince)', statut: 'verifie',
  },
  {
    id: 'beton-cellulaire-blocs', fiche: 'Mur en béton cellulaire', ratio: 'Blocs de 62,5 × 25 cm',
    valeur: '6,4 blocs par m²', source: 'Fiches des fabricants (Ytong, Siporex)', statut: 'verifie',
  },
  {
    id: 'beton-cellulaire-colle', fiche: 'Mur en béton cellulaire', ratio: 'Colle (joint mince)',
    valeur: '4 kg/m² pour 20 cm, proportionnel à l’épaisseur (fourchette des fabricants : 3,5 à 5 kg/m²)', source: 'Fiches techniques des colles pour béton cellulaire', statut: 'fourchette',
  },
  {
    id: 'beton-cellulaire-depart', fiche: 'Mur en béton cellulaire', ratio: 'Mortier du rang de départ',
    valeur: 'L × épaisseur (m) × 28,5 kg', source: 'Pratique courante de chantier', statut: 'a_confirmer',
  },
  {
    id: 'chape-dosage', fiche: 'Chape traditionnelle', ratio: 'Dosage du ciment',
    valeur: '350 kg/m³ ; épaisseur minimale 3 cm (adhérente), 4 cm (désolidarisée), 5 cm (flottante) ; séchage ≈ 1 semaine par cm', source: 'DTU 26.2 (chapes et dalles à base de liants hydrauliques)', statut: 'verifie',
  },
  {
    id: 'chape-sable', fiche: 'Chape traditionnelle', ratio: 'Sable 0/4',
    valeur: '0,8 m³ par m³ de chape (fourchette courante : 0,75 à 1,0)', source: 'Guides de dosage des chapes traditionnelles', statut: 'fourchette',
  },
  {
    id: 'melange-beton', fiche: 'Mortier / béton à la volée', ratio: 'Dosages',
    valeur: 'Béton : 350 kg de ciment, 0,40 m³ de sable, 0,80 m³ de gravillons ; mortier de montage : 350 kg, 0,625 m³ ; scellement : 425 kg, 0,59 m³ (par m³)', source: 'Fiches des cimentiers et guides de dosage', statut: 'verifie',
  },
  {
    id: 'ragreage', fiche: 'Ragréage', ratio: 'Consommation',
    valeur: '1,5 kg par m² et par mm d’épaisseur ; primaire 0,15 L/m² ; minimum 3 mm sous carrelage ou parquet', source: 'Fiches techniques des ragréages autolissants', statut: 'verifie',
  },
  // ----- Sols et murs -----
  {
    id: 'parquet', fiche: 'Parquet / stratifié / vinyle', ratio: 'Sous-couche, plinthes, joint de dilatation',
    valeur: 'Sous-couche S × 1,05 (rouleau de 10,2 m²) ; plinthes : périmètre − 0,9 m par porte, × 1,05 ; joint de dilatation de 8 mm', source: 'DTU 51.11 (pose flottante de parquets) et notices des fabricants', statut: 'verifie',
  },
  {
    id: 'spec', fiche: 'Carrelage mural', ratio: 'SPEC (étanchéité sous carrelage)',
    valeur: '2 couches de 800 g/m² = 1,6 kg/m², plus 10 % de marge ; seau de 5 kg', source: 'Fiches techniques des systèmes d’étanchéité liquide sous carrelage (SPEC)', statut: 'verifie',
  },
  {
    id: 'plaques-hydro', fiche: 'Carrelage mural', ratio: 'Plaques hydrofugées et étanchéité de douche',
    valeur: 'Plaques hydrofugées sur au moins 1,80 m ; étanchéité relevée de 10 cm', source: 'DTU 25.41 et DTU 52.2', statut: 'verifie',
  },
  {
    id: 'bande-etancheite', fiche: 'Carrelage mural', ratio: 'Bande d’étanchéité',
    valeur: 'Longueur de la zone d’eau au sol + hauteur × nombre d’angles', source: 'Pratique courante de chantier', statut: 'a_confirmer',
  },
  // ----- Extérieur -----
  {
    id: 'monocouche', fiche: 'Enduit de façade', ratio: 'Enduit monocouche',
    valeur: '1,5 kg par m² et par mm d’épaisseur (fourchette des fabricants : 1,3 à 1,5), plus 10 % de marge', source: 'Fiches techniques des enduits monocouches (Weber, Parexlanko)', statut: 'verifie',
  },
  {
    id: 'facade-fourchette', fiche: 'Enduit de façade', ratio: 'Épaisseur et accessoires',
    valeur: 'Épaisseur courante 15 mm (minimum 10 mm) ; profilé de départ : longueur de façade ; baguettes d’angle : hauteur × angles', source: 'Fiches des enduits monocouches (consommation variable selon le produit)', statut: 'fourchette',
  },
  {
    id: 'lambourdes-entraxes', fiche: 'Terrasse sur lambourdes', ratio: 'Entraxe des lambourdes et espacement des plots',
    valeur: 'Pin 21 mm : 0,40 m et 0,50 m ; bois 27 mm et plus ou exotique : 0,50 m et 0,70 m ; composite : 0,40 m et 0,50 m', source: 'DTU 51.4 (platelages extérieurs en bois)', statut: 'verifie',
  },
  {
    id: 'vis-terrasse', fiche: 'Terrasse sur lambourdes', ratio: 'Vis inox',
    valeur: '2 vis par lame et par lambourde, soit environ 35 vis par m² ; lame + espace de 7 mm', source: 'DTU 51.4 et notices des fabricants de lames', statut: 'verifie',
  },
  {
    id: 'plots-dalles', fiche: 'Terrasse en dalles sur plots', ratio: 'Plots',
    valeur: '(L / a arrondi + 1) × (l / b arrondi + 1) : un plot à chaque angle de dalle', source: 'Pratique courante de chantier', statut: 'a_confirmer',
  },
  {
    id: 'tuiles-liteaux', fiche: 'Toiture en tuiles', ratio: 'Tuiles et liteaux par m²',
    valeur: 'Grand moule 10 tuiles et 2,4 m de liteaux ; mécanique 12 tuiles et 2,7 m ; plate 45 tuiles et 10,5 m', source: 'Fiches des fabricants de tuiles (Terreal, Imerys)', statut: 'verifie',
  },
  {
    id: 'ecran-hpv', fiche: 'Toiture en tuiles', ratio: 'Écran de sous-toiture HPV',
    valeur: 'S × 1,5 / (1,5 − r), avec r = 0,10 de recouvrement si la pente dépasse 30 %, sinon 0,20 ; rouleau de 75 m²', source: 'Notices des fabricants d’écrans HPV (recouvrements selon la pente)', statut: 'verifie',
  },
  {
    id: 'contre-liteaux', fiche: 'Toiture en tuiles', ratio: 'Contre-liteaux, faîtières, closoir',
    valeur: 'Contre-liteaux tous les 0,60 m ; faîtières : 3 par mètre de faîtage ; closoir ventilé : (faîtage + égout) / 5 m', source: 'Pratique courante de couverture', statut: 'a_confirmer',
  },
  {
    id: 'gouttiere', fiche: 'Toiture en tuiles (gouttière)', ratio: 'Accessoires de gouttière',
    valeur: 'Crochets tous les 0,40 m ; jonctions = profilés − 1 ; 2 fonds ; naissances = descentes ; colliers : 1 tous les 2 m de descente + 1 ; 2 coudes par descente', source: 'Pratique courante de couverture et notices des fabricants de gouttières PVC', statut: 'a_confirmer',
  },
  {
    id: 'gouttiere-format', fiche: 'Toiture en tuiles (gouttière)', ratio: 'Format selon la surface de toiture',
    valeur: 'Moins de 35 m² par descente : 16 cm et Ø 50 ; 35 à 80 m² : 25 cm et Ø 80 ; au-delà : 33 cm et Ø 100 ; une descente tous les 12 à 15 m', source: 'Notices des fabricants de gouttières (Nicoll, Girpi)', statut: 'a_confirmer',
  },
  // ----- Réseaux -----
  {
    id: 'prises-nfc15100', fiche: 'Électricité', ratio: 'Prises, circuits, sections',
    valeur: 'Prises par pièce (séjour : 1 par 4 m², 5 mini ; chambre 3 ; cuisine 6 ; salle de bain 1…) ; 8 prises par circuit en 1,5 mm² (16 A), 12 en 2,5 mm² (20 A) ; circuits spécialisés à 20 A ; plaque de cuisson : 32 A, 6 mm²', source: 'NF C 15-100 (installations électriques basse tension)', statut: 'verifie',
  },
  {
    id: 'cables-distances', fiche: 'Électricité', ratio: 'Longueurs de câble',
    valeur: '6 m par prise, 8 m par point lumineux, 10 m par circuit spécialisé (15 m en 6 mm²), 12 m de câble réseau par prise RJ45 (modifiables)', source: 'Estimations de chantier (dépendent de l’implantation)', statut: 'a_confirmer',
  },
  {
    id: 'evacuation-diametres', fiche: 'Plomberie', ratio: 'Diamètres d’évacuation et pente',
    valeur: 'Lavabo Ø 32 ; WC Ø 100 ; douche, baignoire, évier, lave-linge, lave-vaisselle Ø 40 ; pente de 1 à 3 cm par mètre', source: 'DTU 60.11 (règles de calcul des installations de plomberie sanitaire)', statut: 'verifie',
  },
  {
    id: 'plomberie-raccords', fiche: 'Plomberie', ratio: 'Raccords, coudes, colle',
    valeur: 'Raccords PER : 2 par arrivée ; coudes PVC : 2 par appareil ; colle PVC : 1 pot pour 8 appareils ; 1 robinet d’arrêt par arrivée', source: 'Pratique courante de plomberie', statut: 'a_confirmer',
  },
  // ----- Général -----
  {
    id: 'pertes', fiche: 'Toutes', ratio: 'Pertes par défaut',
    valeur: 'Placo 10 %, carrelage 10 % (15 % en diagonale), peinture 10 %, maçonnerie 5 %', source: 'Choix personnel (modifiable dans Réglages)', statut: 'a_confirmer',
  },
]
