import { useMemo } from 'react'
import type { Fiche, Entrees } from '../calculs/commun'
import type { Pertes } from '../calculs/commun'
import { construireDevis, type Prix } from '../calculs/devis'
import { fmtEuro, fmtNombre } from '../calculs/format'

export function ResultatCalcul({ fiche, entrees, pertes, prix }: { fiche: Fiche; entrees: Entrees; pertes: Pertes; prix: Prix }) {
  const { res, devis } = useMemo(() => {
    const res = fiche.calculer(entrees, pertes)
    return { res, devis: construireDevis([res], prix) }
  }, [fiche, entrees, pertes, prix])

  return (
    <section className="resultat">
      <h2>Résultat</h2>
      {res.avertissements.map((a) => (
        <p key={a} className="alerte">
          ⚠️ {a}
        </p>
      ))}
      {(res.notes ?? []).map((n) => (
        <p key={n} className="conseil">
          💡 {n}
        </p>
      ))}
      <dl className="infos">
        {res.infos.map((i) => (
          <div key={i.cle}>
            <dt>{i.label}</dt>
            <dd>
              {fmtNombre(i.valeur, 2)} {i.unite ?? ''}
            </dd>
          </div>
        ))}
      </dl>
      {devis.familles.length === 0 ? (
        <p className="vide">Renseignez les dimensions pour voir les matériaux.</p>
      ) : (
        devis.familles.flatMap((f) => f.lignes).map((l) => (
          <div className="ligne-mat" key={l.cle}>
            <div className="mat-nom">
              {l.nom}
              {l.note && <small> · {l.note}</small>}
            </div>
            <div className="mat-detail">
              <span>
                <strong>{fmtNombre(l.quantite, 1)}</strong> {l.unite}
                {!l.note && l.quantiteExacte !== l.quantite && <small> ({fmtNombre(l.quantiteExacte, 2)})</small>}
              </span>
              <span>
                {fmtEuro(l.prixUnitaire)} → <strong>{fmtEuro(l.total)}</strong>
              </span>
            </div>
          </div>
        ))
      )}
      <div className="total">
        <span>Total TTC</span>
        <strong>{fmtEuro(devis.total)}</strong>
      </div>
    </section>
  )
}
