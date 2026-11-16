// ============================================================
// TOUS LES MATÉRIAUX (nom, famille, unité de vente).
// C'est le seul fichier à modifier pour ajouter un matériau.
// Les prix TTC par défaut sont dans prix-sources.json (avec leur source) ;
// ils sont modifiables ensuite dans l'appli (écran « Prix »).
// ============================================================

import prixSources from './prix-sources.json'

export type Famille =
  | 'placo' | 'isolation' | 'carrelage' | 'peinture' | 'papier-peint' | 'maconnerie'
  | 'sols' | 'exterieur' | 'toiture' | 'electricite' | 'plomberie'

export const FAMILLES: { id: Famille; nom: string }[] = [
  { id: 'placo', nom: 'Placo et cloisons' },
  { id: 'isolation', nom: 'Isolation' },
  { id: 'carrelage', nom: 'Carrelage' },
  { id: 'peinture', nom: 'Peinture' },
  { id: 'papier-peint', nom: 'Papier peint' },
  { id: 'maconnerie', nom: 'Maçonnerie' },
  { id: 'sols', nom: 'Parquet et sols' },
  { id: 'exterieur', nom: 'Extérieur (façade, terrasse)' },
  { id: 'toiture', nom: 'Toiture et gouttières' },
  { id: 'electricite', nom: 'Électricité' },
  { id: 'plomberie', nom: 'Plomberie' },
]

export interface MateriauDef {
  id: string
  nom: string
  famille: Famille
  /** Unité de vente, ex. « sac de 25 kg » */
  unite: string
  /** Si défini : la quantité achetée est arrondie au multiple supérieur de ce pas (ex. 0,5 m³) */
  pas?: number
}

export interface SourcePrix {
  enseigne: string
  url: string
  /** Prix TTC affiché sur la fiche (pour  unités de vente) */
  prix: number
  lot?: number
  date: string
  /** Lien de référence seulement : le script de mise à jour ne le lit pas */
  manuel?: boolean
}

export interface Materiau extends MateriauDef {
  /** Prix TTC par défaut d'une unité de vente */
  prix: number
  /** « releve » = lu sur une fiche produit ; « estime » = estimation */
  statut: 'releve' | 'estime'
  note?: string
  /** Date du relevé quand il n'y a pas de fiche produit (ex. « 2026-11 ») */
  date?: string
  sources: SourcePrix[]
}

/**
 * Groupe « au litre » (peinture) : les besoins sont exprimés en litres,
 * puis convertis en la combinaison de pots la moins chère.
 */
export interface GroupeLitres {
  id: string
  nom: string
  famille: Famille
  /** Pots disponibles : chacun est un matériau de la liste (prix modifiable) */
  pots: { materiauId: string; litres: number }[]
}

const TYPES_PLACO = [
  { id: 'standard', nom: 'standard (BA13)' },
  { id: 'hydro', nom: 'hydrofuge' },
  { id: 'feu', nom: 'feu' },
]
const FORMATS_PLACO = [
  { id: '250', nom: '250×120 cm', surface: 3.0 },
  { id: '240', nom: '240×120 cm', surface: 2.88 },
  { id: '300', nom: '300×120 cm', surface: 3.6 },
]

const plaques: MateriauDef[] = TYPES_PLACO.flatMap((t) =>
  FORMATS_PLACO.map((f) => ({
    id: `plaque-${t.id}-${f.id}`,
    nom: `Plaque de plâtre ${t.nom} ${f.nom}`,
    famille: 'placo' as const,
    unite: `plaque de ${String(f.surface).replace('.', ',')} m²`,
  })),
)

const pot = (
  base: string,
  nom: string,
  formats: number[],
): MateriauDef[] =>
  formats.map((litres) => ({
    id: `${base}-${String(litres).replace('.', '_')}l`,
    nom: `${nom} – pot de ${String(litres).replace('.', ',')} L`,
    famille: 'peinture' as const,
    unite: `pot de ${String(litres).replace('.', ',')} L`,
  }))

