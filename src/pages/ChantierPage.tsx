import { Link, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { useStore } from '../store'
import { Page, AjoutNom, Introuvable } from '../ui/Page'
import { devisGlobal, totalPiece } from '../calculs/chantier'
import { fmtEuro } from '../calculs/format'

export function ChantierPage() {
  const { cid } = useParams()
  const { etat, prixMap, ajouterPiece, supprimerPiece } = useStore()
  const chantier = etat.chantiers.find((c) => c.id === cid)
  const total = useMemo(
    () => (chantier ? devisGlobal(chantier, etat.pertes, prixMap).total : 0),
    [chantier, etat.pertes, prixMap],
  )
  if (!chantier) return <Introuvable quoi="Ce chantier" />

  return (
    <Page titre={chantier.nom} retour="/">
      <div className="total grand">
        <span>Total TTC du chantier</span>
        <strong>{fmtEuro(total)}</strong>
      </div>
      <Link to={`/chantier/${chantier.id}/devis`} className="bouton principal large">
        📄 Devis global
      </Link>

      <h2 className="sous-titre">Pièces</h2>
      <AjoutNom
        placeholder="Nom (ex. Salon, Cuisine…)"
        bouton="Ajouter"
        onAjout={(nom) => ajouterPiece(chantier.id, nom)}
      />
      {chantier.pieces.length === 0 && <p className="vide">Aucune pièce. Ajoutez-en une ci-dessus.</p>}
      <ul className="liste">
        {chantier.pieces.map((p) => (
          <li key={p.id} className="carte">
            <Link to={`/chantier/${chantier.id}/piece/${p.id}`} className="carte-lien">
              <strong>{p.nom}</strong>
              <small>
                {p.travaux.length} travail{p.travaux.length > 1 ? 'x' : ''} · estimation{' '}
                {fmtEuro(totalPiece(p, etat.pertes, prixMap))}
              </small>
            </Link>
            <button
              className="bouton danger petit"
              aria-label={`Supprimer ${p.nom}`}
              onClick={() => {
                if (window.confirm(`Supprimer la pièce « ${p.nom} » ?`)) supprimerPiece(chantier.id, p.id)
              }}
            >
              🗑
            </button>
          </li>
        ))}
      </ul>
    </Page>
  )
}
