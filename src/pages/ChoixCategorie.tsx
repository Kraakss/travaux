import { Link, useParams } from 'react-router-dom'
import { useStore } from '../store'
import { Page, Introuvable } from '../ui/Page'
import { FICHES } from '../calculs'

export function ChoixCategorie() {
  const { cid, pid } = useParams()
  const { etat } = useStore()
  const piece = etat.chantiers.find((c) => c.id === cid)?.pieces.find((p) => p.id === pid)
  if (!piece) return <Introuvable quoi="Cette pièce" />

  return (
    <Page titre="Quel travail ?" retour={`/chantier/${cid}/piece/${pid}`}>
      <div className="tuiles">
        {FICHES.map((f) => (
          <Link key={f.id} to={`/chantier/${cid}/piece/${pid}/nouveau/${f.id}`} className="tuile">
            <span className="icone">{f.icone}</span>
            <span>{f.nom}</span>
          </Link>
        ))}
      </div>
    </Page>
  )
}
