// Mise à jour des prix : lit src/data/prix-sources.json, ouvre chaque fiche produit,
// lit le prix TTC et écrit public/prix.json.
//
// Règles :
//  - si une page est illisible ou bloquée (403, 429, captcha…), on garde l'ancien prix
//    et on note l'échec : on ne contourne JAMAIS un blocage ;
//  - les sources marquées « manuel » dans prix-sources.json sont des liens de référence : jamais lues ;
//  - un prix qui change de façon suspecte (moins de 40 % ou plus de 250 % de l'ancien) est refusé ;
//  - option --sources : met aussi à jour les prix de src/data/prix-sources.json
//    (à utiliser à la main après vérification, pas dans l'automatisation).
//
// Utilisation :  node scripts/maj-prix.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const FICHIER_SOURCES = join(racine, 'src', 'data', 'prix-sources.json')
const FICHIER_SORTIE = join(racine, 'public', 'prix.json')
const ECRIRE_SOURCES = process.argv.includes('--sources')

const UA = 'TravauxPrixBot/1.0 (+https://github.com/Kraakss/travaux; mise à jour hebdomadaire de prix)'
const PAUSE_MS = 1500
const DELAI_MS = 20000

const pause = (ms) => new Promise((r) => setTimeout(r, ms))
const arrondi = (x) => Math.round(x * 100) / 100
const aujourdhui = () => new Date().toISOString().slice(0, 10)

/** Cherche un prix dans les données structurées (JSON-LD) d'une page produit. */
export function extrairePrix(html) {
  const trouves = []
  const blocs = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  const parcourir = (o) => {
    if (!o || typeof o !== 'object') return
    if (Array.isArray(o)) return o.forEach(parcourir)
    const type = [o['@type']].flat().join(',')
    const offre = o.offers
    // on ne lit que les fiches « Product » (pas les pages de liste, qui contiennent plein de prix)
    if (offre && /Product/i.test(type)) {
      for (const of of Array.isArray(offre) ? offre : [offre]) {
        const v = Number(String(of?.price ?? of?.lowPrice ?? '').replace(',', '.'))
        if (Number.isFinite(v) && v > 0) trouves.push(v)
      }
    }
    for (const v of Object.values(o)) parcourir(v)
  }
  for (const b of blocs) {
    try {
      parcourir(JSON.parse(b[1]))
    } catch {
      /* bloc illisible : on passe au suivant */
    }
  }
  const distincts = [...new Set(trouves)]
  if (distincts.length === 1) return distincts[0]
  if (distincts.length > 1) return null // plusieurs prix : on ne devine pas
  const meta = html.match(/<meta[^>]+(?:product:price:amount|itemprop=["']price["'])[^>]*content=["']([0-9.,]+)["']/i)
  if (meta) {
    const v = Number(meta[1].replace(',', '.'))
    if (Number.isFinite(v) && v > 0) return v
  }
  return null
}

async function lirePage(url) {
  const ctrl = new AbortController()
  const minuteur = setTimeout(() => ctrl.abort(), DELAI_MS)
  try {
    const rep = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'fr-FR,fr;q=0.9' }, signal: ctrl.signal, redirect: 'follow' })
    if (rep.status === 403 || rep.status === 429 || rep.status === 503) return { erreur: `accès refusé (HTTP ${rep.status})` }
    if (!rep.ok) return { erreur: `HTTP ${rep.status}` }
    const html = await rep.text()
    if (/captcha|datadome|access denied|are you a robot/i.test(html.slice(0, 5000)) && !/application\/ld\+json/.test(html)) {
      return { erreur: 'page de vérification anti-robot (non contournée)' }
    }
    const prix = extrairePrix(html)
    return prix === null ? { erreur: 'prix introuvable dans la page' } : { prix }
  } catch (e) {
    return { erreur: e?.name === 'AbortError' ? 'délai dépassé' : `réseau : ${e?.message ?? e}` }
  } finally {
    clearTimeout(minuteur)
  }
}

async function principal() {
  const sources = JSON.parse(readFileSync(FICHIER_SOURCES, 'utf8'))
  const ancien = existsSync(FICHIER_SORTIE) ? JSON.parse(readFileSync(FICHIER_SORTIE, 'utf8')) : null
  const date = aujourdhui()
  const echecs = []
  const cachePages = new Map()
  const sortie = {}
  let nbMaj = 0

  for (const [id, m] of Object.entries(sources.materiaux)) {
    const anciensPrix = ancien?.prix?.[id]
    const srcs = []
    for (const [i, s] of m.sources.entries()) {
      // dernier prix connu pour cette source : prix.json précédent, sinon prix-sources.json
      const precedent = anciensPrix?.sources?.[i]
      const base = { ...s, prix: precedent?.url === s.url ? precedent.prix : s.prix, date: precedent?.url === s.url ? precedent.date : s.date }
      // lien de référence seulement (page non lisible par le script, ou enseigne qui refuse les robots) : on garde le prix
      if (s.manuel) {
        srcs.push(base)
        continue
      }
      if (!cachePages.has(s.url)) {
        cachePages.set(s.url, await lirePage(s.url))
        await pause(PAUSE_MS)
      }
      const res = cachePages.get(s.url)
      const lot = s.lot ?? 1
      if (res.erreur) {
        echecs.push({ id, url: s.url, raison: res.erreur })
        srcs.push(base)
        continue
      }
      const unitaire = res.prix / lot
      const ref = base.prix / lot
      if (unitaire < ref * 0.4 || unitaire > ref * 2.5) {
        echecs.push({ id, url: s.url, raison: `prix suspect (${res.prix} € au lieu de ${base.prix} €), ignoré` })
        srcs.push(base)
        continue
      }
      srcs.push({ ...s, prix: res.prix, date })
      nbMaj++
    }
    const prix =
      srcs.length > 0
        ? arrondi(srcs.reduce((t, s) => t + s.prix / (s.lot ?? 1), 0) / srcs.length)
        : m.prix
    sortie[id] = {
      prix,
      statut: m.statut,
      date: srcs.some((s) => s.date === date) ? date : (anciensPrix?.date ?? sources.dateReleve),
      sources: srcs,
    }
  }

  const fichier = {
    version: sources.version,
    misAJour: new Date().toISOString(),
    prix: sortie,
    echecs,
  }
  writeFileSync(FICHIER_SORTIE, JSON.stringify(fichier, null, 2) + '\n')

  if (ECRIRE_SOURCES) {
    for (const [id, s] of Object.entries(sortie)) {
      sources.materiaux[id].prix = s.prix
      sources.materiaux[id].sources = s.sources
    }
    sources.dateReleve = date
    writeFileSync(FICHIER_SOURCES, JSON.stringify(sources, null, 2) + '\n')
  }

  console.log(`Prix lus avec succès : ${nbMaj} source(s). Échecs : ${echecs.length}.`)
  for (const e of echecs) console.log(`  - ${e.id} : ${e.raison} (${e.url})`)
  if (process.env.GITHUB_ACTIONS && echecs.length > 0) {
    console.log(`::warning::${echecs.length} prix non mis à jour (pages inaccessibles depuis GitHub). Les anciens prix sont conservés.`)
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  principal().catch((e) => {
    console.error('Erreur inattendue :', e)
    process.exit(1)
  })
}
