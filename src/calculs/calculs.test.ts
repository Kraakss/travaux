import { describe, it, expect } from 'vitest'
import { PERTES_DEFAUT, OUVERTURES_DEFAUT, arrondiSup, parseNombre, type Resultat } from './commun'
import { calculerPlafond, fichePlafond } from './plafond'
import { calculerCarrelage, ficheCarrelage, consoColle } from './carrelage'
import { calculerPeinture, litresPeinture, fichePeinture } from './peinture'
import { calculerPapierPeint, fichePapierPeint } from './papierPeint'
import { calculerCloison, ficheCloison } from './cloison'
import { calculerDalle, ficheDalle } from './dalle'
import { calculerParpaings, ficheParpaings } from './parpaings'
import { construireDevis, meilleureCombinaison } from './devis'
import { migrerPrix, fusionnerPrixEnLigne, type PrixModifie, type PrixEnLigne } from './prix'
import { FICHES } from './index'
import { MATERIAUX, MATERIAUX_PAR_ID, GROUPES_PAR_ID, PRIX_DEFAUT } from '../data/materiaux'
import { SOURCES_FORMULES } from '../data/sources-formules'
import prixSources from '../data/prix-sources.json'

const q = (r: Resultat, id: string) => r.lignes.find((l) => l.materiauId === id)?.quantite ?? 0
const info = (r: Resultat, cle: string) => r.infos.find((i) => i.cle === cle)?.valeur ?? 0
const devisDe = (r: Resultat) => construireDevis([r], {})
const qteDevis = (r: Resultat, id: string) =>
  devisDe(r).familles.flatMap((f) => f.lignes).find((l) => l.cle.startsWith(id))?.quantite ?? 0

describe('Plafond placo', () => {
  const base = { ...fichePlafond.defauts(), longueur: 5, largeur: 5, perte: 5 }

  it('5 x 5, plaque 250x120, perte 5 %, entraxe 0,50', () => {
    const r = calculerPlafond({ ...base, entraxe: '0.5' }, PERTES_DEFAUT)
    expect(q(r, 'plaque-standard-250')).toBeCloseTo(8.75, 2)
    expect(arrondiSup(q(r, 'plaque-standard-250'))).toBe(9)
    expect(q(r, 'fourrure-f530')).toBeCloseTo(16.67, 2)
    expect(arrondiSup(q(r, 'fourrure-f530'))).toBe(17)
    expect(q(r, 'suspente')).toBe(50)
    expect(q(r, 'cheville')).toBe(50)
    expect(q(r, 'rail-rive')).toBeCloseTo(6.67, 2)
    expect(arrondiSup(q(r, 'rail-rive'))).toBe(7)
    expect(arrondiSup(q(r, 'vis-25'))).toBe(1)
    expect(arrondiSup(q(r, 'bande-joint'))).toBe(1)
    expect(arrondiSup(q(r, 'enduit-poudre'))).toBe(1)
  })
  it('entraxe 0,60 : fourrures 13,89 (14)', () => {
    const r = calculerPlafond({ ...base, entraxe: '0.6' }, PERTES_DEFAUT)
    expect(q(r, 'fourrure-f530')).toBeCloseTo(13.89, 2)
    expect(arrondiSup(q(r, 'fourrure-f530'))).toBe(14)
  })
  it('seuls les plaques et les vis utilisent la marge de perte', () => {
    const sans = calculerPlafond({ ...base, perte: 0 }, PERTES_DEFAUT)
    const avec = calculerPlafond({ ...base, perte: 20 }, PERTES_DEFAUT)
    expect(q(avec, 'plaque-standard-250')).toBeGreaterThan(q(sans, 'plaque-standard-250'))
    expect(q(avec, 'vis-25')).toBeGreaterThan(q(sans, 'vis-25'))
    for (const id of ['fourrure-f530', 'suspente', 'rail-rive', 'bande-joint', 'enduit-poudre']) {
      expect(q(avec, id)).toBeCloseTo(q(sans, id), 9)
    }
  })
})

