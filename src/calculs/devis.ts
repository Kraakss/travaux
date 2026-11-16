// Calcul des prix et du devis global (fonctions pures).
import { FAMILLES, GROUPES_PAR_ID, MATERIAUX_PAR_ID, PRIX_DEFAUT, type Famille } from '../data/materiaux'
import { arrondiSup, type Resultat } from './commun'

export type Prix = Record<string, number>

export interface LigneDevis {
  cle: string
  nom: string
  unite: string
  /** Quantité fractionnaire cumulée (avant arrondi) */
  quantiteExacte: number
  /** Quantité achetée (arrondie au supérieur) */
  quantite: number
  prixUnitaire: number
  total: number
  note?: string
}

export interface FamilleDevis {
  famille: Famille
  nom: string
  lignes: LigneDevis[]
  total: number
}

export interface Devis {
  familles: FamilleDevis[]
  total: number
}

export function prixDe(id: string, prix: Prix): number {
  const p = prix[id] ?? PRIX_DEFAUT[id]
  return typeof p === 'number' && Number.isFinite(p) ? p : 0
}

const centimes = (x: number) => Math.round(x * 100) / 100

interface Pot {
  materiauId: string
  litres: number
  prix: number
}

/**
 * Combinaison de pots la moins chère qui couvre au moins `litres`.
 * (À prix égal : le moins de pots possible.)
 */
export function meilleureCombinaison(litres: number, pots: Pot[]): { materiauId: string; nombre: number }[] {
  if (!(litres > 0) || pots.length === 0) return []
  const echelle = 10 // on compte en dixièmes de litre
  const cible = arrondiSup(litres * echelle)
  const unites = pots.map((p) => Math.max(1, Math.round(p.litres * echelle)))
  const couts = pots.map((p) => Math.round(p.prix * 100))
  const maxU = Math.max(...unites)
  const taille = cible + maxU
  const INF = Number.POSITIVE_INFINITY
  const cout = new Array<number>(taille + 1).fill(INF)
  const nombre = new Array<number>(taille + 1).fill(INF)
  const via = new Array<number>(taille + 1).fill(-1)
  cout[0] = 0
  nombre[0] = 0
  for (let w = 1; w <= taille; w++) {
    for (let i = 0; i < pots.length; i++) {
      const prec = w - unites[i]
      if (prec < 0 || cout[prec] === INF) continue
      const c = cout[prec] + couts[i]
      const n = nombre[prec] + 1
      if (c < cout[w] || (c === cout[w] && n < nombre[w])) {
        cout[w] = c
        nombre[w] = n
        via[w] = i
      }
    }
  }
  let meilleur = -1
  for (let w = cible; w <= taille; w++) {
    if (cout[w] === INF) continue
    if (
      meilleur < 0 ||
      cout[w] < cout[meilleur] ||
      (cout[w] === cout[meilleur] && nombre[w] < nombre[meilleur])
    )
      meilleur = w
  }
  if (meilleur < 0) return []
  const compte = new Map<number, number>()
  for (let w = meilleur; w > 0; w -= unites[via[w]]) compte.set(via[w], (compte.get(via[w]) ?? 0) + 1)
  return [...compte.entries()]
    .map(([i, n]) => ({ materiauId: pots[i].materiauId, nombre: n, litres: pots[i].litres }))
    .sort((a, b) => b.litres - a.litres)
    .map(({ materiauId, nombre }) => ({ materiauId, nombre }))
}

const fmtL = (x: number) => String(Math.round(x * 100) / 100).replace('.', ',')

/**
 * Fusionne plusieurs résultats de calcul en un devis :
 * 1) on ADDITIONNE les quantités fractionnaires par matériau,
 * 2) PUIS on arrondit au supérieur (peinture : meilleure combinaison de pots).
 */
export function construireDevis(resultats: Resultat[], prix: Prix): Devis {
  const cumul = new Map<string, { id: string; facteur: number; detail?: string; unite?: string; quantite: number }>()
  for (const r of resultats) {
    for (const l of r.lignes) {
      const facteur = l.facteur ?? 1
      const cle = GROUPES_PAR_ID[l.materiauId] ? l.materiauId : `${l.materiauId}|${facteur}`
      const ex = cumul.get(cle)
      if (ex) ex.quantite += l.quantite
      else cumul.set(cle, { id: l.materiauId, facteur, detail: l.detail, unite: l.unite, quantite: l.quantite })
    }
  }

  const parFamille = new Map<Famille, LigneDevis[]>()
  const ajouter = (f: Famille, l: LigneDevis) => {
    const liste = parFamille.get(f) ?? []
    liste.push(l)
    parFamille.set(f, liste)
  }

  for (const [cle, c] of cumul) {
    const groupe = GROUPES_PAR_ID[c.id]
    if (groupe) {
      const pots = groupe.pots.map((p) => ({ ...p, prix: prixDe(p.materiauId, prix) }))
      for (const { materiauId, nombre } of meilleureCombinaison(c.quantite, pots)) {
        const m = MATERIAUX_PAR_ID[materiauId]
        const pu = prixDe(materiauId, prix)
        ajouter(groupe.famille, {
          cle: `${cle}:${materiauId}`,
          nom: m?.nom ?? materiauId,
          unite: m?.unite ?? 'pot',
          quantiteExacte: nombre,
          quantite: nombre,
          prixUnitaire: pu,
          total: centimes(nombre * pu),
          note: `besoin : ${fmtL(c.quantite)} L`,
        })
      }
      continue
    }
    const m = MATERIAUX_PAR_ID[c.id]
    if (!m) continue
    // Volumes (sable, gravillons…) : arrondis au pas supérieur (0,5 m³) ; le reste à l'unité entière
    const pas = m.pas ?? 1
    const quantite = pas === 1 ? arrondiSup(c.quantite) : arrondiSup(c.quantite / pas) * pas
    if (quantite <= 0) continue
    const pu = centimes(prixDe(c.id, prix) * c.facteur)
    ajouter(m.famille, {
      cle,
      nom: c.detail ? `${m.nom} (${c.detail})` : m.nom,
      unite: c.detail ? (c.unite ?? 'carton') : m.unite,
      quantiteExacte: c.quantite,
      quantite,
      prixUnitaire: pu,
      total: centimes(quantite * pu),
    })
  }

  const familles: FamilleDevis[] = FAMILLES.filter((f) => parFamille.has(f.id)).map((f) => {
    const lignes = parFamille.get(f.id)!
    return { famille: f.id, nom: f.nom, lignes, total: centimes(lignes.reduce((s, l) => s + l.total, 0)) }
  })
  return { familles, total: centimes(familles.reduce((s, f) => s + f.total, 0)) }
}
