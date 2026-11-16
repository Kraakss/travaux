import { Page } from '../ui/Page'
import { SOURCES_FORMULES, type StatutFormule } from '../data/sources-formules'

const BADGES: Record<StatutFormule, { classe: string; texte: string }> = {
  verifie: { classe: 'badge ok', texte: 'vérifié' },
  fourchette: { classe: 'badge bleu', texte: 'fourchette' },
  a_confirmer: { classe: 'badge orange', texte: 'pratique courante, à confirmer' },
}

export function SourcesPage() {
  return (
    <Page titre="Sources des calculs" retour="/reglages">
      <p className="note">
        Chaque ratio utilisé par l’appli, avec sa source. <strong>Vérifié</strong> : confirmé par une référence technique.{' '}
        <strong>Fourchette</strong> : la valeur varie selon les fabricants, l’appli retient une valeur courante.{' '}
        <strong>À confirmer</strong> : pratique courante de chantier, à comparer avec la notice du produit que vous achetez.
      </p>
      <ul className="liste">
        {SOURCES_FORMULES.map((s) => (
          <li key={s.id} className="source">
            <div className="source-tete">
              <strong>{s.ratio}</strong>
              <span className={BADGES[s.statut].classe}>{BADGES[s.statut].texte}</span>
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
