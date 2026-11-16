import { Link, useParams } from 'react-router-dom'
import { useStore } from '../store'
import { Page, Introuvable } from '../ui/Page'
import { devisTravail, resultatTravail, totalPiece } from '../calculs/chantier'
import { trouverFiche } from '../calculs'
import { fmtEuro, fmtNombre } from '../calculs/format'

export function PiecePage() {
  const { cid, pid } = useParams()
  const { etat, prixMap, supprimerTravail } = useStore()
  const chantier = etat.chantiers.find((c) => c.id === cid)
  const piece = chantier?.pieces.find((p) => p.id === pid)
  if (!chantier || !piece) return <Introuvable quoi="Cette pièce" />
  const base = `/chantier/${chantier.id}/piece/${piece.id}`

  return (
    <Page titre={piece.nom} retour={`/chantier/${chantier.id}`}>
      <div className="total grand">
        <span>Sous-total TTC (estimation)</span>
        <strong>{fmtEuro(totalPiece(piece, etat.pertes, prixMap))}</strong>
      </div>
      <Link to={`${base}/categorie`} className="bouton principal large">
        ＋ Ajouter un travail
      </Link>

      <h2 className="sous-titre">Travaux</h2>
      {piece.travaux.length === 0 && <p className="vide">Aucun travail dans cette pièce.</p>}
      <ul className="liste">
        {piece.travaux.map((t) => {
          const fiche = trouverFiche(t.categorie)
          const premiereInfo = resultatTravail(t, etat.pertes).infos[0]
          return (
            <li key={t.id} className="carte">
              <Link to={`${base}/travail/${t.id}`} className="carte-lien">
                <strong>
                  {fiche?.icone} {fiche?.nom ?? 'Travail'}
                </strong>
                <small>
                  {premiereInfo ? `${premiereInfo.label} : ${fmtNombre(premiereInfo.valeur, 2)} ${premiereInfo.unite ?? ''} · ` : ''}
                  {fmtEuro(devisTravail(t, etat.pertes, prixMap).total)}
                </small>
              </Link>
              <button
                className="bouton danger petit"
                aria-label="Supprimer ce travail"
                onClick={() => {
                  if (window.confirm('Supprimer ce travail ?')) supprimerTravail(chantier.id, piece.id, t.id)
                }}
              >
                🗑
              </button>
            </li>
          )
        })}
      </ul>
    </Page>
  )
}
