// ============================================================
// TOUS LES MATÉRIAUX ET LEURS PRIX TTC PAR DÉFAUT (indicatifs)
// C'est le seul fichier à modifier pour ajouter un matériau.
// Les prix sont modifiables ensuite dans l'appli (écran « Prix »).
// ============================================================

export type Famille = 'placo' | 'carrelage' | 'peinture' | 'papier-peint' | 'maconnerie'

export const FAMILLES: { id: Famille; nom: string }[] = [
  { id: 'placo', nom: 'Placo' },
  { id: 'carrelage', nom: 'Carrelage' },
  { id: 'peinture', nom: 'Peinture' },
  { id: 'papier-peint', nom: 'Papier peint' },
  { id: 'maconnerie', nom: 'Maçonnerie' },
]

export interface Materiau {
  id: string
  nom: string
  famille: Famille
  /** Unité de vente, ex. « sac de 25 kg » */
  unite: string
  /** Prix TTC par défaut d'une unité de vente */
  prix: number
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
  { id: 'standard', nom: 'standard (BA13)', prixM2: 2.9 },
  { id: 'hydro', nom: 'hydrofuge', prixM2: 4.5 },
  { id: 'feu', nom: 'feu', prixM2: 5.0 },
]
const FORMATS_PLACO = [
  { id: '250', nom: '250×120 cm', surface: 3.0 },
  { id: '240', nom: '240×120 cm', surface: 2.88 },
  { id: '300', nom: '300×120 cm', surface: 3.6 },
]

const plaques: Materiau[] = TYPES_PLACO.flatMap((t) =>
  FORMATS_PLACO.map((f) => ({
    id: `plaque-${t.id}-${f.id}`,
    nom: `Plaque de plâtre ${t.nom} ${f.nom}`,
    famille: 'placo' as const,
    unite: `plaque de ${String(f.surface).replace('.', ',')} m²`,
    prix: Math.round(t.prixM2 * f.surface * 10) / 10,
  })),
)

const pot = (
  base: string,
  nom: string,
  formats: [number, number][],
): Materiau[] =>
  formats.map(([litres, prix]) => ({
    id: `${base}-${String(litres).replace('.', '_')}l`,
    nom: `${nom} – pot de ${String(litres).replace('.', ',')} L`,
    famille: 'peinture' as const,
    unite: `pot de ${String(litres).replace('.', ',')} L`,
    prix,
  }))

