import { useState } from 'react'
import { useStore } from '../store'
import { Page } from '../ui/Page'
import { ChampNombre } from '../ui/Champs'
import { FAMILLES, MATERIAUX } from '../data/materiaux'
import { fmtEuro } from '../calculs/format'

const normaliser = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function LignePrix({ id, nom, unite }: { id: string; nom: string; unite: string }) {
  const { etat, prixMap, setPrix } = useStore()
  const [edition, setEdition] = useState(false)
  const [valeur, setValeur] = useState<number | null>(null)
  const modifie = etat.prix[id]
  const defaut = MATERIAUX.find((m) => m.id === id)!.prix
  const actuel = prixMap[id] ?? defaut

  const terminer = () => {
    if (valeur !== null && valeur !== actuel) setPrix(id, valeur)
    setEdition(false)
  }

  return (
    <li className="ligne-prix">
      <div className="prix-nom">
        <strong>{nom}</strong>
        <small>
          {unite} · {modifie ? `modifié le ${new Date(modifie.modifieLe).toLocaleDateString('fr-FR')}` : 'prix par défaut'}
        </small>
      </div>
      {edition ? (
        <span className="avec-unite prix-saisie">
          <ChampNombre value={valeur} onChange={setValeur} autoFocus onBlur={terminer} onEnter={terminer} />
          <span>€</span>
        </span>
      ) : (
        <button
          className={modifie ? 'prix-bouton modifie' : 'prix-bouton'}
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
                <LignePrix key={m.id} id={m.id} nom={m.nom} unite={m.unite} />
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
