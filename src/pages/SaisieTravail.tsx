import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store'
import { Page, Introuvable } from '../ui/Page'
import { trouverFiche } from '../calculs'
import type { Entrees } from '../calculs/commun'
import { FormulaireFiche } from '../ui/Champs'
import { ResultatCalcul } from '../ui/ResultatCalcul'

export function SaisieTravail() {
  const { cid, pid, tid, cat } = useParams()
  const { etat, prixMap, ajouterTravail, modifierTravail } = useStore()
  const nav = useNavigate()
  const piece = etat.chantiers.find((c) => c.id === cid)?.pieces.find((p) => p.id === pid)
  const existant = tid ? piece?.travaux.find((t) => t.id === tid) : undefined
  const fiche = trouverFiche(existant ? existant.categorie : cat ?? '')

  // Les valeurs de départ : travail existant (avec les nouveaux champs éventuels) ou valeurs par défaut
  const [entrees, setEntrees] = useState<Entrees>(() =>
    fiche ? { ...fiche.defauts(), ...(existant?.entrees ?? {}) } : {},
  )

  if (!piece || !fiche || (tid && !existant)) return <Introuvable quoi="Ce travail" />
  const retour = `/chantier/${cid}/piece/${pid}`

  const valider = () => {
    if (existant) modifierTravail(cid!, pid!, existant.id, entrees)
    else ajouterTravail(cid!, pid!, fiche.id, entrees)
    nav(retour, { replace: true })
  }

  return (
    <Page titre={`${fiche.icone} ${fiche.nom}`} retour={existant ? retour : `${retour}/categorie`}>
      <FormulaireFiche fiche={fiche} entrees={entrees} onChange={setEntrees} pertes={etat.pertes} />
      <ResultatCalcul fiche={fiche} entrees={entrees} pertes={etat.pertes} prix={prixMap} />
      <button className="bouton principal large collant" onClick={valider}>
        {existant ? '✔ Enregistrer les modifications' : '✔ Ajouter à la pièce'}
      </button>
    </Page>
  )
}