describe('Cloison placo', () => {
  const base = {
    ...ficheCloison.defauts(), longueur: 4, hauteur: 2.5, ouvertures: { ...OUVERTURES_DEFAUT, portes: 1 },
    faces: '2', peaux: '1', entraxe: '0.6', perte: 10,
  }
  it('4 x 2,5, 1 porte, 2 faces, 1 peau, perte 10 %, entraxe 0,60', () => {
    const r = calculerCloison(base, PERTES_DEFAUT)
    expect(info(r, 'surface')).toBeCloseTo(8.3, 5)
    expect(q(r, 'plaque-standard-250')).toBeCloseTo(6.09, 2)
    expect(arrondiSup(q(r, 'plaque-standard-250'))).toBe(7)
    expect(arrondiSup(q(r, 'montant-m48'))).toBe(10)
    expect(arrondiSup(q(r, 'rail-r48'))).toBe(3)
    expect(info(r, 'bandeM')).toBeCloseTo(23.24, 2)
    expect(r.avertissements).toEqual([])
  })
  it('doubler les montants double leur nombre', () => {
    const r = calculerCloison({ ...base, doubler: true }, PERTES_DEFAUT)
    expect(q(r, 'montant-m48')).toBe(20)
  })
  it('entraxe 0,40 : plus de montants', () => {
    const r = calculerCloison({ ...base, entraxe: '0.4' }, PERTES_DEFAUT)
    expect(q(r, 'montant-m48')).toBe((10 + 1 + 2) * 1) // arrondi sup(4/0,4)=10, +1, +2 porte
  })
  it('alerte de hauteur : 2,6 m en simple parement, montants simples, entraxe 0,60', () => {
    const haute = { ...base, hauteur: 2.6, peaux: '1', doubler: false }
    const r = calculerCloison({ ...haute, entraxe: '0.6' }, PERTES_DEFAUT)
    expect(r.avertissements).toHaveLength(1)
    expect(r.avertissements[0]).toContain('Hauteur au-dessus de la limite pour cette ossature (M48)')
    expect(r.avertissements[0]).toContain('0,40')
    expect(r.avertissements[0]).toContain('doubler')
    expect(calculerCloison({ ...haute, entraxe: '0.4' }, PERTES_DEFAUT).avertissements).toEqual([])
  })
  it('limites : double parement 3,75 m avec montants doublés (0,60)', () => {
    const d = { ...base, peaux: '2', doubler: true, entraxe: '0.6' }
    expect(calculerCloison({ ...d, hauteur: 3.75 }, PERTES_DEFAUT).avertissements).toEqual([])
    expect(calculerCloison({ ...d, hauteur: 3.8 }, PERTES_DEFAUT).avertissements).toHaveLength(1)
  })
})

describe('Carrelage', () => {
  const base = { ...ficheCarrelage.defauts(), longueur: 5, largeur: 5, carreau: { a: 30, b: 30 }, surfaceCarton: 5, perte: 5 }
  it('5 x 5, carreau 30x30, pose droite, perte 5 %, carton 5 m²', () => {
    const r = calculerCarrelage(base, PERTES_DEFAUT)
    expect(info(r, 'surfaceMarge')).toBeCloseTo(26.25, 2)
    expect(info(r, 'carreaux')).toBeCloseTo(291.67, 2)
    expect(info(r, 'colleKg')).toBeCloseTo(131.25, 2)
    expect(arrondiSup(q(r, 'colle-carrelage'))).toBe(6)
    expect(q(r, 'carrelage-m2')).toBeCloseTo(5.25, 2)
    expect(arrondiSup(q(r, 'carrelage-m2'))).toBe(6)
    expect(r.notes).toContain('Double encollage recommandé au-dessus de 500 cm²')
  })
  it('colle par surface de carreau', () => {
    expect(consoColle(20 * 20)).toBe(4)
    expect(consoColle(30 * 30)).toBe(5)
    expect(consoColle(45 * 45)).toBe(7)
    expect(consoColle(60 * 60)).toBe(7)
    expect(consoColle(60 * 120)).toBe(8)
  })
  it('pas de conseil de double encollage pour un petit carreau', () => {
    const r = calculerCarrelage({ ...base, carreau: { a: 20, b: 20 } }, PERTES_DEFAUT)
    expect(r.notes).toEqual([])
  })
  it('la perte par défaut dépend de la pose', () => {
    const b = { ...ficheCarrelage.defauts(), longueur: 4, largeur: 5, perte: null }
    expect(info(calculerCarrelage({ ...b, pose: 'droite' }, PERTES_DEFAUT), 'surfaceMarge')).toBeCloseTo(22, 5)
    expect(info(calculerCarrelage({ ...b, pose: 'diagonale' }, PERTES_DEFAUT), 'surfaceMarge')).toBeCloseTo(23, 5)
  })
})

