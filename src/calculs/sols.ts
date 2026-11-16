// Sols : chape traditionnelle, ragréage, parquet / stratifié / vinyle clipsable.
import {
  type Fiche, type Resultat, type Pertes, type Ouvertures, OUVERTURES_DEFAUT,
  nb, perteEffective, nbPortes,
} from './commun'

// ---------- 9) Chape traditionnelle ----------

export interface EntreesChape {
  longueur: number | null
  largeur: number | null
  type: string
  epaisseur: number | null
  perte: number | null
}

/** Épaisseur minimale (cm) selon le type de chape */
export const EPAISSEUR_MIN_CHAPE: Record<string, number> = { adherente: 3, desolidarisee: 4, flottante: 5 }

export function calculerChape(e: EntreesChape, _pertes?: Pertes): Resultat {
  const L = nb(e.longueur), l = nb(e.largeur)
  const perte = perteEffective(e.perte, 10)
  const S = L * l
  const ep = nb(e.epaisseur)
  const V = S * (ep / 100) * (1 + perte)
  const perimetre = 2 * (L + l)
  const type = e.type in EPAISSEUR_MIN_CHAPE ? e.type : 'adherente'
  const separee = type !== 'adherente'
  const cimentKg = V * 350
  const mini = EPAISSEUR_MIN_CHAPE[type]

  const lignes: Resultat['lignes'] = [
    { materiauId: 'ciment', quantite: cimentKg / 35 },
    { materiauId: 'sable', quantite: V * 0.8 },
  ]
  if (separee) {
    lignes.push({ materiauId: 'film-polyane', quantite: (S * 1.2) / 100 })
    lignes.push({ materiauId: 'bande-peripherique', quantite: perimetre / 25 })
  }
  return {
    lignes: lignes.filter((x) => x.quantite > 0),
    infos: [
      { cle: 'surface', label: 'Surface', valeur: S, unite: 'm²' },
      { cle: 'volume', label: 'Volume de chape (avec marge)', valeur: V, unite: 'm³' },
      { cle: 'cimentKg', label: 'Ciment', valeur: cimentKg, unite: 'kg' },
    ],
    avertissements: ep > 0 && ep < mini ? [`Épaisseur trop faible : ${mini} cm minimum pour une chape ${type === 'adherente' ? 'adhérente' : type === 'desolidarisee' ? 'désolidarisée' : 'flottante'}.`] : [],
    notes: ['Séchage : environ 1 semaine par cm d’épaisseur, à vérifier sur la fiche du produit.'],
  }
}

export const ficheChape: Fiche<EntreesChape> = {
  id: 'chape',
  nom: 'Chape traditionnelle',
  groupe: 'maconnerie',
  icone: 'chape',
  champs: [
    { type: 'nombre', id: 'longueur', label: 'Longueur', unite: 'm' },
    { type: 'nombre', id: 'largeur', label: 'Largeur', unite: 'm' },
    {
      type: 'choix', id: 'type', label: 'Type de chape',
      options: [
        { valeur: 'adherente', label: 'Adhérente' },
        { valeur: 'desolidarisee', label: 'Désolidarisée' },
        { valeur: 'flottante', label: 'Flottante' },
      ],
    },
    { type: 'nombre', id: 'epaisseur', label: 'Épaisseur', unite: 'cm', aide: 'En général 4 à 6 cm' },
  ],
  defauts: () => ({ longueur: null, largeur: null, type: 'adherente', epaisseur: 5, perte: null }),
  perteDefaut: () => 10,
  calculer: calculerChape,
  materiaux: ['ciment', 'sable', 'film-polyane', 'bande-peripherique'],
}

// ---------- 10) Ragréage ----------

export interface EntreesRagreage {
  longueur: number | null
  largeur: number | null
  epaisseur: number | null
  perte: number | null
}

export function calculerRagreage(e: EntreesRagreage, _pertes?: Pertes): Resultat {
  const L = nb(e.longueur), l = nb(e.largeur)
  const perte = perteEffective(e.perte, 5)
  const S = L * l
  const ep = nb(e.epaisseur)
  const kg = S * ep * 1.5 * (1 + perte)
  const perimetre = 2 * (L + l)
  const avertissements: string[] = []
  if (ep > 0 && ep < 3) avertissements.push('Moins de 3 mm : trop fin sous un carrelage ou un parquet.')
  if (ep > 10) avertissements.push('Plus de 10 mm : prévoir un ragréage fibré ou une chape.')

  return {
    lignes: [
      { materiauId: 'ragreage', quantite: kg / 25 },
      { materiauId: 'primaire-litre', quantite: S * 0.15 },
      { materiauId: 'bande-peripherique', quantite: perimetre / 25 },
    ].filter((x) => x.quantite > 0),
    infos: [
      { cle: 'surface', label: 'Surface', valeur: S, unite: 'm²' },
      { cle: 'kg', label: 'Ragréage', valeur: kg, unite: 'kg' },
      { cle: 'primaire', label: 'Primaire', valeur: S * 0.15, unite: 'L' },
    ],
    avertissements,
  }
}

