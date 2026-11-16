// État de l'appli, sauvegardé dans le navigateur (localStorage).
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { PERTES_DEFAUT, type Entrees, type Pertes } from './calculs/commun'
import type { Chantier, Piece, Travail } from './calculs/chantier'
import type { Prix } from './calculs/devis'
import { fusionnerPrixEnLigne, migrerPrix, type PrixEnLigne, type PrixModifie } from './calculs/prix'
import { VERSION_PRIX, PRIX_DEFAUT } from './data/materiaux'

const CLE = 'travaux:v1'

export type { PrixEnLigne, PrixModifie }

export interface MajPrix {
  /** Date du fichier de prix reçu (prix.json) */
  misAJour: string | null
  /** Dernière fois où la mise à jour a été lancée avec succès */
  verifieLe: string | null
}

export interface Etat {
  chantiers: Chantier[]
  prix: Record<string, PrixModifie>
  pertes: Pertes
  /** Version des prix par défaut connue au dernier chargement */
  versionPrix: number
  majPrix: MajPrix
}

const ETAT_VIDE: Etat = {
  chantiers: [],
  prix: {},
  pertes: { ...PERTES_DEFAUT },
  versionPrix: VERSION_PRIX,
  majPrix: { misAJour: null, verifieLe: null },
}

function charger(): Etat {
  try {
    const brut = localStorage.getItem(CLE)
    if (!brut) return ETAT_VIDE
    const o = JSON.parse(brut)
    // Les prix enregistrés avant l'ajout du marqueur « source » ont tous été saisis par l'utilisateur.
    let prix: Record<string, PrixModifie> = {}
    if (o.prix && typeof o.prix === 'object') {
      for (const [id, p] of Object.entries(o.prix as Record<string, Partial<PrixModifie>>)) {
        if (typeof p?.valeur === 'number') {
          prix[id] = { valeur: p.valeur, modifieLe: p.modifieLe ?? new Date().toISOString(), source: p.source === 'auto' ? 'auto' : 'utilisateur' }
        }
      }
    }
    // Nouvelle version des prix par défaut : on remplace seulement les prix NON modifiés par l'utilisateur.
    prix = migrerPrix(prix, o.versionPrix, VERSION_PRIX)
    return {
      chantiers: Array.isArray(o.chantiers) ? o.chantiers : [],
      prix,
      pertes: { ...PERTES_DEFAUT, ...(o.pertes ?? {}) },
      versionPrix: VERSION_PRIX,
      majPrix: { misAJour: o.majPrix?.misAJour ?? null, verifieLe: o.majPrix?.verifieLe ?? null },
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
  /** Applique prix.json aux prix non modifiés par l'utilisateur ; renvoie le nombre de prix mis à jour */
  appliquerPrixEnLigne: (donnees: PrixEnLigne) => number
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
        setEtat((e) => ({ ...e, prix: { ...e.prix, [id]: { valeur, modifieLe: new Date().toISOString(), source: 'utilisateur' } } })),
      resetPrix: () => setEtat((e) => ({ ...e, prix: {}, majPrix: { misAJour: null, verifieLe: null } })),
      appliquerPrixEnLigne: (donnees) => {
        const { prix, changes } = fusionnerPrixEnLigne(etat.prix, donnees, PRIX_DEFAUT)
        setEtat((e) => ({ ...e, prix, majPrix: { misAJour: donnees.misAJour, verifieLe: new Date().toISOString() } }))
        return changes
      },
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