const DEFINITIONS: MateriauDef[] = [
  // ---------- PLACO ----------
  ...plaques,
  { id: 'fourrure-f530', nom: 'Fourrure / profilé F530', famille: 'placo', unite: 'barre de 3 m' },
  { id: 'suspente', nom: 'Suspente', famille: 'placo', unite: 'pièce' },
  { id: 'cheville', nom: 'Cheville de fixation', famille: 'placo', unite: 'pièce' },
  { id: 'rail-rive', nom: 'Rail de rive', famille: 'placo', unite: 'barre de 3 m' },
  { id: 'montant-m48', nom: 'Montant M48', famille: 'placo', unite: 'barre de 3 m' },
  { id: 'rail-r48', nom: 'Rail R48', famille: 'placo', unite: 'barre de 3 m' },
  { id: 'vis-25', nom: 'Vis placo 25 mm', famille: 'placo', unite: 'boîte de 1000' },
  { id: 'vis-35', nom: 'Vis placo 35 mm', famille: 'placo', unite: 'boîte de 1000' },
  { id: 'bande-joint', nom: 'Bande à joint', famille: 'placo', unite: 'rouleau de 150 m' },
  { id: 'enduit-poudre', nom: 'Enduit à joint en poudre', famille: 'placo', unite: 'sac de 25 kg' },
  { id: 'enduit-pate', nom: 'Enduit à joint en pâte', famille: 'placo', unite: 'seau de 25 kg' },
  { id: 'isolant-rouleau', nom: 'Isolant laine de verre', famille: 'placo', unite: 'rouleau de 9 m²' },
  { id: 'bande-resiliente', nom: 'Bande résiliente', famille: 'placo', unite: 'rouleau de 30 m' },

  // ---------- CARRELAGE ----------
  { id: 'carrelage-m2', nom: 'Carrelage (prix au m²)', famille: 'carrelage', unite: 'm²' },
  { id: 'colle-carrelage', nom: 'Colle à carrelage', famille: 'carrelage', unite: 'sac de 25 kg' },
  { id: 'joint-carrelage', nom: 'Joint de carrelage', famille: 'carrelage', unite: 'sac de 5 kg' },
  { id: 'croisillons', nom: 'Croisillons', famille: 'carrelage', unite: 'sachet de 200' },
  { id: 'primaire-accroche', nom: "Primaire d'accroche", famille: 'carrelage', unite: 'bidon de 5 L' },
  { id: 'plinthe-carrelage', nom: 'Plinthe carrelage', famille: 'carrelage', unite: 'pièce de 0,6 m' },
  { id: 'ragreage', nom: 'Ragréage autolissant', famille: 'carrelage', unite: 'sac de 25 kg' },

  // ---------- PEINTURE ----------
  ...pot('peinture-murs', 'Peinture murs', [1, 2.5, 5, 10]),
  ...pot('peinture-plafond', 'Peinture plafond', [1, 2.5, 5, 10]),
  ...pot('sous-couche', "Sous-couche d'impression", [1, 2.5, 5, 10]),
  { id: 'ruban-masquage', nom: 'Ruban de masquage', famille: 'peinture', unite: 'rouleau de 25 m' },
  { id: 'bache', nom: 'Bâche de protection', famille: 'peinture', unite: 'pièce' },

  // ---------- PAPIER PEINT ----------
  { id: 'papier-peint', nom: 'Papier peint', famille: 'papier-peint', unite: 'rouleau' },
  { id: 'colle-papier-peint', nom: 'Colle papier peint', famille: 'papier-peint', unite: 'paquet (5 rouleaux)' },

  // ---------- MAÇONNERIE ----------
  { id: 'ciment', nom: 'Ciment', famille: 'maconnerie', unite: 'sac de 35 kg' },
  { id: 'sable', nom: 'Sable', famille: 'maconnerie', unite: 'm³', pas: 0.5 },
  { id: 'gravillons', nom: 'Gravillons', famille: 'maconnerie', unite: 'm³', pas: 0.5 },
  { id: 'beton-pret', nom: "Béton prêt à l'emploi", famille: 'maconnerie', unite: 'm³', pas: 0.5 },
  { id: 'treillis-st25c', nom: 'Treillis soudé ST25C', famille: 'maconnerie', unite: 'panneau 2,4×6 m' },
  { id: 'film-polyane', nom: 'Film polyane', famille: 'maconnerie', unite: 'rouleau de 100 m²' },
  { id: 'bande-peripherique', nom: 'Bande périphérique', famille: 'maconnerie', unite: 'rouleau de 25 m' },
  { id: 'herisson', nom: 'Gravier 20/40 (hérisson)', famille: 'maconnerie', unite: 'm³', pas: 0.5 },
  { id: 'isolant-sous-dalle', nom: 'Isolant sous dalle', famille: 'maconnerie', unite: 'm²' },
  { id: 'parpaing-10', nom: 'Parpaing 50×20×10', famille: 'maconnerie', unite: 'bloc' },
  { id: 'parpaing-15', nom: 'Parpaing 50×20×15', famille: 'maconnerie', unite: 'bloc' },
  { id: 'parpaing-20', nom: 'Parpaing 50×20×20', famille: 'maconnerie', unite: 'bloc' },
  { id: 'mortier', nom: 'Mortier de maçonnerie', famille: 'maconnerie', unite: 'sac de 25 kg' },
  { id: 'linteau', nom: 'Linteau béton', famille: 'maconnerie', unite: 'pièce de 1,2 m' },

  // ---------- NOUVELLES FICHES (cloisons, isolation, sols, extérieur, toiture, réseaux) ----------
  { id: 'carreau-platre-5', nom: 'Carreau de plâtre 5 cm (66,6 × 50 cm)', famille: 'placo', unite: 'carreau' },
  { id: 'carreau-platre-7', nom: 'Carreau de plâtre 7 cm (66,6 × 50 cm)', famille: 'placo', unite: 'carreau' },
  { id: 'carreau-platre-10', nom: 'Carreau de plâtre 10 cm (66,6 × 50 cm)', famille: 'placo', unite: 'carreau' },
  { id: 'carreau-platre-hydro-5', nom: 'Carreau de plâtre hydrofuge 5 cm', famille: 'placo', unite: 'carreau' },
  { id: 'carreau-platre-hydro-7', nom: 'Carreau de plâtre hydrofuge 7 cm', famille: 'placo', unite: 'carreau' },
  { id: 'carreau-platre-hydro-10', nom: 'Carreau de plâtre hydrofuge 10 cm', famille: 'placo', unite: 'carreau' },
  { id: 'colle-carreaux-platre', nom: 'Colle pour carreaux de plâtre', famille: 'placo', unite: 'sac de 25 kg' },
  { id: 'platre-a-enduire', nom: 'Plâtre de blocage / à enduire', famille: 'placo', unite: 'sac de 25 kg' },
  { id: 'bande-resiliente-m', nom: 'Bande résiliente (au mètre)', famille: 'placo', unite: 'mètre' },
  { id: 'panneau-alveolaire-50', nom: 'Cloison alvéolaire Placopan 50 mm', famille: 'placo', unite: 'panneau 2,5 × 1,2 m' },
  { id: 'semelle-bois', nom: 'Semelle bois (cloison alvéolaire)', famille: 'placo', unite: 'barre de 1,85 m' },
  { id: 'rail-bois', nom: 'Rail bois (cloison alvéolaire)', famille: 'placo', unite: 'barre de 1,85 m' },
  { id: 'clavette-bois', nom: 'Clavette bois (cloison alvéolaire)', famille: 'placo', unite: 'barre de 2 m' },
  { id: 'vis-ttpc-35-500', nom: 'Vis TTPC 35 mm', famille: 'placo', unite: 'boîte de 500' },
  { id: 'vis-ttpc-70-200', nom: 'Vis TTPC 70 mm', famille: 'placo', unite: 'boîte de 200' },
  { id: 'appui-intermediaire', nom: 'Appui intermédiaire pour fourrure', famille: 'placo', unite: 'pièce' },
  { id: 'doublage-pse-80', nom: 'Doublage PSE TH32 80 mm + plaque', famille: 'isolation', unite: 'panneau 2,5 × 1,2 m' },
  { id: 'doublage-pse-100', nom: 'Doublage PSE TH32 100 mm + plaque', famille: 'isolation', unite: 'panneau 2,5 × 1,2 m' },
  { id: 'doublage-pse-120', nom: 'Doublage PSE TH32 120 mm + plaque', famille: 'isolation', unite: 'panneau 2,5 × 1,2 m' },
  { id: 'doublage-pse-140', nom: 'Doublage PSE TH32 140 mm + plaque', famille: 'isolation', unite: 'panneau 2,5 × 1,2 m' },
  { id: 'mortier-adhesif', nom: 'Mortier adhésif pour doublage', famille: 'isolation', unite: 'sac de 25 kg' },
  { id: 'laine-verre-100', nom: 'Laine de verre kraft 100 mm', famille: 'isolation', unite: 'rouleau de 3,24 m²' },
  { id: 'laine-verre-120', nom: 'Laine de verre kraft 120 mm', famille: 'isolation', unite: 'rouleau de 3,24 m²' },
  { id: 'laine-verre-140', nom: 'Laine de verre kraft 140 mm', famille: 'isolation', unite: 'rouleau de 3,24 m²' },
  { id: 'laine-roche-souffler', nom: 'Laine de roche à souffler (combles)', famille: 'isolation', unite: 'sac de 20 kg' },
  { id: 'isolant-pse-mm', nom: 'Isolant PSE sous chape', famille: 'isolation', unite: 'm² par mm d\'épaisseur' },
  { id: 'isolant-pu-mm', nom: 'Isolant polyuréthane sous chape', famille: 'isolation', unite: 'm² par mm d\'épaisseur' },
  { id: 'brique-20', nom: 'Brique 20 cm (joint mince)', famille: 'maconnerie', unite: 'brique' },
  { id: 'brique-30', nom: 'Brique 30 cm (joint mince)', famille: 'maconnerie', unite: 'brique' },
  { id: 'brique-36_5', nom: 'Brique 36,5 cm (joint mince)', famille: 'maconnerie', unite: 'brique' },
  { id: 'mortier-joint-mince', nom: 'Mortier de joint mince', famille: 'maconnerie', unite: 'sac de 25 kg' },
  { id: 'beton-cell-15', nom: 'Bloc de béton cellulaire 15 cm', famille: 'maconnerie', unite: 'bloc 62,5 × 25 cm' },
  { id: 'beton-cell-17_5', nom: 'Bloc de béton cellulaire 17,5 cm', famille: 'maconnerie', unite: 'bloc 62,5 × 25 cm' },
  { id: 'beton-cell-20', nom: 'Bloc de béton cellulaire 20 cm', famille: 'maconnerie', unite: 'bloc 62,5 × 25 cm' },
  { id: 'beton-cell-22_5', nom: 'Bloc de béton cellulaire 22,5 cm', famille: 'maconnerie', unite: 'bloc 62,5 × 25 cm' },
  { id: 'beton-cell-25', nom: 'Bloc de béton cellulaire 25 cm', famille: 'maconnerie', unite: 'bloc 62,5 × 25 cm' },
  { id: 'beton-cell-30', nom: 'Bloc de béton cellulaire 30 cm', famille: 'maconnerie', unite: 'bloc 62,5 × 25 cm' },
  { id: 'colle-beton-cellulaire', nom: 'Colle pour béton cellulaire', famille: 'maconnerie', unite: 'sac de 25 kg' },
  { id: 'sable-sac', nom: 'Sable en sac', famille: 'maconnerie', unite: 'sac de 35 kg' },
  { id: 'primaire-litre', nom: 'Primaire (au litre)', famille: 'carrelage', unite: 'litre' },
  { id: 'spec', nom: 'SPEC (étanchéité sous carrelage)', famille: 'carrelage', unite: 'seau de 5 kg' },
  { id: 'bande-etancheite', nom: 'Bande d\'étanchéité', famille: 'carrelage', unite: 'mètre' },
  { id: 'stratifie-m2', nom: 'Stratifié 8+2 mm AC4 (prix au m²)', famille: 'sols', unite: 'm²' },
  { id: 'sous-couche-parquet', nom: 'Sous-couche XPS 3 mm avec pare-vapeur', famille: 'sols', unite: 'rouleau de 10,2 m²' },
  { id: 'plinthe-mdf', nom: 'Plinthe MDF', famille: 'sols', unite: 'barre de 2,4 m' },
  { id: 'barre-seuil', nom: 'Barre de seuil', famille: 'sols', unite: 'pièce' },
  { id: 'enduit-monocouche', nom: 'Enduit de façade monocouche', famille: 'exterieur', unite: 'sac de 25 kg' },
  { id: 'profile-depart', nom: 'Profilé de départ', famille: 'exterieur', unite: 'mètre' },
  { id: 'baguette-angle', nom: 'Baguette d\'angle', famille: 'exterieur', unite: 'mètre' },
  { id: 'lame-pin-21', nom: 'Lame de terrasse pin 21 mm', famille: 'exterieur', unite: 'lame de 2,4 m' },
  { id: 'lame-bois-27', nom: 'Lame de terrasse pin 27 × 144 mm', famille: 'exterieur', unite: 'lame de 2,4 m' },
  { id: 'lame-composite', nom: 'Lame de terrasse composite', famille: 'exterieur', unite: 'lame de 3,6 m' },
  { id: 'lambourde-45x70', nom: 'Lambourde 45 × 70 mm', famille: 'exterieur', unite: 'barre de 3 m' },
  { id: 'plot-reglable', nom: 'Plot réglable pour terrasse', famille: 'exterieur', unite: 'pièce' },
  { id: 'vis-terrasse-450', nom: 'Vis inox A2 5 × 60 pour terrasse', famille: 'exterieur', unite: 'seau de 450' },
  { id: 'dalle-gres-60x60', nom: 'Dalle grès cérame 60 × 60 × 2 cm', famille: 'exterieur', unite: 'dalle de 60 × 60 cm' },
  { id: 'tuile-mecanique', nom: 'Tuile mécanique (12 au m²)', famille: 'toiture', unite: 'tuile' },
  { id: 'tuile-grand-moule', nom: 'Tuile grand moule (10 au m²)', famille: 'toiture', unite: 'tuile' },
  { id: 'tuile-plate', nom: 'Tuile plate (45 au m²)', famille: 'toiture', unite: 'tuile' },
  { id: 'liteau-27x40', nom: 'Liteau 27 × 40 mm', famille: 'toiture', unite: 'barre de 4 m' },
  { id: 'contre-liteau', nom: 'Contre-liteau', famille: 'toiture', unite: 'barre de 4 m' },
  { id: 'ecran-hpv', nom: 'Écran de sous-toiture HPV', famille: 'toiture', unite: 'rouleau de 75 m²' },
  { id: 'faitiere', nom: 'Faîtière', famille: 'toiture', unite: 'pièce' },
  { id: 'closoir-ventile', nom: 'Closoir ventilé', famille: 'toiture', unite: 'rouleau de 5 m' },
  { id: 'gouttiere-profile', nom: 'Gouttière PVC 25 cm', famille: 'toiture', unite: 'profilé de 4 m' },
  { id: 'crochet-gouttiere', nom: 'Crochet de gouttière', famille: 'toiture', unite: 'pièce' },
  { id: 'jonction-gouttiere', nom: 'Jonction de gouttière', famille: 'toiture', unite: 'pièce' },
  { id: 'naissance-gouttiere', nom: 'Naissance de gouttière', famille: 'toiture', unite: 'pièce' },
  { id: 'fond-gouttiere', nom: 'Fond de gouttière', famille: 'toiture', unite: 'pièce' },
  { id: 'tube-descente-80', nom: 'Tube de descente Ø 80', famille: 'toiture', unite: 'tube de 2 m' },
  { id: 'collier-descente', nom: 'Collier de descente', famille: 'toiture', unite: 'pièce' },
  { id: 'coude-80', nom: 'Coude 67° Ø 80', famille: 'toiture', unite: 'pièce' },
  { id: 'prise-2pt', nom: 'Prise 2P+T', famille: 'electricite', unite: 'pièce' },
  { id: 'interrupteur', nom: 'Interrupteur', famille: 'electricite', unite: 'pièce' },
  { id: 'boite-dcl', nom: 'Boîte point centre DCL', famille: 'electricite', unite: 'pièce' },
  { id: 'boite-encastrement', nom: 'Boîte d\'encastrement', famille: 'electricite', unite: 'pièce' },
  { id: 'cable-3g25-100', nom: 'Câble R2V 3G2,5', famille: 'electricite', unite: 'couronne de 100 m' },
  { id: 'cable-3g15-100', nom: 'Câble R2V 3G1,5', famille: 'electricite', unite: 'couronne de 100 m' },
  { id: 'cable-3g6-m', nom: 'Câble R2V 3G6', famille: 'electricite', unite: 'mètre' },
  { id: 'gaine-icta-100', nom: 'Gaine ICTA Ø 20', famille: 'electricite', unite: 'couronne de 100 m' },
  { id: 'prise-rj45', nom: 'Prise RJ45', famille: 'electricite', unite: 'pièce' },
  { id: 'cable-cat6-100', nom: 'Câble réseau cat. 6', famille: 'electricite', unite: 'couronne de 100 m' },
  { id: 'disjoncteur', nom: 'Disjoncteur', famille: 'electricite', unite: 'pièce' },
  { id: 'tableau-3-rangees', nom: 'Tableau électrique pré-équipé 3 rangées', famille: 'electricite', unite: 'pièce' },
  { id: 'per-16', nom: 'Tube PER Ø 16', famille: 'plomberie', unite: 'couronne de 25 m' },
  { id: 'per-12', nom: 'Tube PER Ø 12', famille: 'plomberie', unite: 'couronne de 25 m' },
  { id: 'robinet-arret', nom: 'Robinet d\'arrêt', famille: 'plomberie', unite: 'pièce' },
  { id: 'raccord-per', nom: 'Raccord PER', famille: 'plomberie', unite: 'pièce' },
  { id: 'tube-pvc-32', nom: 'Tube PVC Ø 32', famille: 'plomberie', unite: 'tube de 2 m' },
  { id: 'tube-pvc-40', nom: 'Tube PVC Ø 40', famille: 'plomberie', unite: 'tube de 2 m' },
  { id: 'tube-pvc-100', nom: 'Tube PVC Ø 100', famille: 'plomberie', unite: 'tube de 2 m' },
  { id: 'coude-pvc-32', nom: 'Coude PVC Ø 32', famille: 'plomberie', unite: 'pièce' },
  { id: 'coude-pvc-40', nom: 'Coude PVC Ø 40', famille: 'plomberie', unite: 'pièce' },
  { id: 'coude-pvc-100', nom: 'Coude PVC Ø 100', famille: 'plomberie', unite: 'pièce' },
  { id: 'siphon-bonde', nom: 'Siphon ou bonde', famille: 'plomberie', unite: 'pièce' },
  { id: 'colle-pvc', nom: 'Colle PVC', famille: 'plomberie', unite: 'pot de 250 ml' },
]