export const ficheRagreage: Fiche<EntreesRagreage> = {
  id: 'ragreage',
  nom: 'Ragréage',
  groupe: 'sols',
  icone: 'ragreage',
  champs: [
    { type: 'nombre', id: 'longueur', label: 'Longueur', unite: 'm' },
    { type: 'nombre', id: 'largeur', label: 'Largeur', unite: 'm' },
    { type: 'nombre', id: 'epaisseur', label: 'Épaisseur moyenne', unite: 'mm' },
  ],
  defauts: () => ({ longueur: null, largeur: null, epaisseur: 3, perte: null }),
  perteDefaut: () => 5,
  calculer: calculerRagreage,
  materiaux: ['ragreage', 'primaire-litre', 'bande-peripherique'],
}

// ---------- 13) Parquet / stratifié / vinyle clipsable ----------

export interface EntreesParquet {
  longueur: number | null
  largeur: number | null
  sens: string
  surfacePaquet: number | null
  ouvertures: Ouvertures
  sousCoucheIntegree: boolean
  sansPareVapeur: boolean
  perte: number | null
}

export const perteParquetDefaut = (e: Pick<EntreesParquet, 'sens'>) => (e.sens === 'diagonal' ? 15 : 10)

export function calculerParquet(e: EntreesParquet, _pertes?: Pertes): Resultat {
  const L = nb(e.longueur), l = nb(e.largeur)
  const perte = perteEffective(e.perte, perteParquetDefaut(e))
  const S = L * l
  const Sm = S * (1 + perte)
  const paquet = nb(e.surfacePaquet)
  const portes = nbPortes(e.ouvertures)
  const perimetre = 2 * (L + l)

  const lignes: Resultat['lignes'] = [
    {
      materiauId: 'stratifie-m2',
      quantite: paquet > 0 ? Sm / paquet : 0,
      facteur: paquet,
      detail: `paquet de ${String(paquet).replace('.', ',')} m²`,
      unite: 'paquet',
    },
  ]
  if (!e.sousCoucheIntegree) lignes.push({ materiauId: 'sous-couche-parquet', quantite: (S * 1.05) / 10.2 })
  if (!e.sousCoucheIntegree && e.sansPareVapeur) lignes.push({ materiauId: 'film-polyane', quantite: (S * 1.2) / 100 })
  lignes.push({ materiauId: 'plinthe-mdf', quantite: (Math.max(0, perimetre - 0.9 * portes) * 1.05) / 2.4 })
  lignes.push({ materiauId: 'barre-seuil', quantite: portes })

  return {
    lignes: lignes.filter((x) => x.quantite > 0),
    infos: [
      { cle: 'surface', label: 'Surface de la pièce', valeur: S, unite: 'm²' },
      { cle: 'surfaceMarge', label: 'Surface de lames avec marge', valeur: Sm, unite: 'm²' },
    ],
    avertissements: paquet > 0 ? [] : ['Indiquez la surface par paquet.'],
    notes: [
      'Joint de dilatation de 8 mm sur tout le pourtour (DTU 51.11).',
      'Sol irrégulier de plus de 4 mm sur 2 m : prévoir un ragréage avant la pose.',
    ],
  }
}

export const ficheParquet: Fiche<EntreesParquet> = {
  id: 'parquet',
  nom: 'Parquet / stratifié / vinyle',
  groupe: 'sols',
  icone: 'parquet',
  champs: [
    { type: 'nombre', id: 'longueur', label: 'Longueur de la pièce', unite: 'm' },
    { type: 'nombre', id: 'largeur', label: 'Largeur de la pièce', unite: 'm' },
    {
      type: 'choix', id: 'sens', label: 'Sens de pose',
      options: [{ valeur: 'droit', label: 'Droit' }, { valeur: 'diagonal', label: 'Diagonal' }],
    },
    { type: 'nombre', id: 'surfacePaquet', label: 'Surface par paquet', unite: 'm²' },
    { type: 'ouvertures', id: 'ouvertures', label: 'Portes', portesSeulement: true },
    { type: 'titre', id: 'options', label: 'Options' },
    { type: 'oui_non', id: 'sousCoucheIntegree', label: 'Sous-couche intégrée aux lames' },
    {
      type: 'oui_non', id: 'sansPareVapeur', label: 'Sous-couche sans pare-vapeur (ajoute un film polyane)',
      visible: (e: EntreesParquet) => !e.sousCoucheIntegree,
    },
  ],
  defauts: () => ({
    longueur: null, largeur: null, sens: 'droit', surfacePaquet: 2.2, ouvertures: { ...OUVERTURES_DEFAUT },
    sousCoucheIntegree: false, sansPareVapeur: false, perte: null,
  }),
  perteDefaut: perteParquetDefaut,
  calculer: calculerParquet,
  materiaux: ['stratifie-m2', 'sous-couche-parquet', 'film-polyane', 'plinthe-mdf', 'barre-seuil'],
}
