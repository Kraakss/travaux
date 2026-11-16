import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'

export function Page({ titre, retour, children, actions }: { titre: string; retour?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="app">
      <header className="entete no-print">
        {retour ? (
          <Link to={retour} className="retour" aria-label="Retour">
            ←
          </Link>
        ) : (
          <span className="logo">🏠</span>
        )}
        <h1>{titre}</h1>
        {actions}
      </header>
      <main className="contenu">{children}</main>
      <nav className="menu no-print">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'actif' : '')}>
          <span>📋</span>Chantiers
        </NavLink>
        <NavLink to="/prix" className={({ isActive }) => (isActive ? 'actif' : '')}>
          <span>💶</span>Prix
        </NavLink>
        <NavLink to="/reglages" className={({ isActive }) => (isActive ? 'actif' : '')}>
          <span>⚙️</span>Réglages
        </NavLink>
      </nav>
    </div>
  )
}

export function Introuvable({ quoi }: { quoi: string }) {
  return (
    <Page titre="Introuvable" retour="/">
      <p className="vide">{quoi} est introuvable (il a peut-être été supprimé).</p>
      <Link to="/" className="bouton">
        Retour à l’accueil
      </Link>
    </Page>
  )
}

/** Petit formulaire « nom + bouton » pour créer un chantier ou une pièce */
export function AjoutNom({ placeholder, bouton, onAjout }: { placeholder: string; bouton: string; onAjout: (nom: string) => void }) {
  return (
    <form
      className="ajout"
      onSubmit={(ev) => {
        ev.preventDefault()
        const input = ev.currentTarget.elements.namedItem('nom') as HTMLInputElement
        onAjout(input.value)
        input.value = ''
      }}
    >
      <input name="nom" type="text" placeholder={placeholder} autoComplete="off" maxLength={60} />
      <button type="submit" className="bouton principal">
        {bouton}
      </button>
    </form>
  )
}
