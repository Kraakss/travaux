import { Link, useParams } from 'react-router-dom'
import { useStore } from '../store'
import { Page, Introuvable } from '../ui/Page'
import { FICHES, GROUPES_FICHES } from '../calculs'
import { IconeCategorie } from '../components/icones'

export function ChoixCategorie() {
  const { cid, pid } = useParams()
  const { etat } = useStore()
  const piece = etat.chantiers.find((c) => c.id === cid)?.pieces.find((p) => p.id === pid)
  if (!piece) return <Introuvable quoi="Cette pièce" />

  return (
    <Page titre="Quel travail ?" retour={`/chantier/${cid}/piece/${pid}`}>
      {GROUPES_FICHES.map((g) => {
        const fiches = FICHES.filter((f) => f.groupe === g.id)
        if (fiches.length === 0) return null
        return (
          <details key={g.id} className="famille-menu">
            <summary>
              {g.nom} <span className="nb">{fiches.length}</span>
            </summary>
            <div className="tuiles">
              {fiches.map((f) => (
                <Link key={f.id} to={`/chantier/${cid}/piece/${pid}/nouveau/${f.id}`} className="tuile">
                  <span className="icone"><IconeCategorie nom={f.icone} taille={56} /></span>
                  <span>{f.nom}</span>
                </Link>
              ))}
            </div>
          </details>
        )
      })}
    </Page>
  )
}