export const GROUPES_LITRES: GroupeLitres[] = [
  {
    id: 'peinture-murs',
    nom: 'Peinture murs',
    famille: 'peinture',
    pots: [1, 2.5, 5, 10].map((l) => ({ materiauId: `peinture-murs-${String(l).replace('.', '_')}l`, litres: l })),
  },
  {
    id: 'peinture-plafond',
    nom: 'Peinture plafond',
    famille: 'peinture',
    pots: [1, 2.5, 5, 10].map((l) => ({ materiauId: `peinture-plafond-${String(l).replace('.', '_')}l`, litres: l })),
  },
  {
    id: 'sous-couche',
    nom: "Sous-couche d'impression",
    famille: 'peinture',
    pots: [1, 2.5, 5, 10].map((l) => ({ materiauId: `sous-couche-${String(l).replace('.', '_')}l`, litres: l })),
  },
]

interface FichierPrix {
  version: number
  dateReleve: string
  materiaux: Record<string, { prix: number; statut: 'releve' | 'estime'; note?: string; date?: string; sources: SourcePrix[] }>
}
const fichierPrix = prixSources as FichierPrix

/** Numéro de version des prix par défaut (change quand prix-sources.json est mis à jour) */
export const VERSION_PRIX = fichierPrix.version
export const DATE_RELEVE_PRIX = fichierPrix.dateReleve

export const MATERIAUX: Materiau[] = DEFINITIONS.map((d) => {
  const p = fichierPrix.materiaux[d.id]
  return { ...d, prix: p?.prix ?? 0, statut: p?.statut ?? 'estime', note: p?.note, date: p?.date, sources: p?.sources ?? [] }
})

export const MATERIAUX_PAR_ID: Record<string, Materiau> = Object.fromEntries(
  MATERIAUX.map((m) => [m.id, m]),
)

export const GROUPES_PAR_ID: Record<string, GroupeLitres> = Object.fromEntries(
  GROUPES_LITRES.map((g) => [g.id, g]),
)

/** Prix par défaut sous forme {id: prix} */
export const PRIX_DEFAUT: Record<string, number> = Object.fromEntries(
  MATERIAUX.map((m) => [m.id, m.prix]),
)

export function nomFamille(f: Famille): string {
  return FAMILLES.find((x) => x.id === f)?.nom ?? f
}
