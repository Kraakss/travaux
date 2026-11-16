// Règles de gestion des prix (fonctions pures, testées).
// Règle absolue : un prix modifié par l'utilisateur n'est JAMAIS écrasé automatiquement.

export interface PrixModifie {
  valeur: number
  modifieLe: string
  /** 'utilisateur' = saisi par vous ; 'auto' = venu d'une mise à jour des prix */
  source: 'utilisateur' | 'auto'
}

/** Contenu de public/prix.json */
export interface PrixEnLigne {
  version: number
  misAJour: string
  prix: Record<string, { prix: number; date: string; statut: string }>
}

/**
 * Au chargement : si la version des prix par défaut a changé, on supprime les prix « auto »
 * (ils seront remplacés par les nouveaux prix par défaut) ; les prix de l'utilisateur sont gardés.
 */
export function migrerPrix(
  prix: Record<string, PrixModifie>,
  versionStockee: unknown,
  versionActuelle: number,
): Record<string, PrixModifie> {
  if (versionStockee === versionActuelle) return prix
  return Object.fromEntries(Object.entries(prix).filter(([, p]) => p.source === 'utilisateur'))
}

/** Applique les prix reçus aux seuls prix non modifiés par l'utilisateur. */
export function fusionnerPrixEnLigne(
  prix: Record<string, PrixModifie>,
  donnees: PrixEnLigne,
  defauts: Record<string, number>,
): { prix: Record<string, PrixModifie>; changes: number } {
  const res = { ...prix }
  let changes = 0
  for (const [id, p] of Object.entries(donnees.prix)) {
    if (res[id]?.source === 'utilisateur') continue
    if (typeof p.prix !== 'number' || !(p.prix > 0) || !(id in defauts)) continue
    const avant = res[id]?.valeur ?? defauts[id]
    if (p.prix === defauts[id]) delete res[id]
    else res[id] = { valeur: p.prix, modifieLe: p.date, source: 'auto' }
    if (p.prix !== avant) changes++
  }
  return { prix: res, changes }
}
