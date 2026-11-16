import { useEffect, useState } from 'react'
import {
  OUVERTURES_DEFAUT, parseNombre, type ChampDef, type Fiche, type Entrees, type Carreau, type Ouvertures, type Pertes,
} from '../calculs/commun'
import { PRESETS_CARREAU } from '../calculs/carrelage'

const texteDe = (v: number | null | undefined) => (v === null || v === undefined ? '' : String(v).replace('.', ','))

/** Champ numérique : clavier décimal, virgule ou point acceptés. */
export function ChampNombre({
  value, onChange, placeholder, entier, className, autoFocus, onBlur, onEnter,
}: {
  value: number | null | undefined
  onChange: (v: number | null) => void
  placeholder?: string
  entier?: boolean
  className?: string
  autoFocus?: boolean
  onBlur?: () => void
  onEnter?: () => void
}) {
  const [texte, setTexte] = useState(texteDe(value))
  useEffect(() => {
    const p = parseNombre(texte)
    const identique = p === (value ?? null) || (p === null && value === 0)
    if (!identique) setTexte(texteDe(value))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return (
    <input
      className={className}
      type="text"
      inputMode={entier ? 'numeric' : 'decimal'}
      autoComplete="off"
      placeholder={placeholder}
      autoFocus={autoFocus}
      value={texte}
      onFocus={(ev) => ev.target.select()}
      onBlur={onBlur}
      onKeyDown={(ev) => {
        if (ev.key === 'Enter') {
          ev.preventDefault()
          onEnter?.()
        }
      }}
      onChange={(ev) => {
        const t = ev.target.value
        if (t !== '' && !/^[0-9]*[.,]?[0-9]*$/.test(t)) return
        setTexte(t)
        const p = parseNombre(t)
        onChange(p === null ? null : entier ? Math.floor(p) : p)
      }}
    />
  )
}

function Pas({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="pas">
      <button type="button" onClick={() => onChange(Math.max(0, value - 1))} aria-label="Moins">
        −
      </button>
      <span>{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} aria-label="Plus">
        +
      </button>
    </div>
  )
}

function ChampOuvertures({ def, value, onChange }: { def: Extract<ChampDef, { type: 'ouvertures' }>; value: Ouvertures; onChange: (v: Ouvertures) => void }) {
  const o = { ...OUVERTURES_DEFAUT, ...value }
  const set = (p: Partial<Ouvertures>) => onChange({ ...o, ...p })
  return (
    <div className="groupe">
      <div className="ouverture">
        <div className="nom">
          Porte
          <span className="surf">
            <ChampNombre value={o.surfPorte} onChange={(v) => set({ surfPorte: v ?? 0 })} /> m²
          </span>
        </div>
        <Pas value={o.portes} onChange={(v) => set({ portes: v })} />
      </div>
      {!def.portesSeulement && (
        <>
          <div className="ouverture">
            <div className="nom">
              Fenêtre
              <span className="surf">
                <ChampNombre value={o.surfFenetre} onChange={(v) => set({ surfFenetre: v ?? 0 })} /> m²
              </span>
            </div>
            <Pas value={o.fenetres} onChange={(v) => set({ fenetres: v })} />
          </div>
          <div className="ouverture">
            <div className="nom">
              Personnalisée
              <span className="surf">
                <ChampNombre value={o.persoSurface} onChange={(v) => set({ persoSurface: v ?? 0 })} /> m²
              </span>
            </div>
            <Pas value={o.persoNb} onChange={(v) => set({ persoNb: v })} />
          </div>
        </>
      )}
    </div>
  )
}

function ChampCarreau({ value, onChange }: { value: Carreau; onChange: (v: Carreau) => void }) {
  const estPreset = (c: Carreau) => PRESETS_CARREAU.some((p) => p.a === c.a && p.b === c.b)
  const [libre, setLibre] = useState(!estPreset(value))
  return (
    <div>
      <div className="chips">
        {PRESETS_CARREAU.map((p) => (
          <button
            key={`${p.a}x${p.b}`}
            type="button"
            className={!libre && p.a === value.a && p.b === value.b ? 'chip actif' : 'chip'}
            onClick={() => {
              setLibre(false)
              onChange({ ...p })
            }}
          >
            {p.a}×{p.b}
          </button>
        ))}
        <button type="button" className={libre ? 'chip actif' : 'chip'} onClick={() => setLibre(true)}>
          Libre
        </button>
      </div>
      {libre && (
        <div className="deux">
          <div className="avec-unite">
            <ChampNombre value={value.a} onChange={(v) => onChange({ ...value, a: v ?? 0 })} />
            <span>cm</span>
          </div>
          <span className="x">×</span>
          <div className="avec-unite">
            <ChampNombre value={value.b} onChange={(v) => onChange({ ...value, b: v ?? 0 })} />
            <span>cm</span>
          </div>
        </div>
      )}
    </div>
  )
}

/** Formulaire généré à partir des champs d'une fiche. */
export function FormulaireFiche({
  fiche, entrees, onChange, pertes,
}: {
  fiche: Fiche
  entrees: Entrees
  onChange: (e: Entrees) => void
  pertes: Pertes
}) {
  const set = (id: string, v: Entrees[string]) => onChange({ ...entrees, [id]: v })
  const perteDef = fiche.perteDefaut ? fiche.perteDefaut(entrees, pertes) : null

  return (
    <div className="formulaire">
      {fiche.champs.map((c) => {
        if (c.visible && !c.visible(entrees)) return null
        const v = entrees[c.id]
        switch (c.type) {
          case 'titre':
            return (
              <h3 key={c.id} className="sous-titre">
                {c.label}
              </h3>
            )
          case 'nombre':
            return (
              <label key={c.id} className="champ">
                <span className="etiquette">{c.label}</span>
                <span className="avec-unite">
                  <ChampNombre value={v as number | null} entier={c.entier} onChange={(x) => set(c.id, x)} />
                  {c.unite ? <span>{c.unite}</span> : null}
                </span>
              </label>
            )
          case 'choix':
            return (
              <div key={c.id} className="champ">
                <span className="etiquette">{c.label}</span>
                <div className="segments">
                  {c.options.map((o) => (
                    <button
                      key={o.valeur}
                      type="button"
                      className={v === o.valeur ? 'segment actif' : 'segment'}
                      onClick={() => set(c.id, o.valeur)}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            )
          case 'oui_non':
            return (
              <label key={c.id} className="champ interrupteur">
                <span className="etiquette">{c.label}</span>
                <input type="checkbox" checked={Boolean(v)} onChange={(ev) => set(c.id, ev.target.checked)} />
                <span className="glissiere" aria-hidden="true" />
              </label>
            )
          case 'ouvertures':
            return (
              <div key={c.id} className="champ">
                <span className="etiquette">{c.label}</span>
                <ChampOuvertures def={c} value={v as Ouvertures} onChange={(x) => set(c.id, x)} />
              </div>
            )
          case 'carreau':
            return (
              <div key={c.id} className="champ">
                <span className="etiquette">{c.label}</span>
                <ChampCarreau value={v as Carreau} onChange={(x) => set(c.id, x)} />
              </div>
            )
        }
      })}
      {perteDef !== null && (
        <label className="champ">
          <span className="etiquette">Perte / marge (laisser vide = {String(perteDef).replace('.', ',')} % par défaut)</span>
          <span className="avec-unite">
            <ChampNombre
              value={entrees.perte as number | null}
              placeholder={String(perteDef).replace('.', ',')}
              onChange={(x) => set('perte', x)}
            />
            <span>%</span>
          </span>
        </label>
      )}
    </div>
  )
}
