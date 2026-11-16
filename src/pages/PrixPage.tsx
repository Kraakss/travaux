import { useState } from 'react'
import { useStore } from '../store'
import { Page } from '../ui/Page'
import { ChampNombre } from '../ui/Champs'
import { FAMILLES, MATERIAUX, type Materiau } from '../data/materiaux'
import { fmtEuro } from '../calculs/format'

const normaliser = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function LignePrix({ m }: { m: Materiau }) {
  const { id, nom, unite } = m
  const { etat, prixMap, setPrix } = useStore()
  const [edition, setEdition] = useState(false)
  const [valeur, setValeur] = useState<number | null>(null)
  const modifie = etat.prix[id]
  const actuel = prixMap[id] ?? m.prix
  const source = m.sources[0]
  const jour = (iso: string) => new Date(iso).toLocaleDateString('fr-FR')
  // « relevé le 16/11/2026 » (avec fiche produit) ou « relevé en novembre 2026 » (date au mois seulement)
  const releve = (() => {
    const d = source?.date ?? m.date ?? ''
    if (/^d{4}-d{2}$/.test(d)) return `relevé en ${new Date(`${d}-01`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
    return d ? `relevé le ${jour(d)}` : 'relevé'
  })()

  const terminer = () => {
    if (valeur !== null && valeur !== actuel) setPrix(id, valeur)
    setEdition(false)
  }

  return (
    <li className="ligne-prix">
      <div className="prix-nom">
        <strong>{nom}</strong>
        <small>
          {unite} ·{' '}
          {modifie?.source === 'utilisateur' ? (
            <>modifié par vous le {jour(modifie.modifieLe)}</>
          ) : modifie ? (
            <>mis à jour le {jour(modifie.modifieLe)}</>
          ) : m.statut === 'estime' ? (
            <span className="badge orange">estimé</span>
          ) : (
            <>{releve}</>
          )}
          {!modifie && source && (
            <>
              {' '}
              ·{' '}
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.enseigne}
              </a>
            </>
          )}
        </small>
      </div>
      {edition ? (
        <span className="avec-unite prix-saisie">
          <ChampNombre value={valeur} onChange={setValeur} autoFocus onBlur={terminer} onEnter={terminer} />
          <span>€</span>
        </span>
      ) : (
        <button
          className={
            modifie?.source === 'utilisateur' ? 'prix-bouton modifie' : !modifie && m.statut === 'estime' ? 'prix-bouton estime' : 'prix-bouton'
          }
          onClick={() => {
            setValeur(actuel)
            setEdition(true)
          }}
        >
          {fmtEuro(actuel)}
        </button>
      )}
    </li>
  )
}

export function PrixPage() {
  const { resetPrix, etat } = useStore()
  const [recherche, setRecherche] = useState('')
  const q = normaliser(recherche.trim())
  const nbModifies = Object.keys(etat.prix).length

  return (
    <Page titre="Prix TTC">
      <input
        className="recherche"
        type="search"
        placeholder="🔍 Rechercher un matériau"
        value={recherche}
        onChange={(ev) => setRecherche(ev.target.value)}
      />
      <p className="note">Touchez un prix pour le modifier. Les prix sont des moyennes indicatives.</p>

      {FAMILLES.map((f) => {
        const liste = MATERIAUX.filter((m) => m.famille === f.id && (q === '' || normaliser(m.nom).includes(q)))
        if (liste.length === 0) return null
        return (
          <section key={f.id} className="famille">
            <h2>{f.nom}</h2>
            <ul className="liste-prix">
              {liste.map((m) => (
                <LignePrix key={m.id} m={m} />
              ))}
            </ul>
          </section>
        )
      })}

      <button
        className="bouton danger large"
        disabled={nbModifies === 0}
        onClick={() => {
          if (window.confirm('Remettre tous les prix par défaut ?')) resetPrix()
        }}
      >
        ↺ Remettre les prix par défaut{nbModifies > 0 ? ` (${nbModifies} modifié${nbModifies > 1 ? 's' : ''})` : ''}
      </button>
    </Page>
  )
}
