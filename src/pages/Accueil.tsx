import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { Page, AjoutNom } from '../ui/Page'

export function Accueil() {
  const { etat, ajouterChantier, supprimerChantier } = useStore()
  const nav = useNavigate()

  return (
    <Page titre="Travaux">
      <h2 className="sous-titre">Nouveau chantier</h2>
      <AjoutNom
        placeholder="Nom (ex. Maison Dupont)"
        bouton="Créer"
        onAjout={(nom) => nav(`/chantier/${ajouterChantier(nom)}`)}
      />

      <h2 className="sous-titre">Mes chantiers</h2>
      {etat.chantiers.length === 0 && <p className="vide">Aucun chantier pour l’instant. Créez-en un ci-dessus.</p>}
      <ul className="liste">
        {etat.chantiers.map((c) => (
          <li key={c.id} className="carte">
            <Link to={`/chantier/${c.id}`} className="carte-lien">
              <strong>{c.nom}</strong>
              <small>
                {c.pieces.length} pièce{c.pieces.length > 1 ? 's' : ''} · créé le {new Date(c.creeLe).toLocaleDateString('fr-FR')}
              </small>
            </Link>
            <button
              className="bouton danger petit"
              aria-label={`Supprimer ${c.nom}`}
              onClick={() => {
                if (window.confirm(`Supprimer le chantier « ${c.nom} » et tout son contenu ?`)) supprimerChantier(c.id)
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
