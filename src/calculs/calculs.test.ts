import { describe, it, expect } from 'vitest'
import { PERTES_DEFAUT, OUVERTURES_DEFAUT, arrondiSup, parseNombre, type Resultat } from './commun'
import { calculerPlafond } from './plafond'
import { calculerCarrelage } from './carrelage'
import { calculerPeinture, litresPeinture } from './peinture'
import { calculerPapierPeint } from './papierPeint'
import { calculerCloison } from './cloison'
import { calculerDalle } from './dalle'
import { calculerParpaings } from './parpaings'
import { construireDevis, meilleureCombinaison } from './devis'
import { fichePlafond } from './plafond'
import { ficheCloison } from './cloison'
import { ficheCarrelage } from './carrelage'
import { fichePeinture } from './peinture'
import { ficheDalle } from './dalle'
import { ficheParpaings } from './parpaings'
import { FICHES } from './index'
import { MATERIAUX_PAR_ID, GROUPES_PAR_ID } from '../data/materiaux'

const q = (r: Resultat, id: string) => r.lignes.find((l) => l.materiauId === id)?.quantite ?? 0
const info = (r: Resultat, cle: string) => r.infos.find((i) => i.cle === cle)?.valeur ?? 0

describe('Plafond placo', () => {
  it('5 x 5, plaque 250x120, perte 5 %', () => {
    const r = calculerPlafond({ ...fichePlafond.defauts(), longueur: 5, largeur: 5, perte: 5 }, PERTES_DEFAUT)
    expect(q(r, 'plaque-standard-250')).toBeCloseTo(8.75, 2)
    expect(arrondiSup(q(r, 'plaque-standard-250'))).toBe(9)
    expect(q(r, 'fourrure-f530')).toBeCloseTo(15.9, 1)
    expect(arrondiSup(q(r, 'fourrure-f530'))).toBe(16)
    expect(q(r, 'suspente')).toBeCloseTo(45.9, 1)
    expect(arrondiSup(q(r, 'suspente'))).toBe(46)
    expect(arrondiSup(q(r, 'vis-25'))).toBe(1)
    expect(arrondiSup(q(r, 'bande-joint'))).toBe(1)
    expect(arrondiSup(q(r, 'enduit-poudre'))).toBe(1)
  })
})

describe('Carrelage', () => {
  it('5 x 5, carreau 30x30, pose droite, perte 5 %, carton 5 m²', () => {
    const r = calculerCarrelage(
      { ...ficheCarrelage.defauts(), longueur: 5, largeur: 5, carreau: { a: 30, b: 30 }, surfaceCarton: 5, perte: 5 },
      PERTES_DEFAUT,
    )
    expect(info(r, 'surfaceMarge')).toBeCloseTo(26.25, 2)
    expect(info(r, 'carreaux')).toBeCloseTo(291.67, 2)
    expect(info(r, 'surfaceMarge') * 4).toBeCloseTo(105, 5) // 105 kg de colle
    expect(q(r, 'colle-carrelage')).toBeCloseTo(4.2, 5)
    expect(arrondiSup(q(r, 'colle-carrelage'))).toBe(5)
    expect(arrondiSup(q(r, 'carrelage-m2'))).toBe(6)
  })
  it('la perte par défaut dépend de la pose', () => {
    const base = { ...ficheCarrelage.defauts(), longueur: 4, largeur: 5 }
    expect(info(calculerCarrelage({ ...base, pose: 'droite' }, PERTES_DEFAUT), 'surfaceMarge')).toBeCloseTo(22, 5)
    expect(info(calculerCarrelage({ ...base, pose: 'diagonale' }, PERTES_DEFAUT), 'surfaceMarge')).toBeCloseTo(23, 5)
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
    expect(q(r, 'sous-couche')).toBeCloseTo(4.83, 2)
  })
  it('combinaison de pots la moins chère', () => {
    const pots = [
      { materiauId: 'a', litres: 1, prix: 10 },
      { materiauId: 'b', litres: 5, prix: 30 },
      { materiauId: 'c', litres: 10, prix: 100 },
    ]
    // 9,4 L : 2 pots de 5 L (60 €) valent mieux qu'un pot de 10 L (100 €)
    expect(meilleureCombinaison(9.4, pots)).toEqual([{ materiauId: 'b', nombre: 2 }])
    // 6 L : 5 L + 1 L = 40 €
    expect(meilleureCombinaison(6, pots)).toEqual([{ materiauId: 'b', nombre: 1 }, { materiauId: 'a', nombre: 1 }])
  })
})

