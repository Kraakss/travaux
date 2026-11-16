// État de l'appli, sauvegardé dans le navigateur (localStorage).
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { PERTES_DEFAUT, type Entrees, type Pertes } from './calculs/commun'
import type { Chantier, Piece, Travail } from './calculs/chantier'
import type { Prix } from './calculs/devis'

const CLE = 'travaux:v1'

export interface PrixModifie {
  valeur: number
  modifieLe: string
}

export interface Etat {
  chantiers: Chantier[]
  prix: Record<string, PrixModifie>
  pertes: Pertes
}

const ETAT_VIDE: Etat = { chantiers: [], prix: {}, pertes: { ...PERTES_DEFAUT } }

function charger(): Etat {
  try {
    const brut = localStorage.getItem(CLE)
    if (!brut) return ETAT_VIDE
    const o = JSON.parse(brut)
    return {
      chantiers: Array.isArray(o.chantiers) ? o.chantiers : [],
      prix: o.prix && typeof o.prix === 'object' ? o.prix : {},
      pertes: { ...PERTES_DEFAUT, ...(o.pertes ?? {}) },
    }
  } catch {
    return ETAT_VIDE
  }
}

export function nouvelId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  } catch {
    /* ignore */
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

interface Store {
  etat: Etat
  prixMap: Prix
  ajouterChantier: (nom: string) => string
  supprimerChantier: (id: string) => void
  ajouterPiece: (cid: string, nom: string) => string
  supprimerPiece: (cid: string, pid: string) => void
  ajouterTravail: (cid: string, pid: string, categorie: string, entrees: Entrees) => void
  modifierTravail: (cid: string, pid: string, tid: string, entrees: Entrees) => void
  supprimerTravail: (cid: string, pid: string, tid: string) => void
  setPrix: (id: string, valeur: number) => void
  resetPrix: () => void
  setPertes: (p: Pertes) => void
  resetPertes: () => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [etat, setEtat] = useState<Etat>(charger)

  useEffect(() => {
    try {
      localStorage.setItem(CLE, JSON.stringify(etat))
    } catch {
      /* stockage plein ou interdit : on continue sans sauvegarde */
    }
  }, [etat])

  const majChantier = useCallback((cid: string, f: (c: Chantier) => Chantier) => {
    setEtat((e) => ({ ...e, chantiers: e.chantiers.map((c) => (c.id === cid ? f(c) : c)) }))
  }, [])

  const majPiece = useCallback(
    (cid: string, pid: string, f: (p: Piece) => Piece) =>
      majChantier(cid, (c) => ({ ...c, pieces: c.pieces.map((p) => (p.id === pid ? f(p) : p)) })),
    [majChantier],
  )

  const store = useMemo<Store>(() => {
    const prixMap: Prix = Object.fromEntries(Object.entries(etat.prix).map(([k, v]) => [k, v.valeur]))
    return {
      etat,
      prixMap,
      ajouterChantier: (nom) => {
        const id = nouvelId()
        const c: Chantier = { id, nom: nom.trim() || 'Chantier sans nom', creeLe: new Date().toISOString(), pieces: [] }
        setEtat((e) => ({ ...e, chantiers: [c, ...e.chantiers] }))
        return id
      },
      supprimerChantier: (id) => setEtat((e) => ({ ...e, chantiers: e.chantiers.filter((c) => c.id !== id) })),
      ajouterPiece: (cid, nom) => {
        const id = nouvelId()
        majChantier(cid, (c) => ({ ...c, pieces: [...c.pieces, { id, nom: nom.trim() || 'Pièce sans nom', travaux: [] }] }))
        return id
      },
      supprimerPiece: (cid, pid) => majChantier(cid, (c) => ({ ...c, pieces: c.pieces.filter((p) => p.id !== pid) })),
      ajouterTravail: (cid, pid, categorie, entrees) =>
        majPiece(cid, pid, (p) => ({ ...p, travaux: [...p.travaux, { id: nouvelId(), categorie, entrees } as Travail] })),
      modifierTravail: (cid, pid, tid, entrees) =>
        majPiece(cid, pid, (p) => ({ ...p, travaux: p.travaux.map((t) => (t.id === tid ? { ...t, entrees } : t)) })),
      supprimerTravail: (cid, pid, tid) =>
        majPiece(cid, pid, (p) => ({ ...p, travaux: p.travaux.filter((t) => t.id !== tid) })),
      setPrix: (id, valeur) =>
        setEtat((e) => ({ ...e, prix: { ...e.prix, [id]: { valeur, modifieLe: new Date().toISOString() } } })),
      resetPrix: () => setEtat((e) => ({ ...e, prix: {} })),
      setPertes: (pertes) => setEtat((e) => ({ ...e, pertes })),
      resetPertes: () => setEtat((e) => ({ ...e, pertes: { ...PERTES_DEFAUT } })),
    }
  }, [etat, majChantier, majPiece])

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useStore(): Store {
  const s = useContext(Ctx)
  if (!s) throw new Error('StoreProvider manquant')
  return s
}
