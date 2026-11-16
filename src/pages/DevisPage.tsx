import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useStore } from '../store'
import { Page, Introuvable } from '../ui/Page'
import { devisGlobal, totalPiece } from '../calculs/chantier'
import { fmtEuro, fmtNombre } from '../calculs/format'
import { texteDevis } from '../calculs/texte'

async function copier(texte: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texte)
    return true
  } catch {
    try {
      const zone = document.createElement('textarea')
      zone.value = texte
      document.body.appendChild(zone)
      zone.select()
      const ok = document.execCommand('copy')
      zone.remove()
      return ok
    } catch {
      return false
    }
  }
}

export function DevisPage() {
  const { cid } = useParams()
  const { etat, prixMap } = useStore()
  const [message, setMessage] = useState('')
  const chantier = etat.chantiers.find((c) => c.id === cid)
  const devis = useMemo(() => (chantier ? devisGlobal(chantier, etat.pertes, prixMap) : null), [chantier, etat.pertes, prixMap])
  if (!chantier || !devis) return <Introuvable quoi="Ce chantier" />

  const sousTotaux = chantier.pieces.map((p) => ({ nom: p.nom, total: totalPiece(p, etat.pertes, prixMap) }))

  const partager = async () => {
    const texte = texteDevis(chantier.nom, devis, sousTotaux)
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: `Devis – ${chantier.nom}`, text: texte })
        return
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
      }
    }
    setMessage((await copier(texte)) ? 'Liste copiée dans le presse-papiers ✔' : 'Copie impossible sur cet appareil.')
    window.setTimeout(() => setMessage(''), 3500)
  }

  return (
    <Page titre="Devis global" retour={`/chantier/${chantier.id}`}>
      <div className="entete-impression">
        <h2>Devis – {chantier.nom}</h2>
        <p>Édité le {new Date().toLocaleDateString('fr-FR')} · prix TTC indicatifs</p>
      </div>

      <div className="actions no-print">
        <button className="bouton principal" onClick={() => window.print()}>
          🖨 Exporter en PDF
        </button>
        <button className="bouton" onClick={partager}>
          📤 Partager la liste
        </button>
      </div>
      {message && <p className="message no-print">{message}</p>}

      {devis.familles.length === 0 && <p className="vide">Aucun matériau : ajoutez des travaux dans les pièces.</p>}

      {devis.familles.map((f) => (
        <section key={f.famille} className="famille">
          <h2>{f.nom}</h2>
          <table className="tableau">
            <thead>
              <tr>
                <th>Matériau</th>
                <th className="num">Qté</th>
                <th className="num">P.U.</th>
                <th className="num">Total</th>
              </tr>
            </thead>
            <tbody>
              {f.lignes.map((l) => (
                <tr key={l.cle}>
                  <td>
                    {l.nom}
                    <small>
                      {l.unite}
                      {l.note ? ` · ${l.note}` : ''}
                    </small>
                  </td>
                  <td className="num">{fmtNombre(l.quantite, 0)}</td>
                  <td className="num">{fmtEuro(l.prixUnitaire)}</td>
                  <td className="num">{fmtEuro(l.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}>Sous-total {f.nom.toLowerCase()}</td>
                <td className="num">{fmtEuro(f.total)}</td>
              </tr>
            </tfoot>
          </table>
        </section>
      ))}

      <div className="total grand">
        <span>TOTAL TTC</span>
        <strong>{fmtEuro(devis.total)}</strong>
      </div>

      {sousTotaux.length > 0 && (
        <section className="famille">
          <h2>Estimation par pièce</h2>
          <p className="note">
            Somme des travaux de chaque pièce, chacun arrondi séparément : le total du devis global est plus précis (quantités
            regroupées avant arrondi).
          </p>
          <table className="tableau">
            <tbody>
              {sousTotaux.map((s, i) => (
                <tr key={i}>
                  <td>{s.nom}</td>
                  <td className="num">{fmtEuro(s.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </Page>
  )
}