describe('Peinture', () => {
  it('litres : 23,5 m², 2 couches, rendement 5, perte 0 %', () => {
    expect(litresPeinture(23.5, 2, 0, 5)).toBeCloseTo(9.4, 6)
  })
  it('pièce 4 x 3 x 2,5, 1 porte + 1 fenêtre, perte 10 %', () => {
    const r = calculerPeinture(
      {
        ...fichePeinture.defauts(), longueur: 4, largeur: 3, hauteur: 2.5,
        ouvertures: { ...OUVERTURES_DEFAUT, portes: 1, fenetres: 1 },
        plafond: true, couches: 2, rendement: 10, sousCouche: true, perte: 10,
      },
      PERTES_DEFAUT,
    )
    expect(q(r, 'peinture-murs')).toBeCloseTo(7.02, 2)
    expect(q(r, 'peinture-plafond')).toBeCloseTo(2.64, 2)
    expect(q(r, 'sous-couche')).toBeCloseTo(5.37, 2) // rendement sous-couche 9 m²/L
  })
  it('combinaison de pots la moins chère', () => {
    const pots = [
      { materiauId: 'a', litres: 1, prix: 10 },
      { materiauId: 'b', litres: 5, prix: 30 },
      { materiauId: 'c', litres: 10, prix: 100 },
    ]
    expect(meilleureCombinaison(9.4, pots)).toEqual([{ materiauId: 'b', nombre: 2 }])
    expect(meilleureCombinaison(6, pots)).toEqual([{ materiauId: 'b', nombre: 1 }, { materiauId: 'a', nombre: 1 }])
  })
})

describe('Papier peint', () => {
  const base = { longueur: 4, largeur: 3, hauteur: 2.5, portes: 1, rouleauLongueur: 10.05, rouleauLargeur: 0.53, raccord: 0, rouleauxParColle: 5 }
  it('pièce 4 x 3, H 2,5, 1 porte', () => {
    const r = calculerPapierPeint(base)
    expect(info(r, 'les')).toBe(25)
    expect(info(r, 'lesParRouleau')).toBe(3)
    expect(info(r, 'rouleaux')).toBe(9)
    expect(arrondiSup(q(r, 'colle-papier-peint'))).toBe(2)
  })
  it('rouleaux par paquet de colle réglable', () => {
    expect(arrondiSup(q(calculerPapierPeint({ ...base, rouleauxParColle: 3 }), 'colle-papier-peint'))).toBe(3)
    expect(fichePapierPeint.defauts().rouleauxParColle).toBe(5)
  })
})

describe('Dalle béton', () => {
  const base = { ...ficheDalle.defauts(), longueur: 4, largeur: 3, epaisseur: 12, mode: 'malaxer', perte: 5 }
  it('4 x 3, 12 cm, perte 5 %, à malaxer, 350 kg/m³', () => {
    const r = calculerDalle({ ...base, herisson: true }, PERTES_DEFAUT)
    expect(info(r, 'volume')).toBeCloseTo(1.512, 4)
    expect(info(r, 'cimentKg')).toBeCloseTo(529.2, 1)
    expect(arrondiSup(q(r, 'ciment'))).toBe(16)
    expect(q(r, 'sable')).toBeCloseTo(0.605, 3)
    expect(q(r, 'gravillons')).toBeCloseTo(1.21, 2)
    expect(q(r, 'treillis-st25c')).toBeCloseTo(1.02, 2)
    expect(arrondiSup(q(r, 'treillis-st25c'))).toBe(2)
    expect(q(r, 'herisson')).toBeCloseTo(1.584, 3)
    // volumes arrondis au 0,5 m³ supérieur dans le devis
    expect(qteDevis(r, 'sable')).toBe(1.0)
    expect(qteDevis(r, 'gravillons')).toBe(1.5)
    expect(qteDevis(r, 'herisson')).toBe(2.0)
  })
  it('béton prêt à l’emploi : 1,512 → 2,0 m³', () => {
    const r = calculerDalle({ ...base, mode: 'pret' }, PERTES_DEFAUT)
    expect(q(r, 'beton-pret')).toBeCloseTo(1.512, 3)
    expect(qteDevis(r, 'beton-pret')).toBe(2.0)
  })
  it('dosage 300 kg/m³', () => {
    expect(info(calculerDalle({ ...base, dosage: '300' }, PERTES_DEFAUT), 'cimentKg')).toBeCloseTo(453.6, 1)
  })
  it('alerte si épaisseur < 12 cm (DTU 13.3)', () => {
    expect(calculerDalle({ ...base, epaisseur: 10 }, PERTES_DEFAUT).avertissements).toEqual([
      'DTU 13.3 : 12 cm minimum en maison individuelle',
    ])
    expect(calculerDalle(base, PERTES_DEFAUT).avertissements).toEqual([])
  })
  it('le hérisson a une épaisseur réglable', () => {
    const r = calculerDalle({ ...base, herisson: true, herissonEpaisseur: 20 }, PERTES_DEFAUT)
    expect(q(r, 'herisson')).toBeCloseTo(12 * 0.2 * 1.1, 4)
  })
})

