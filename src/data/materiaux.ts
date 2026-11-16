// ============================================================
// TOUS LES MATÉRIAUX (nom, famille, unité de vente).
// C'est le seul fichier à modifier pour ajouter un matériau.
// Les prix TTC par défaut sont dans prix-sources.json (avec leur source) ;
// ils sont modifiables ensuite dans l'appli (écran « Prix »).
// ============================================================

import prixSources from './prix-sources.json'

export type Famille ='placo' | 'carrelage' | 'peinture' | 'papier-peint' | 'maconnerie'

export const FAMILLES: { id: Famille; nom: string }[] = [
  { id: 'placo', nom: 'Placo' },
  { id: 'carrelage', nom: 'Carrelage' },
  { id: 'peinture', nom: 'Peinture' },
  { id: 'papier-peint', nom: 'Papier peint' },
  { id: 'maconnerie', nom: 'Maçonnerie' },
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
}

export interface Materiau extends MateriauDef {
  /** Prix TTC par défaut d'une unité de vente */
  prix: number
  /** « releve » = lu sur une fiche produit ; « estime » = estimation */
  statut: 'releve' | 'estime'
  note?: string
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
  materiaux: Record<string, { prix: number; statut: 'releve' | 'estime'; note?: string; sources: SourcePrix[] }>
}
const fichierPrix = prixSources as FichierPrix

/** Numéro de version des prix par défaut (change quand prix-sources.json est mis à jour) */
export const VERSION_PRIX = fichierPrix.version
export const DATE_RELEVE_PRIX = fichierPrix.dateReleve

export const MATERIAUX: Materiau[] = DEFINITIONS.map((d) => {
  const p = fichierPrix.materiaux[d.id]
  return { ...d, prix: p?.prix ?? 0, statut: p?.statut ?? 'estime', note: p?.note, sources: p?.sources ?? [] }
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
