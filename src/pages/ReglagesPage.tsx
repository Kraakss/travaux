import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore, type PrixEnLigne } from '../store'
import { Page } from '../ui/Page'
import { ChampNombre } from '../ui/Champs'
import { PERTES_DEFAUT, type Pertes } from '../calculs/commun'
import { MATERIAUX, DATE_RELEVE_PRIX } from '../data/materiaux'

const CHAMPS: { id: keyof Pertes; label: string }[] = [
  { id: 'placo', label: 'Placo (plafond, cloison)' },
  { id: 'carrelageDroite', label: 'Carrelage – pose droite' },
  { id: 'carrelageDiagonale', label: 'Carrelage – pose diagonale' },
  { id: 'peinture', label: 'Peinture' },
  { id: 'maconnerie', label: 'Maçonnerie (dalle, parpaings)' },
]

const dateFr = (iso: string) => new Date(iso).toLocaleDateString('fr-FR')

export function ReglagesPage() {
  const { etat, setPertes, resetPertes, appliquerPrixEnLigne } = useStore()
  const modifie = CHAMPS.some((c) => etat.pertes[c.id] !== PERTES_DEFAUT[c.id])
  const [enCours, setEnCours] = useState(false)
  const [message, setMessage] = useState<{ texte: string; ok: boolean } | null>(null)
  const estimes = MATERIAUX.filter((m) => m.statut === 'estime')
  const nbUtilisateur = Object.values(etat.prix).filter((p) => p.source === 'utilisateur').length

  const mettreAJour = async () => {
    setEnCours(true)
    setMessage(null)
    try {
      const rep = await fetch(`${import.meta.env.BASE_URL}prix.json`, { cache: 'no-store' })
      if (!rep.ok) throw new Error(`HTTP ${rep.status}`)
      const donnees = (await rep.json()) as PrixEnLigne
      if (!donnees || typeof donnees.prix !== 'object') throw new Error('fichier de prix invalide')
      const nb = appliquerPrixEnLigne(donnees)
      setMessage({
        ok: true,
        texte: nb > 0 ? `${nb} prix mis à jour.` : 'Les prix sont déjà à jour.',
      })
    } catch {
      setMessage({ ok: false, texte: 'Impossible de charger les prix (hors connexion ?). Vos derniers prix sont conservés.' })
    } finally {
      setEnCours(false)
    }
  }

  return (
    <Page titre="Réglages">
      <h2 className="sous-titre">Prix</h2>
      <div className="formulaire">
        <button className="bouton principal large" onClick={mettreAJour} disabled={enCours}>
          {enCours ? 'Mise à jour…' : '🔄 Mettre à jour les prix'}
        </button>
        {message && <p className={message.ok ? 'message' : 'alerte'}>{message.texte}</p>}
        <p className="note">
          Dernière mise à jour des prix :{' '}
          <strong>
            {etat.majPrix.misAJour ? dateFr(etat.majPrix.misAJour) : `prix d’origine du ${dateFr(DATE_RELEVE_PRIX)}`}
          </strong>
          {etat.majPrix.verifieLe ? ` (vérifié le ${dateFr(etat.majPrix.verifieLe)})` : ''}.
        </p>
        <p className="note">
          Les prix que vous avez modifiés vous-même ({nbUtilisateur}) ne sont jamais remplacés. Sans connexion, les derniers prix
          enregistrés restent utilisés.
        </p>
        <Link to="/prix" className="bouton">
          💶 Voir et modifier les prix
        </Link>
      </div>

      {estimes.length > 0 && (
        <>
          <h2 className="sous-titre">Prix estimés ({estimes.length})</h2>
          <p className="note">Ces matériaux n’ont pas de prix relevé sur une fiche produit : le prix est une estimation.</p>
          <ul className="liste-estimes">
            {estimes.map((m) => (
              <li key={m.id}>
                <span className="badge orange">estimé</span> {m.nom} <small>({m.unite})</small>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className="sous-titre">Pertes par défaut</h2>
      <p className="note">
        Marge ajoutée aux surfaces pour tenir compte des chutes. Chaque travail peut aussi avoir sa propre valeur.
      </p>
      <div className="formulaire">
        {CHAMPS.map((c) => (
          <label key={c.id} className="champ">
            <span className="etiquette">{c.label}</span>
            <span className="avec-unite">
              <ChampNombre value={etat.pertes[c.id]} onChange={(v) => setPertes({ ...etat.pertes, [c.id]: v ?? 0 })} />
              <span>%</span>
            </span>
          </label>
        ))}
      </div>
      <button className="bouton large" disabled={!modifie} onClick={resetPertes}>
        ↺ Remettre les pertes par défaut
      </button>

      <h2 className="sous-titre">Calculs</h2>
      <Link to="/reglages/sources" className="bouton large">
        📚 Sources des calculs
      </Link>

      <p className="note">
        Vos chantiers sont enregistrés uniquement sur ce téléphone, dans le navigateur. L’appli fonctionne sans connexion.
      </p>
    </Page>
  )
}
