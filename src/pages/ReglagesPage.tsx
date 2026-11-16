import { useStore } from '../store'
import { Page } from '../ui/Page'
import { ChampNombre } from '../ui/Champs'
import { PERTES_DEFAUT, type Pertes } from '../calculs/commun'

const CHAMPS: { id: keyof Pertes; label: string }[] = [
  { id: 'placo', label: 'Placo (plafond, cloison)' },
  { id: 'carrelageDroite', label: 'Carrelage – pose droite' },
  { id: 'carrelageDiagonale', label: 'Carrelage – pose diagonale' },
  { id: 'peinture', label: 'Peinture' },
  { id: 'maconnerie', label: 'Maçonnerie (dalle, parpaings)' },
]

export function ReglagesPage() {
  const { etat, setPertes, resetPertes } = useStore()
  const modifie = CHAMPS.some((c) => etat.pertes[c.id] !== PERTES_DEFAUT[c.id])

  return (
    <Page titre="Réglages">
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
      <p className="note">
        Vos chantiers sont enregistrés uniquement sur ce téléphone, dans le navigateur. L’appli fonctionne sans connexion.
      </p>
    </Page>
  )
}
