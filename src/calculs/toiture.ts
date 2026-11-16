// Toiture en tuiles, avec gouttières en option.
import { type Fiche, type Resultat, type Pertes, nb, perteEffective, arrondiSup } from './commun'

const PERTE = 5

export interface EntreesToiture {
  pans: number | null
  rampant: number | null
  largeur: number | null
  pente: number | null
  tuile: string
  faitage: number | null
  egout: number | null
  gouttiere: boolean
  gouttiereLongueur: number | null
  descentes: number | null
  hauteurDescente: number | null
  perte: number | null
}

/** par type de tuile : nombre au m², mètres de liteaux au m², pente minimale (%) */
export const TYPES_TUILE: Record<string, { label: string; n: number; liteaux: number; id: string; penteMin: number }> = {
  mecanique: { label: 'Tuile mécanique', n: 12, liteaux: 2.7, id: 'tuile-mecanique', penteMin: 19 },
  'grand-moule': { label: 'Tuile grand moule', n: 10, liteaux: 2.4, id: 'tuile-grand-moule', penteMin: 19 },
  plate: { label: 'Tuile plate', n: 45, liteaux: 10.5, id: 'tuile-plate', penteMin: 60 },
}

/** Format de gouttière conseillé selon la surface de toiture par descente */
export function formatGouttiere(surfaceParDescente: number): { gouttiere: number; descente: number } {
  if (surfaceParDescente < 35) return { gouttiere: 16, descente: 50 }
  if (surfaceParDescente <= 80) return { gouttiere: 25, descente: 80 }
  return { gouttiere: 33, descente: 100 }
}

export function calculerToiture(e: EntreesToiture, _pertes?: Pertes): Resultat {
  const perte = perteEffective(e.perte, PERTE)
  const S = nb(e.pans) * nb(e.rampant) * nb(e.largeur)
  const t = TYPES_TUILE[e.tuile] ?? TYPES_TUILE.mecanique
  const pente = nb(e.pente)
  const r = pente > 30 ? 0.1 : 0.2
  // faîtage et égout : par défaut, un faîtage de la largeur du pan et un égout par pan
  const faitage = e.faitage === null || e.faitage === undefined ? nb(e.largeur) : nb(e.faitage)
  const egout = e.egout === null || e.egout === undefined ? nb(e.largeur) * nb(e.pans) : nb(e.egout)

  const lignes: Resultat['lignes'] = [
    { materiauId: t.id, quantite: S * (1 + perte) * t.n },
    { materiauId: 'liteau-27x40', quantite: (S * t.liteaux) / 4 },
    { materiauId: 'contre-liteau', quantite: S / 0.6 / 4 },
    { materiauId: 'ecran-hpv', quantite: (S * 1.5) / (1.5 - r) / 75 },
    { materiauId: 'faitiere', quantite: faitage * 3 },
    { materiauId: 'closoir-ventile', quantite: (faitage + egout) / 5 },
  ]
  const infos: Resultat['infos'] = [
    { cle: 'surface', label: 'Surface de toiture', valeur: S, unite: 'm²' },
    { cle: 'tuiles', label: 'Tuiles (avec marge)', valeur: S * (1 + perte) * t.n },
    { cle: 'liteauxM', label: 'Liteaux', valeur: S * t.liteaux, unite: 'm' },
    { cle: 'ecranM2', label: 'Écran de sous-toiture', valeur: (S * 1.5) / (1.5 - r), unite: 'm²' },
  ]
  const avertissements: string[] = []
  const notes: string[] = []

  if (pente > 0 && pente < t.penteMin) {
    avertissements.push(`Pente de ${pente} % sous le minimum courant de ${t.penteMin} % : lisez la notice du modèle de tuile.`)
  }

  if (e.gouttiere) {
    const G = e.gouttiereLongueur === null || e.gouttiereLongueur === undefined ? egout : nb(e.gouttiereLongueur)
    const D = nb(e.descentes), H = nb(e.hauteurDescente)
    const profiles = arrondiSup(G / 4)
    lignes.push(
      { materiauId: 'gouttiere-profile', quantite: profiles },
      { materiauId: 'crochet-gouttiere', quantite: G > 0 ? arrondiSup(G / 0.4) + 1 : 0 },
      { materiauId: 'jonction-gouttiere', quantite: Math.max(0, profiles - 1) },
      { materiauId: 'naissance-gouttiere', quantite: D },
      { materiauId: 'fond-gouttiere', quantite: G > 0 ? 2 : 0 },
      { materiauId: 'tube-descente-80', quantite: arrondiSup((D * H) / 2) },
      { materiauId: 'collier-descente', quantite: H > 0 ? D * (arrondiSup(H / 2) + 1) : 0 },
      { materiauId: 'coude-80', quantite: D * 2 },
    )
    if (D > 0) {
      const f = formatGouttiere(S / D)
      notes.push(
        `Format conseillé pour ${Math.round(S / D)} m² par descente : gouttière de ${f.gouttiere} cm et descente Ø ${f.descente}.` +
          (f.gouttiere !== 25 ? ' Les prix de l’appli sont ceux d’une gouttière de 25 cm et d’une descente Ø 80.' : ''),
      )
    }
    if (G > 0) {
      const mini = arrondiSup(G / 15)
      if (D < mini) avertissements.push(`Prévoir une descente tous les 12 à 15 m : au moins ${mini} pour ${String(G).replace('.', ',')} m de gouttière.`)
    }
  }

  notes.push(
    'Déclaration préalable si le matériau ou la couleur de la toiture changent (art. R421-17), à vérifier avec le PLU et, selon le lieu, l’architecte des bâtiments de France. Métropole européenne de Lille : dépôt en ligne sur le guichet GNAU.',
    'Charpente, échafaudage et dépose de l’ancienne couverture non inclus.',
  )

  return { lignes: lignes.filter((x) => x.quantite > 0), infos, avertissements, notes }
}