describe('Papier peint', () => {
  it('pièce 4 x 3, H 2,5, 1 porte', () => {
    const r = calculerPapierPeint({
      longueur: 4, largeur: 3, hauteur: 2.5, portes: 1, rouleauLongueur: 10.05, rouleauLargeur: 0.53, raccord: 0,
    })
    expect(info(r, 'les')).toBe(25)
    expect(info(r, 'lesParRouleau')).toBe(3)
    expect(info(r, 'rouleaux')).toBe(9)
    expect(arrondiSup(q(r, 'colle-papier-peint'))).toBe(2)
  })
})

describe('Cloison placo', () => {
  it('4 x 2,5, 1 porte, 2 faces, 1 peau, perte 10 %', () => {
    const r = calculerCloison(
      { ...ficheCloison.defauts(), longueur: 4, hauteur: 2.5, ouvertures: { ...OUVERTURES_DEFAUT, portes: 1 }, faces: '2', peaux: '1', perte: 10 },
      PERTES_DEFAUT,
    )
    expect(info(r, 'surface')).toBeCloseTo(8.3, 5)
    expect(q(r, 'plaque-standard-250')).toBeCloseTo(6.09, 2)
    expect(arrondiSup(q(r, 'plaque-standard-250'))).toBe(7)
    expect(arrondiSup(q(r, 'montant-m48'))).toBe(10)
    expect(arrondiSup(q(r, 'rail-r48'))).toBe(3)
  })
})

describe('Dalle béton', () => {
  it('4 x 3, 12 cm, perte 5 %, à malaxer', () => {
    const r = calculerDalle({ ...ficheDalle.defauts(), longueur: 4, largeur: 3, epaisseur: 12, mode: 'malaxer', perte: 5 }, PERTES_DEFAUT)
    expect(info(r, 'volume')).toBeCloseTo(1.512, 4)
    expect(q(r, 'ciment')).toBeCloseTo(15.12, 2)
    expect(arrondiSup(q(r, 'ciment'))).toBe(16)
  })
})

describe('Mur en parpaings', () => {
  it('5 x 2,5, 1 porte 1,7, bloc 20 cm, perte 5 %', () => {
    const r = calculerParpaings(
      { ...ficheParpaings.defauts(), longueur: 5, hauteur: 2.5, ouvertures: { ...OUVERTURES_DEFAUT, portes: 1 }, epaisseurBloc: '20', perte: 5 },
      PERTES_DEFAUT,
    )
    expect(info(r, 'surface')).toBeCloseTo(10.8, 5)
    expect(arrondiSup(q(r, 'parpaing-20'))).toBe(114)
    expect(q(r, 'mortier')).toBeCloseTo(10.8, 5)
    expect(arrondiSup(q(r, 'mortier'))).toBe(11)
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

  it('regroupe par famille et additionne les litres de peinture avant de choisir les pots', () => {
    const d = construireDevis([res('peinture-murs', 4), res('peinture-murs', 4.5), res('papier-peint', 3)], {})
    expect(d.familles.map((f) => f.famille)).toEqual(['peinture', 'papier-peint'])
    const litres = d.familles[0].lignes.reduce((s, l) => {
      const g = GROUPES_PAR_ID['peinture-murs'].pots.find((p) => `${p.materiauId}` === l.cle.split(':')[1])
      return s + (g?.litres ?? 0) * l.quantite
    }, 0)
    expect(litres).toBeGreaterThanOrEqual(8.5)
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
})

describe('Saisie des nombres', () => {
  it('accepte la virgule et le point', () => {
    expect(parseNombre('2,5')).toBe(2.5)
    expect(parseNombre('2.5')).toBe(2.5)
    expect(parseNombre('')).toBeNull()
    expect(parseNombre('abc')).toBeNull()
  })
})