describe('Mur en parpaings', () => {
  const base = {
    ...ficheParpaings.defauts(), longueur: 5, hauteur: 2.5, ouvertures: { ...OUVERTURES_DEFAUT, portes: 1 },
    epaisseurBloc: '20', perte: 5,
  }
  it('5 x 2,5, 1 porte 1,7, bloc 20 cm, perte 5 %', () => {
    const r = calculerParpaings(base, PERTES_DEFAUT)
    expect(info(r, 'surface')).toBeCloseTo(10.8, 5)
    expect(arrondiSup(q(r, 'parpaing-20'))).toBe(114)
    expect(info(r, 'mortierKg')).toBeCloseTo(378, 3)
    expect(arrondiSup(q(r, 'mortier'))).toBe(16)
  })
  it('joints verticaux garnis : 594 kg (24 sacs)', () => {
    const r = calculerParpaings({ ...base, jointsVerticaux: true }, PERTES_DEFAUT)
    expect(info(r, 'mortierKg')).toBeCloseTo(594, 3)
    expect(arrondiSup(q(r, 'mortier'))).toBe(24)
  })
  it('bloc de 10 cm : 189 kg (8 sacs)', () => {
    const r = calculerParpaings({ ...base, epaisseurBloc: '10' }, PERTES_DEFAUT)
    expect(info(r, 'mortierKg')).toBeCloseTo(189, 3)
    expect(arrondiSup(q(r, 'mortier'))).toBe(8)
  })
})

describe('Devis global', () => {
  const res = (id: string, quantite: number): Resultat => ({ lignes: [{ materiauId: id, quantite }], infos: [], avertissements: [] })

  it('additionne les quantités AVANT d’arrondir (0,6 + 0,7 sac = 2 sacs, pas 1 + 1)', () => {
    const d = construireDevis([res('enduit-poudre', 0.6), res('enduit-poudre', 0.7)], {})
    const ligne = d.familles[0].lignes[0]
    expect(ligne.quantite).toBe(2)
    expect(d.total).toBeCloseTo(2 * MATERIAUX_PAR_ID['enduit-poudre'].prix, 2)
  })

  it('volumes : on additionne puis on arrondit au 0,5 m³ supérieur, et le prix suit le volume arrondi', () => {
    // 0,3 + 0,4 = 0,7 m³ de sable → 1,0 m³ (et non 0,5 + 0,5 ni 1 + 1)
    const d = construireDevis([res('sable', 0.3), res('sable', 0.4)], {})
    expect(d.familles[0].lignes[0].quantite).toBe(1.0)
    expect(d.total).toBeCloseTo(MATERIAUX_PAR_ID['sable'].prix, 2)
    // 0,2 + 0,2 = 0,4 → 0,5 m³
    const d2 = construireDevis([res('sable', 0.2), res('sable', 0.2)], {})
    expect(d2.familles[0].lignes[0].quantite).toBe(0.5)
    expect(d2.total).toBeCloseTo(MATERIAUX_PAR_ID['sable'].prix * 0.5, 2)
  })

  it('regroupe par famille et additionne les litres de peinture avant de choisir les pots', () => {
    const d = construireDevis([res('peinture-murs', 4), res('peinture-murs', 4.5), res('papier-peint', 3)], {})
    expect(d.familles.map((f) => f.famille)).toEqual(['peinture', 'papier-peint'])
    const litres = d.familles[0].lignes.reduce((s, l) => {
      const g = GROUPES_PAR_ID['peinture-murs'].pots.find((p) => p.materiauId === l.cle.split(':')[1])
      return s + (g?.litres ?? 0) * l.quantite
    }, 0)
    expect(litres).toBeGreaterThanOrEqual(8.5)
  })
})

