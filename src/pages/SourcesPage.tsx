import { Page } from '../ui/Page'
import { SOURCES_FORMULES } from '../data/sources-formules'

export function SourcesPage() {
  return (
    <Page titre="Sources des calculs" retour="/reglages">
      <p className="note">
        Chaque ratio utilisé par l’appli, avec sa source. <strong>Vérifié</strong> : confirmé par une référence technique.{' '}
        <strong>À confirmer</strong> : pratique courante de chantier, à comparer avec la notice du produit que vous achetez.
      </p>
      <ul className="liste">
        {SOURCES_FORMULES.map((s) => (
          <li key={s.id} className="source">
            <div className="source-tete">
              <strong>{s.ratio}</strong>
              <span className={s.statut === 'verifie' ? 'badge ok' : 'badge orange'}>
                {s.statut === 'verifie' ? 'vérifié' : 'pratique courante, à confirmer'}
              </span>
            </div>
            <small>{s.fiche}</small>
            <p>{s.valeur}</p>
            <small>Source : {s.source}</small>
          </li>
        ))}
      </ul>
    </Page>
  )
}