export const MATERIAUX: Materiau[] = [
  // ---------- PLACO ----------
  ...plaques,
  { id: 'fourrure-f530', nom: 'Fourrure / profilé F530', famille: 'placo', unite: 'barre de 3 m', prix: 3.2 },
  { id: 'suspente', nom: 'Suspente', famille: 'placo', unite: 'pièce', prix: 0.55 },
  { id: 'cheville', nom: 'Cheville de fixation', famille: 'placo', unite: 'pièce', prix: 0.25 },
  { id: 'rail-rive', nom: 'Rail de rive', famille: 'placo', unite: 'barre de 3 m', prix: 4.5 },
  { id: 'montant-m48', nom: 'Montant M48', famille: 'placo', unite: 'barre de 3 m', prix: 5.2 },
  { id: 'rail-r48', nom: 'Rail R48', famille: 'placo', unite: 'barre de 3 m', prix: 4.3 },
  { id: 'vis-25', nom: 'Vis placo 25 mm', famille: 'placo', unite: 'boîte de 1000', prix: 12.9 },
  { id: 'vis-35', nom: 'Vis placo 35 mm', famille: 'placo', unite: 'boîte de 1000', prix: 17.9 },
  { id: 'bande-joint', nom: 'Bande à joint', famille: 'placo', unite: 'rouleau de 150 m', prix: 8.9 },
  { id: 'enduit-poudre', nom: 'Enduit à joint en poudre', famille: 'placo', unite: 'sac de 25 kg', prix: 17.9 },
  { id: 'enduit-pate', nom: 'Enduit à joint en pâte', famille: 'placo', unite: 'seau de 25 kg', prix: 24.9 },
  { id: 'isolant-rouleau', nom: 'Isolant laine de verre', famille: 'placo', unite: 'rouleau de 9 m²', prix: 45 },
  { id: 'bande-resiliente', nom: 'Bande résiliente', famille: 'placo', unite: 'rouleau de 30 m', prix: 18 },

  // ---------- CARRELAGE ----------
  { id: 'carrelage-m2', nom: 'Carrelage (prix au m²)', famille: 'carrelage', unite: 'm²', prix: 25 },
  { id: 'colle-carrelage', nom: 'Colle à carrelage', famille: 'carrelage', unite: 'sac de 25 kg', prix: 19.9 },
  { id: 'joint-carrelage', nom: 'Joint de carrelage', famille: 'carrelage', unite: 'sac de 5 kg', prix: 14.9 },
  { id: 'croisillons', nom: 'Croisillons', famille: 'carrelage', unite: 'sachet de 200', prix: 3.5 },
  { id: 'primaire-accroche', nom: "Primaire d'accroche", famille: 'carrelage', unite: 'bidon de 5 L', prix: 29.9 },
  { id: 'plinthe-carrelage', nom: 'Plinthe carrelage', famille: 'carrelage', unite: 'pièce de 0,6 m', prix: 5.9 },
  { id: 'ragreage', nom: 'Ragréage autolissant', famille: 'carrelage', unite: 'sac de 25 kg', prix: 24.9 },

  // ---------- PEINTURE ----------
  ...pot('peinture-murs', 'Peinture murs', [[1, 15.9], [2.5, 32.9], [5, 59.9], [10, 109]]),
  ...pot('peinture-plafond', 'Peinture plafond', [[1, 14.9], [2.5, 29.9], [5, 49.9], [10, 89.9]]),
  ...pot('sous-couche', "Sous-couche d'impression", [[1, 12.9], [2.5, 24.9], [5, 39.9], [10, 69.9]]),
  { id: 'ruban-masquage', nom: 'Ruban de masquage', famille: 'peinture', unite: 'rouleau de 25 m', prix: 3.9 },
  { id: 'bache', nom: 'Bâche de protection', famille: 'peinture', unite: 'pièce', prix: 4.9 },

  // ---------- PAPIER PEINT ----------
  { id: 'papier-peint', nom: 'Papier peint', famille: 'papier-peint', unite: 'rouleau', prix: 19.9 },
  { id: 'colle-papier-peint', nom: 'Colle papier peint', famille: 'papier-peint', unite: 'paquet (5 rouleaux)', prix: 6.9 },

  // ---------- MAÇONNERIE ----------
  { id: 'ciment', nom: 'Ciment', famille: 'maconnerie', unite: 'sac de 35 kg', prix: 8.9 },
  { id: 'sable', nom: 'Sable', famille: 'maconnerie', unite: 'm³', prix: 48 },
  { id: 'gravillons', nom: 'Gravillons', famille: 'maconnerie', unite: 'm³', prix: 52 },
  { id: 'beton-pret', nom: "Béton prêt à l'emploi", famille: 'maconnerie', unite: 'm³', prix: 130 },
  { id: 'treillis-st25c', nom: 'Treillis soudé ST25C', famille: 'maconnerie', unite: 'panneau 2,4×6 m', prix: 65 },
  { id: 'film-polyane', nom: 'Film polyane', famille: 'maconnerie', unite: 'rouleau de 100 m²', prix: 55 },
  { id: 'bande-peripherique', nom: 'Bande périphérique', famille: 'maconnerie', unite: 'rouleau de 25 m', prix: 14.9 },
  { id: 'herisson', nom: 'Gravier 20/40 (hérisson)', famille: 'maconnerie', unite: 'm³', prix: 45 },
  { id: 'isolant-sous-dalle', nom: 'Isolant sous dalle', famille: 'maconnerie', unite: 'm²', prix: 12 },
  { id: 'parpaing-10', nom: 'Parpaing 50×20×10', famille: 'maconnerie', unite: 'bloc', prix: 1.4 },
  { id: 'parpaing-15', nom: 'Parpaing 50×20×15', famille: 'maconnerie', unite: 'bloc', prix: 1.7 },
  { id: 'parpaing-20', nom: 'Parpaing 50×20×20', famille: 'maconnerie', unite: 'bloc', prix: 1.9 },
  { id: 'mortier', nom: 'Mortier de maçonnerie', famille: 'maconnerie', unite: 'sac de 25 kg', prix: 6.9 },
  { id: 'linteau', nom: 'Linteau béton', famille: 'maconnerie', unite: 'pièce de 1,2 m', prix: 14.9 },
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