export const ficheToiture: Fiche<EntreesToiture> = {
  id: 'toiture-tuiles',
  nom: 'Toiture en tuiles',
  groupe: 'exterieur',
  icone: 'toiture',
  champs: [
    { type: 'nombre', id: 'pans', label: 'Nombre de pans', entier: true },
    { type: 'nombre', id: 'rampant', label: 'Longueur du rampant (du faîtage à l’égout)', unite: 'm' },
    { type: 'nombre', id: 'largeur', label: 'Largeur du pan', unite: 'm' },
    { type: 'nombre', id: 'pente', label: 'Pente', unite: '%' },
    {
      type: 'choix', id: 'tuile', label: 'Type de tuile',
      options: [
        { valeur: 'mecanique', label: 'Mécanique' },
        { valeur: 'grand-moule', label: 'Grand moule' },
        { valeur: 'plate', label: 'Plate' },
      ],
    },
    { type: 'titre', id: 'options', label: 'Options' },
    { type: 'nombre', id: 'faitage', label: 'Longueur de faîtage', unite: 'm', aide: 'Vide = largeur d’un pan' },
    { type: 'nombre', id: 'egout', label: 'Longueur d’égout', unite: 'm', aide: 'Vide = largeur d’un pan × nombre de pans' },
    { type: 'oui_non', id: 'gouttiere', label: 'Gouttière et descentes' },
    { type: 'nombre', id: 'gouttiereLongueur', label: 'Longueur de gouttière', unite: 'm', aide: 'Vide = longueur d’égout', visible: (e: EntreesToiture) => e.gouttiere },
    { type: 'nombre', id: 'descentes', label: 'Nombre de descentes', entier: true, visible: (e: EntreesToiture) => e.gouttiere },
    { type: 'nombre', id: 'hauteurDescente', label: 'Hauteur d’une descente', unite: 'm', visible: (e: EntreesToiture) => e.gouttiere },
  ],
  defauts: () => ({
    pans: 2, rampant: null, largeur: null, pente: 40, tuile: 'mecanique', faitage: null, egout: null,
    gouttiere: false, gouttiereLongueur: null, descentes: 2, hauteurDescente: 3, perte: null,
  }),
  perteDefaut: () => PERTE,
  calculer: calculerToiture,
  materiaux: [
    'tuile-mecanique', 'tuile-grand-moule', 'tuile-plate', 'liteau-27x40', 'contre-liteau', 'ecran-hpv', 'faitiere', 'closoir-ventile',
    'gouttiere-profile', 'crochet-gouttiere', 'jonction-gouttiere', 'naissance-gouttiere', 'fond-gouttiere',
    'tube-descente-80', 'collier-descente', 'coude-80',
  ],
}