describe('Prix : règle « un prix modifié par vous n’est jamais écrasé »', () => {
  const moi: PrixModifie = { valeur: 99, modifieLe: '2026-01-01', source: 'utilisateur' }
  const auto: PrixModifie = { valeur: 5, modifieLe: '2026-01-01', source: 'auto' }

  it('nouvelle version des prix par défaut : seuls les prix non modifiés sont remplacés', () => {
    const stockes = { ciment: moi, sable: auto }
    expect(migrerPrix(stockes, 1, 2)).toEqual({ ciment: moi })
  })
  it('même version : rien ne change', () => {
    const stockes = { ciment: moi, sable: auto }
    expect(migrerPrix(stockes, 2, 2)).toEqual(stockes)
  })
  it('la mise à jour en ligne ne touche pas aux prix de l’utilisateur', () => {
    const donnees: PrixEnLigne = {
      version: 2,
      misAJour: '2026-12-01T00:00:00Z',
      prix: {
        ciment: { prix: 10, date: '2026-12-01', statut: 'releve' },
        sable: { prix: 80, date: '2026-12-01', statut: 'releve' },
      },
    }
    const { prix, changes } = fusionnerPrixEnLigne({ ciment: moi }, donnees, { ciment: 9, sable: 70 })
    expect(prix.ciment).toEqual(moi)
    expect(prix.sable).toMatchObject({ valeur: 80, source: 'auto' })
    expect(changes).toBe(1)
  })
  it('un prix en ligne identique au prix par défaut supprime l’ancien prix « auto »', () => {
    const donnees: PrixEnLigne = { version: 2, misAJour: 'x', prix: { sable: { prix: 70, date: 'x', statut: 'releve' } } }
    const { prix } = fusionnerPrixEnLigne({ sable: auto }, donnees, { sable: 70 })
    expect(prix.sable).toBeUndefined()
  })
})

describe('Cohérence des données', () => {
  it('tous les matériaux cités par les fiches existent', () => {
    for (const f of FICHES) {
      for (const id of f.materiaux) {
        expect(MATERIAUX_PAR_ID[id] || GROUPES_PAR_ID[id], `${f.id} → ${id}`).toBeTruthy()
      }
    }
  })
  it('les lignes calculées utilisent des matériaux connus', () => {
    const r = calculerPlafond({ ...fichePlafond.defauts(), longueur: 3, largeur: 3, isolant: true }, PERTES_DEFAUT)
    for (const l of r.lignes) expect(MATERIAUX_PAR_ID[l.materiauId], l.materiauId).toBeTruthy()
  })
  it('chaque matériau a un prix dans prix-sources.json, avec source ou statut « estimé »', () => {
    for (const m of MATERIAUX) {
      const p = (prixSources.materiaux as Record<string, { prix: number; statut: string; sources: { url: string; date: string }[] }>)[m.id]
      expect(p, `prix manquant : ${m.id}`).toBeTruthy()
      expect(p.prix).toBeGreaterThan(0)
      if (p.statut === 'releve') {
        expect(p.sources.length, m.id).toBeGreaterThan(0)
        for (const s of p.sources) {
          expect(s.url).toMatch(/^https:\/\//)
          expect(s.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        }
      } else {
        expect(p.statut).toBe('estime')
      }
      expect(PRIX_DEFAUT[m.id]).toBe(p.prix)
    }
  })
  it('chaque fiche a une source documentée', () => {
    expect(SOURCES_FORMULES.length).toBeGreaterThan(20)
    for (const s of SOURCES_FORMULES) expect(['verifie', 'a_confirmer']).toContain(s.statut)
  })
})

describe('Saisie des nombres', () => {
  it('accepte la virgule et le point', () => {
    expect(parseNombre('2,5')).toBe(2.5)
    expect(parseNombre('2.5')).toBe(2.5)
    expect(parseNombre('')).toBeNull()
    expect(parseNombre('abc')).toBeNull()
  })
})
