// Tests des 19 fiches ajoutées (valeurs de la demande).
import { describe, it, expect } from 'vitest'
import { PERTES_DEFAUT, OUVERTURES_DEFAUT, arrondiSup, type Resultat, type Ouvertures } from './commun'
import { construireDevis } from './devis'
import { FICHES, GROUPES_FICHES } from './index'
import { MATERIAUX_PAR_ID, GROUPES_PAR_ID } from '../data/materiaux'
import { calculerDoublageColle, ficheDoublageColle, calculerDoublageOssature, ficheDoublageOssature } from './doublage'
import { calculerCarreauxPlatre, ficheCarreauxPlatre, calculerAlveolaire, ficheAlveolaire } from './cloisonsLegeres'
import { calculerCombles, ficheCombles, calculerSousChape, ficheSousChape } from './isolation'
import { calculerBriques, ficheBriques, calculerBetonCellulaire, ficheBetonCellulaire } from './murs'
import { calculerChape, ficheChape, calculerRagreage, ficheRagreage, calculerParquet, ficheParquet } from './sols'
import { calculerMelange, ficheMelange, calculerFacade, ficheFacade } from './beton'
import { calculerCarrelageMural, ficheCarrelageMural } from './carrelageMural'
import { calculerLambourdes, ficheLambourdes, calculerDallesPlots, ficheDallesPlots } from './terrasse'
import { calculerToiture, ficheToiture } from './toiture'
import { calculerElectricite, ficheElectricite } from './electricite'
import { calculerPlomberie, fichePlomberie } from './plomberie'
import { calculerCarrelage, ficheCarrelage } from './carrelage'

const P = PERTES_DEFAUT
const q = (r: Resultat, id: string) => r.lignes.find((l) => l.materiauId === id)?.quantite ?? 0
const sup = (r: Resultat, id: string) => arrondiSup(q(r, id))
const info = (r: Resultat, cle: string) => r.infos.find((i) => i.cle === cle)?.valeur ?? 0
const ouv = (o: Partial<Ouvertures>): Ouvertures => ({ ...OUVERTURES_DEFAUT, ...o })
const fenetre14 = ouv({ fenetres: 1 }) // 1 fenêtre de 1,4 m²
const porte17 = ouv({ portes: 1 }) // 1 porte de 1,7 m²
/** quantité en unités de vente, arrondie dans un devis seul (peut être un volume au 0,5 m³) */
const achat = (r: Resultat, id: string) =>
  construireDevis([r], {}).familles.flatMap((f) => f.lignes).find((l) => l.cle.startsWith(id))?.quantite ?? 0

describe('1) Doublage collé', () => {
  const r = calculerDoublageColle({ ...ficheDoublageColle.defauts(), longueur: 4, hauteur: 2.5, ouvertures: fenetre14, epaisseur: '100' })
  it('mur 4 x 2,5 m, 1 fenêtre 1,4 m²', () => {
    expect(info(r, 'surface')).toBeCloseTo(8.6, 6)
    expect(info(r, 'surfaceMarge')).toBeCloseTo(9.03, 6)
    expect(q(r, 'doublage-pse-100')).toBeCloseTo(3.01, 2)
    expect(sup(r, 'doublage-pse-100')).toBe(4)
    expect(q(r, 'mortier-adhesif') * 25).toBeCloseTo(21.5, 6)
    expect(sup(r, 'mortier-adhesif')).toBe(1)
    expect(q(r, 'bande-joint') * 150).toBeCloseTo(15.05, 6)
    expect(q(r, 'enduit-poudre') * 25).toBeCloseTo(4.3, 6)
    expect(sup(r, 'enduit-poudre')).toBe(1)
  })
  it('R indicatif = e / 0,032', () => {
    expect(info(calculerDoublageColle({ ...ficheDoublageColle.defauts(), longueur: 1, hauteur: 1, epaisseur: '80' }), 'R')).toBeCloseTo(2.5, 6)
    expect(info(r, 'R')).toBeCloseTo(3.125, 3)
  })
  it('alerte si hauteur > 4 m', () => {
    expect(r.avertissements).toHaveLength(0)
    expect(calculerDoublageColle({ ...ficheDoublageColle.defauts(), longueur: 4, hauteur: 4.5 }).avertissements).toHaveLength(1)
  })
})

describe('2) Doublage sur ossature', () => {
  const r = calculerDoublageOssature({ ...ficheDoublageOssature.defauts(), longueur: 4, hauteur: 2.5, ouvertures: fenetre14, epaisseur: '100' })
  it('même mur, laine 100 mm', () => {
    expect(sup(r, 'fourrure-f530')).toBe(8)
    expect(q(r, 'rail-r48')).toBeCloseTo(2.67, 2)
    expect(sup(r, 'rail-r48')).toBe(3)
    expect(q(r, 'appui-intermediaire')).toBe(8)
    expect(q(r, 'laine-verre-100')).toBeCloseTo(2.79, 2)
    expect(sup(r, 'laine-verre-100')).toBe(3)
    expect(q(r, 'plaque-standard-250')).toBeCloseTo(3.01, 2)
    expect(sup(r, 'plaque-standard-250')).toBe(4)
    expect(sup(r, 'vis-25')).toBe(1)
    expect(sup(r, 'bande-joint')).toBe(1)
    expect(sup(r, 'enduit-poudre')).toBe(1)
  })
  it('R de la laine 3,15 / 3,75 / 4,4', () => {
    for (const [e, R] of [['100', 3.15], ['120', 3.75], ['140', 4.4]] as const)
      expect(info(calculerDoublageOssature({ ...ficheDoublageOssature.defauts(), longueur: 1, hauteur: 1, epaisseur: e }), 'R')).toBe(R)
  })
})

describe('3) Carreaux de plâtre', () => {
  const base = { ...ficheCarreauxPlatre.defauts(), longueur: 4, hauteur: 2.5, ouvertures: porte17, epaisseur: '7' }
  const r = calculerCarreauxPlatre(base)
  it('cloison 4 x 2,5 m, 1 porte, 7 cm', () => {
    expect(info(r, 'surface')).toBeCloseTo(8.3, 6)
    expect(q(r, 'carreau-platre-7')).toBeCloseTo(26.17, 2)
    expect(sup(r, 'carreau-platre-7')).toBe(27)
    expect(q(r, 'colle-carreaux-platre') * 25).toBeCloseTo(22.41, 2)
    expect(sup(r, 'colle-carreaux-platre')).toBe(1)
    expect(q(r, 'platre-a-enduire') * 25).toBeCloseTo(7.47, 2)
    expect(q(r, 'bande-resiliente-m')).toBe(4)
    expect(q(r, 'bande-joint') * 150).toBeCloseTo(6.64, 2)
  })
  it('hydrofugé : carreaux hydrofuges', () => {
    const h = calculerCarreauxPlatre({ ...base, hydrofuge: true })
    expect(q(h, 'carreau-platre-hydro-7')).toBeCloseTo(26.17, 2)
    expect(q(h, 'carreau-platre-7')).toBe(0)
  })
})

describe('4) Cloison alvéolaire', () => {
  const r = calculerAlveolaire({ ...ficheAlveolaire.defauts(), longueur: 4, hauteur: 2.5, ouvertures: porte17 })
  it('cloison 4 x 2,5 m, 1 porte', () => {
    expect(q(r, 'panneau-alveolaire-50')).toBeCloseTo(3.5, 6)
    expect(sup(r, 'panneau-alveolaire-50')).toBe(4)
    expect(q(r, 'semelle-bois')).toBeCloseTo(2.27, 2)
    expect(sup(r, 'semelle-bois')).toBe(3)
    expect(q(r, 'rail-bois')).toBeCloseTo(2.27, 2)
    expect(q(r, 'clavette-bois')).toBe(2)
    expect(q(r, 'vis-ttpc-35-500') * 500).toBeCloseTo(66.4, 6)
    expect(q(r, 'vis-ttpc-70-200') * 200).toBeCloseTo(8.3, 6)
    expect(q(r, 'enduit-poudre') * 25).toBeCloseTo(5.48, 2)
    expect(q(r, 'bande-joint') * 150).toBeCloseTo(14.1, 1)
  })
  it('info acoustique, et alerte si H > 2,60 m', () => {
    expect(r.notes?.join(' ')).toContain('27 à 29 dB')
    expect(r.avertissements).toHaveLength(0)
    const haut = calculerAlveolaire({ ...ficheAlveolaire.defauts(), longueur: 4, hauteur: 2.7 })
    expect(haut.avertissements[0]).toContain('Placopan 72')
  })
})

describe('5) Isolation des combles', () => {
  const r = calculerCombles({ surface: 30, R: '7' })
  it('30 m², R 7', () => {
    expect(info(r, 'kg')).toBeCloseTo(177.66, 2)
    expect(q(r, 'laine-roche-souffler')).toBeCloseTo(8.89, 1)
    expect(sup(r, 'laine-roche-souffler')).toBe(9)
    expect(info(r, 'epaisseur')).toBe(315)
  })
  it('alerte si R < 7', () => {
    expect(r.avertissements).toHaveLength(0)
    expect(calculerCombles({ surface: 30, R: '6' }).avertissements).toHaveLength(1)
  })
})

describe('6) Isolation sous chape', () => {
  const base = { ...ficheSousChape.defauts(), longueur: 4, largeur: 5, R: 3 }
  it('PSE R 3 : 120 mm, 21 m², bande 18 m, polyane 24 m²', () => {
    const r = calculerSousChape({ ...base, isolant: 'pse' })
    expect(info(r, 'epaisseur')).toBe(120)
    expect(info(r, 'panneaux')).toBeCloseTo(21, 6)
    expect(info(r, 'bande')).toBe(18)
    expect(info(r, 'polyane')).toBeCloseTo(24, 6)
    // prix au m² = prix par mm x épaisseur
    const l = r.lignes.find((x) => x.materiauId === 'isolant-pse-mm')!
    expect(l.quantite).toBeCloseTo(21, 6)
    expect(l.facteur).toBe(120)
  })
  it('polyuréthane : 80 mm', () => {
    expect(info(calculerSousChape({ ...base, isolant: 'pu' }), 'epaisseur')).toBe(80)
  })
})

describe('7) Mur en briques', () => {
  const base = { ...ficheBriques.defauts(), longueur: 5, hauteur: 2.5, ouvertures: porte17, epaisseur: '20' }
  it('mur 5 x 2,5 m, 1 porte, 20 cm', () => {
    const r = calculerBriques(base)
    expect(info(r, 'surface')).toBeCloseTo(10.8, 6)
    expect(info(r, 'surfaceMarge')).toBeCloseTo(11.34, 6)
    expect(q(r, 'brique-20')).toBeCloseTo(90.72, 2)
    expect(sup(r, 'brique-20')).toBe(91)
    expect(q(r, 'mortier-joint-mince') * 25).toBeCloseTo(20.41, 1)
    expect(sup(r, 'mortier-joint-mince')).toBe(1)
    expect(q(r, 'linteau')).toBe(1)
    expect(r.notes?.join(' ')).toContain('20 cm non isolante')
  })
  it('joints verticaux garnis : 37,4 kg (2 sacs)', () => {
    const r = calculerBriques({ ...base, jointsVerticaux: true })
    expect(q(r, 'mortier-joint-mince') * 25).toBeCloseTo(37.42, 1)
    expect(sup(r, 'mortier-joint-mince')).toBe(2)
  })
  it('épaisseurs 30 et 36,5 cm', () => {
    expect(q(calculerBriques({ ...base, epaisseur: '30' }), 'brique-30')).toBeCloseTo(11.34 * 10.7, 4)
    expect(q(calculerBriques({ ...base, epaisseur: '36.5' }), 'brique-36_5')).toBeCloseTo(11.34 * 16, 4)
  })
})

describe('8) Mur en béton cellulaire', () => {
  const r = calculerBetonCellulaire({ ...ficheBetonCellulaire.defauts(), longueur: 5, hauteur: 2.5, ouvertures: porte17, epaisseur: '20' })
  it('même mur, 20 cm', () => {
    expect(q(r, 'beton-cell-20')).toBeCloseTo(72.58, 2)
    expect(sup(r, 'beton-cell-20')).toBe(73)
    expect(info(r, 'colleKg')).toBeCloseTo(45.36, 2)
    expect(sup(r, 'colle-beton-cellulaire')).toBe(2)
    expect(info(r, 'departKg')).toBeCloseTo(28.5, 6)
    expect(sup(r, 'mortier')).toBe(2)
    expect(q(r, 'linteau')).toBe(1)
  })
  it('épaisseur 17,5 cm : bloc et colle correspondants', () => {
    const r2 = calculerBetonCellulaire({ ...ficheBetonCellulaire.defauts(), longueur: 5, hauteur: 2.5, epaisseur: '17.5' })
    expect(q(r2, 'beton-cell-17_5')).toBeGreaterThan(0)
    expect(MATERIAUX_PAR_ID['beton-cell-17_5']).toBeTruthy()
  })
})

describe('9) Chape traditionnelle', () => {
  const base = { ...ficheChape.defauts(), longueur: 5, largeur: 3.5, type: 'adherente', epaisseur: 5 }
  const r = calculerChape(base)
  it('5 x 3,5 m, adhérente 5 cm', () => {
    expect(info(r, 'volume')).toBeCloseTo(0.9625, 6)
    expect(info(r, 'cimentKg')).toBeCloseTo(336.875, 3)
    expect(sup(r, 'ciment')).toBe(10)
    expect(q(r, 'sable')).toBeCloseTo(0.77, 6)
    expect(achat(r, 'sable')).toBe(1.0)
    expect(q(r, 'film-polyane')).toBe(0)
  })
  it('désolidarisée ou flottante : polyane et bande périphérique', () => {
    const f = calculerChape({ ...base, type: 'flottante', epaisseur: 6 })
    expect(q(f, 'film-polyane') * 100).toBeCloseTo(21, 6)
    expect(q(f, 'bande-peripherique') * 25).toBeCloseTo(17, 6)
  })
  it('alertes sous le minimum', () => {
    expect(calculerChape({ ...base, epaisseur: 2.5 }).avertissements).toHaveLength(1)
    expect(calculerChape({ ...base, type: 'desolidarisee', epaisseur: 3.5 }).avertissements).toHaveLength(1)
    expect(calculerChape({ ...base, type: 'desolidarisee', epaisseur: 4 }).avertissements).toHaveLength(0)
    expect(calculerChape({ ...base, type: 'flottante', epaisseur: 4.5 }).avertissements).toHaveLength(1)
    expect(r.notes?.join(' ')).toContain('1 semaine par cm')
  })
})

describe('10) Ragréage', () => {
  const r = calculerRagreage({ ...ficheRagreage.defauts(), longueur: 5, largeur: 4, epaisseur: 3 })
  it('20 m², 3 mm', () => {
    expect(info(r, 'kg')).toBeCloseTo(94.5, 6)
    expect(q(r, 'ragreage')).toBeCloseTo(3.78, 2)
    expect(sup(r, 'ragreage')).toBe(4)
    expect(q(r, 'primaire-litre')).toBeCloseTo(3, 6)
    expect(q(r, 'bande-peripherique') * 25).toBeCloseTo(18, 6)
  })
  it('alertes e < 3 mm et e > 10 mm', () => {
    expect(r.avertissements).toHaveLength(0)
    expect(calculerRagreage({ ...ficheRagreage.defauts(), longueur: 5, largeur: 4, epaisseur: 2 }).avertissements).toHaveLength(1)
    expect(calculerRagreage({ ...ficheRagreage.defauts(), longueur: 5, largeur: 4, epaisseur: 12 }).avertissements).toHaveLength(1)
  })
})

describe('11) Enduit de façade monocouche', () => {
  const r = calculerFacade({ ...ficheFacade.defauts(), longueur: 10, hauteur: 5, ouvertures: ouv({ persoNb: 1, persoSurface: 3 }), epaisseur: 15, angles: 2 })
  it('façade 10 x 5 m, 3 m² d’ouvertures, 15 mm', () => {
    expect(info(r, 'surface')).toBe(47)
    expect(info(r, 'kg')).toBeCloseTo(1163.25, 2)
    expect(q(r, 'enduit-monocouche')).toBeCloseTo(46.53, 2)
    expect(sup(r, 'enduit-monocouche')).toBe(47)
    expect(q(r, 'profile-depart')).toBe(10)
    expect(q(r, 'baguette-angle')).toBe(10)
  })
  it('alerte si e < 10 mm, rappel d’urbanisme', () => {
    expect(calculerFacade({ ...ficheFacade.defauts(), longueur: 10, hauteur: 5, epaisseur: 8 }).avertissements).toHaveLength(1)
    expect(r.notes?.join(' ')).toContain('PLU')
  })
})

describe('12) Mortier / béton à la volée', () => {
  it('0,5 m³ de béton : ciment 175 kg (5 sacs), sable 0,2 (0,5), gravillons 0,4 (0,5)', () => {
    const r = calculerMelange({ melange: 'beton', volume: 0.5, surface: null, epaisseur: null })
    expect(q(r, 'ciment') * 35).toBeCloseTo(175, 6)
    expect(sup(r, 'ciment')).toBe(5)
    expect(q(r, 'sable')).toBeCloseTo(0.2, 6)
    expect(achat(r, 'sable')).toBe(0.5)
    expect(q(r, 'gravillons')).toBeCloseTo(0.4, 6)
    expect(achat(r, 'gravillons')).toBe(0.5)
  })
  it('mortier de montage et de scellement, volume = surface x épaisseur', () => {
    const m = calculerMelange({ melange: 'montage', volume: 1, surface: null, epaisseur: null })
    expect(q(m, 'sable')).toBeCloseTo(0.625, 6)
    expect(q(m, 'gravillons')).toBe(0)
    const s = calculerMelange({ melange: 'scellement', volume: null, surface: 10, epaisseur: 10 })
    expect(info(s, 'volume')).toBeCloseTo(1, 6)
    expect(q(s, 'ciment') * 35).toBeCloseTo(425, 6)
    expect(q(s, 'sable')).toBeCloseTo(0.59, 6)
  })
})

describe('13) Parquet / stratifié / vinyle clipsable', () => {
  const base = { ...ficheParquet.defauts(), longueur: 4, largeur: 3, ouvertures: porte17, sens: 'droit', surfacePaquet: 2.5 }
  const r = calculerParquet(base)
  it('4 x 3 m, 1 porte, droit, paquet 2,5 m²', () => {
    expect(info(r, 'surfaceMarge')).toBeCloseTo(13.2, 6)
    expect(q(r, 'stratifie-m2')).toBeCloseTo(5.28, 2)
    expect(sup(r, 'stratifie-m2')).toBe(6)
    expect(q(r, 'sous-couche-parquet') * 10.2).toBeCloseTo(12.6, 6)
    expect(sup(r, 'sous-couche-parquet')).toBe(2)
    expect(q(r, 'plinthe-mdf')).toBeCloseTo(5.73, 2)
    expect(sup(r, 'plinthe-mdf')).toBe(6)
    expect(q(r, 'barre-seuil')).toBe(1)
    expect(q(r, 'film-polyane')).toBe(0)
  })
  it('diagonal : perte 15 % ; sous-couche intégrée ; polyane si pas de pare-vapeur', () => {
    expect(info(calculerParquet({ ...base, sens: 'diagonal' }), 'surfaceMarge')).toBeCloseTo(13.8, 6)
    expect(q(calculerParquet({ ...base, sousCoucheIntegree: true }), 'sous-couche-parquet')).toBe(0)
    expect(q(calculerParquet({ ...base, sansPareVapeur: true }), 'film-polyane') * 100).toBeCloseTo(14.4, 6)
  })
  it('rappels : joint de dilatation et sol irrégulier', () => {
    expect(r.notes?.join(' ')).toContain('8 mm')
    expect(r.notes?.join(' ')).toContain('4 mm')
  })
})

describe('14) Carrelage mural', () => {
  const base = {
    ...ficheCarrelageMural.defauts(), longueur: 3, hauteur: 2, carreau: { a: 30, b: 60 }, surfaceCarton: 1.08,
    joint: 2, epaisseur: 9, zoneEau: true, surfaceEau: 3, longueurEau: 2, anglesEau: 2,
  }
  const r = calculerCarrelageMural(base)
  it('3 m x 2 m, carreau 30 x 60, joint 2 mm, 9 mm', () => {
    expect(info(r, 'surface')).toBe(6)
    expect(info(r, 'surfaceMarge')).toBeCloseTo(6.6, 6)
    expect(info(r, 'colleKg')).toBeCloseTo(46.2, 6)
    expect(sup(r, 'colle-carrelage')).toBe(2)
    expect(q(r, 'primaire-litre')).toBeCloseTo(0.9, 6)
  })
  it('joint : mêmes fonctions que le carrelage de sol', () => {
    // NB : la demande indiquait 10,45 kg ; la formule du sol (déjà en place) donne 0,95 kg pour 6 m² de 30 x 60 avec un joint de 2 mm
    const sol = calculerCarrelage(
      { ...ficheCarrelage.defauts(), longueur: 3, largeur: 2, carreau: { a: 30, b: 60 }, surfaceCarton: 1.08, joint: 2, epaisseur: 9, perte: 10 },
      P,
    )
    expect(info(r, 'jointKg')).toBeCloseTo(info(sol, 'jointKg'), 9)
    expect(info(r, 'jointKg')).toBeCloseTo(0.9504, 4)
    expect(info(r, 'colleKg')).toBeCloseTo(info(sol, 'colleKg'), 9)
  })
  it('SPEC : 3 m² d’eau = 5,28 kg (2 seaux) ; bande = longueur + hauteur x angles', () => {
    expect(info(r, 'specKg')).toBeCloseTo(5.28, 6)
    expect(sup(r, 'spec')).toBe(2)
    expect(q(r, 'bande-etancheite')).toBe(2 + 2 * 2)
    expect(r.notes?.join(' ')).toContain('1,80 m')
    expect(r.notes?.join(' ')).toContain('10 cm')
  })
  it('sans zone d’eau : ni SPEC ni bande', () => {
    const s = calculerCarrelageMural({ ...base, zoneEau: false })
    expect(q(s, 'spec')).toBe(0)
    expect(q(s, 'bande-etancheite')).toBe(0)
  })
})

describe('15) Terrasse sur lambourdes', () => {
  const base = { ...ficheLambourdes.defauts(), longueur: 5, largeur: 4, type: 'pin' }
  const r = calculerLambourdes(base)
  it('5 x 4 m, pin 21 mm', () => {
    expect(info(r, 'lambourdes')).toBe(11)
    expect(q(r, 'lambourde-45x70') * 3).toBeCloseTo(57.75, 6)
    expect(q(r, 'lambourde-45x70')).toBeCloseTo(19.25, 6)
    expect(sup(r, 'lambourde-45x70')).toBe(20)
    expect(q(r, 'plot-reglable')).toBe(121)
    expect(q(r, 'lame-pin-21')).toBeCloseTo(48.25, 2)
    expect(sup(r, 'lame-pin-21')).toBe(49)
    expect(info(r, 'vis')).toBeCloseTo(723.7, 1)
    expect(q(r, 'vis-terrasse-450')).toBeCloseTo(1.6, 1)
    expect(sup(r, 'vis-terrasse-450')).toBe(2)
  })
  it('entraxes selon le type de lame', () => {
    // bois 27 mm : entraxe 0,50 m → 9 lambourdes ; plots tous les 0,70 m → 9 par file
    const b = calculerLambourdes({ ...base, type: 'bois' })
    expect(info(b, 'lambourdes')).toBe(9)
    expect(q(b, 'plot-reglable')).toBe(9 * 9)
    expect(info(calculerLambourdes({ ...base, type: 'composite' }), 'lambourdes')).toBe(11)
  })
  it('alerte sous 10 cm, rappels plain-pied et sol naturel', () => {
    expect(r.avertissements).toHaveLength(0)
    expect(calculerLambourdes({ ...base, hauteurSol: 6 }).avertissements).toHaveLength(1)
    expect(r.notes?.join(' ')).toContain('60 cm')
    expect(r.notes?.join(' ')).toContain('géotextile')
  })
  it('la lame est proportionnelle à sa longueur dans le prix', () => {
    const l = r.lignes.find((x) => x.materiauId === 'lame-pin-21')!
    expect(l.facteur).toBeCloseTo(3 / 2.4, 9)
  })
})

describe('16) Terrasse en dalles sur plots', () => {
  const r = calculerDallesPlots({ ...ficheDallesPlots.defauts(), longueur: 5, largeur: 4, dalle: { a: 60, b: 60 } })
  it('5 x 4 m, 60 x 60', () => {
    expect(q(r, 'dalle-gres-60x60')).toBeCloseTo(61.11, 2)
    expect(sup(r, 'dalle-gres-60x60')).toBe(62)
    expect(q(r, 'plot-reglable')).toBe(80)
  })
})

describe('17) Toiture en tuiles et gouttières', () => {
  const base = {
    ...ficheToiture.defauts(), pans: 2, rampant: 6, largeur: 10, pente: 40, tuile: 'mecanique', faitage: 10, egout: 20,
    gouttiere: true, gouttiereLongueur: 20, descentes: 2, hauteurDescente: 3,
  }
  const r = calculerToiture(base)
  it('2 pans de 6 x 10 m, pente 40 %, mécanique', () => {
    expect(info(r, 'surface')).toBe(120)
    expect(q(r, 'tuile-mecanique')).toBeCloseTo(1512, 6)
    expect(q(r, 'liteau-27x40') * 4).toBeCloseTo(324, 6)
    expect(q(r, 'liteau-27x40')).toBeCloseTo(81, 6)
    expect(q(r, 'contre-liteau') * 4).toBeCloseTo(200, 6)
    expect(q(r, 'contre-liteau')).toBeCloseTo(50, 6)
    expect(info(r, 'ecranM2')).toBeCloseTo(128.57, 2)
    expect(q(r, 'ecran-hpv')).toBeCloseTo(1.714, 3)
    expect(sup(r, 'ecran-hpv')).toBe(2)
    expect(q(r, 'faitiere')).toBe(30)
    expect(q(r, 'closoir-ventile')).toBe(6)
  })
  it('gouttières et descentes', () => {
    expect(q(r, 'gouttiere-profile')).toBe(5)
    expect(q(r, 'crochet-gouttiere')).toBe(51)
    expect(q(r, 'jonction-gouttiere')).toBe(4)
    expect(q(r, 'naissance-gouttiere')).toBe(2)
    expect(q(r, 'fond-gouttiere')).toBe(2)
    expect(q(r, 'tube-descente-80')).toBe(3)
    expect(q(r, 'collier-descente')).toBe(6)
    expect(q(r, 'coude-80')).toBe(4)
    expect(r.notes?.join(' ')).toContain('25 cm et descente Ø 80')
  })
  it('sans gouttière : aucune ligne de gouttière', () => {
    const s = calculerToiture({ ...base, gouttiere: false })
    expect(q(s, 'gouttiere-profile')).toBe(0)
    expect(q(s, 'tube-descente-80')).toBe(0)
  })
  it('type de tuile : grand moule et plate', () => {
    expect(q(calculerToiture({ ...base, tuile: 'grand-moule' }), 'tuile-grand-moule')).toBeCloseTo(120 * 1.05 * 10, 6)
    expect(q(calculerToiture({ ...base, tuile: 'plate' }), 'liteau-27x40')).toBeCloseTo((120 * 10.5) / 4, 6)
  })
  it('écran : r = 0,20 si pente ≤ 30 %', () => {
    expect(info(calculerToiture({ ...base, pente: 25 }), 'ecranM2')).toBeCloseTo((120 * 1.5) / 1.3, 4)
  })
  it('alertes de pente (19 % ; 60 % pour la tuile plate) et rappels', () => {
    expect(r.avertissements).toHaveLength(0)
    expect(calculerToiture({ ...base, pente: 15 }).avertissements).toHaveLength(1)
    expect(calculerToiture({ ...base, tuile: 'plate', pente: 40 }).avertissements).toHaveLength(1)
    const txt = (r.notes ?? []).join(' ')
    expect(txt).toContain('R421-17')
    expect(txt).toContain('GNAU')
    expect(txt).toContain('échafaudage')
  })
  it('format de gouttière selon la surface par descente', () => {
    const petit = calculerToiture({ ...base, descentes: 4 }) // 30 m² par descente
    expect(petit.notes?.join(' ')).toContain('16 cm et descente Ø 50')
    const grand = calculerToiture({ ...base, descentes: 1, gouttiereLongueur: 10 }) // 120 m² par descente
    expect(grand.notes?.join(' ')).toContain('33 cm et descente Ø 100')
  })
})

describe('18) Électricité', () => {
  const base = { ...ficheElectricite.defauts(), piece: 'sejour', surface: 24, section: '2.5' }
  const r = calculerElectricite(base)
  it('séjour 24 m², prises en 2,5 mm²', () => {
    expect(q(r, 'prise-2pt')).toBe(6)
    expect(q(r, 'prise-rj45')).toBe(2)
    expect(q(r, 'boite-dcl')).toBe(1)
    expect(q(r, 'interrupteur')).toBe(1)
    expect(q(r, 'boite-encastrement')).toBe(9)
    expect(q(r, 'cable-3g25-100') * 100).toBeCloseTo(36, 6)
    expect(q(r, 'cable-3g15-100') * 100).toBeCloseTo(8, 6)
    expect(q(r, 'gaine-icta-100') * 100).toBeCloseTo(44, 6)
    expect(q(r, 'disjoncteur')).toBe(2)
    expect(q(r, 'cable-cat6-100') * 100).toBeCloseTo(24, 6)
    expect(r.notes?.join(' ')).toContain('électricien')
  })
  it('prises par pièce', () => {
    const n = (piece: string, surface: number) => q(calculerElectricite({ ...base, piece, surface }), 'prise-2pt')
    expect(n('sejour', 10)).toBe(5)
    expect(n('sejour', 24)).toBe(6)
    expect(n('sejour', 28)).toBe(7)
    expect(n('sejour', 40)).toBe(10)
    expect(n('chambre', 12)).toBe(3)
    expect(n('cuisine', 10)).toBe(6)
    expect(n('cuisine', 4)).toBe(3)
    expect(n('sdb', 6)).toBe(1)
    expect(n('wc', 2)).toBe(0)
    expect(n('autre', 10)).toBe(1)
    expect(n('autre', 30)).toBe(3)
  })
  it('RJ45 : séjour 2, chambre 1, autre 0', () => {
    expect(q(calculerElectricite({ ...base, piece: 'chambre', surface: 12 }), 'prise-rj45')).toBe(1)
    expect(q(calculerElectricite({ ...base, piece: 'cuisine', surface: 12 }), 'prise-rj45')).toBe(0)
  })
  it('section 1,5 mm² : 8 prises par circuit et câble 3G1,5', () => {
    const s = calculerElectricite({ ...base, piece: 'sejour', surface: 40, section: '1.5' }) // 10 prises
    expect(q(s, 'disjoncteur')).toBe(2 + 1) // 2 circuits de prises + 1 éclairage
    expect(q(s, 'cable-3g25-100')).toBe(0)
    expect(q(s, 'cable-3g15-100') * 100).toBeCloseTo(10 * 6 + 8, 6)
  })
  it('cuisine : circuit dédié ; circuits spécialisés', () => {
    const c = calculerElectricite({ ...base, piece: 'cuisine', surface: 10, speciaux: 'lave-linge,four,plaque' })
    // 1 cuisine + 1 éclairage + 3 spécialisés
    expect(q(c, 'disjoncteur')).toBe(5)
    // 6 prises x 6 m + 2 circuits x 10 m en 2,5 mm² ; plaque : 15 m en 6 mm²
    expect(q(c, 'cable-3g25-100') * 100).toBeCloseTo(6 * 6 + 2 * 10, 6)
    expect(q(c, 'cable-3g6-m')).toBe(15)
  })
  it('tableau pré-équipé si la case est cochée ; distances modifiables', () => {
    expect(q(calculerElectricite({ ...base, tableau: true }), 'tableau-3-rangees')).toBe(1)
    expect(q(r, 'tableau-3-rangees')).toBe(0)
    expect(q(calculerElectricite({ ...base, metresPrise: 10 }), 'cable-3g25-100') * 100).toBeCloseTo(60, 6)
  })
})

describe('19) Plomberie', () => {
  const r = calculerPlomberie({ ...fichePlomberie.defauts(), lavabos: 1, douches: 1, wc: 1, distanceAlim: 5, distanceEvac: 3 })
  it('1 lavabo, 1 douche, 1 WC, 5 m et 3 m', () => {
    expect(q(r, 'per-12') * 25).toBeCloseTo(15, 6)
    expect(sup(r, 'per-12')).toBe(1)
    expect(q(r, 'per-16') * 25).toBeCloseTo(10, 6)
    expect(sup(r, 'per-16')).toBe(1)
    expect(q(r, 'robinet-arret')).toBe(5)
    expect(q(r, 'raccord-per')).toBe(10)
    for (const d of ['32', '40', '100']) {
      expect(q(r, `tube-pvc-${d}`) * 2).toBeCloseTo(3, 6)
      expect(sup(r, `tube-pvc-${d}`)).toBe(2)
    }
    expect(['32', '40', '100'].reduce((s, d) => s + q(r, `coude-pvc-${d}`), 0)).toBe(6)
    expect(q(r, 'siphon-bonde')).toBe(2)
    expect(q(r, 'colle-pvc')).toBe(1)
  })
  it('rappel de pente 1 à 3 cm par mètre, avec la hauteur de chute', () => {
    const t = (r.notes ?? []).join(' ')
    expect(t).toContain('1 à 3 cm par mètre')
    expect(t).toContain('3 à 9 cm')
  })
  it('colle : 1 pour 8 appareils ou moins, 2 au-delà', () => {
    const g = (n: number) => q(calculerPlomberie({ ...fichePlomberie.defauts(), lavabos: n, distanceEvac: 3 }), 'colle-pvc')
    expect(g(8)).toBe(1)
    expect(g(9)).toBe(2)
  })
  it('sans appareil : rien à acheter', () => {
    expect(calculerPlomberie(fichePlomberie.defauts()).lignes).toHaveLength(0)
  })
})

describe('Menu et cohérence des nouvelles fiches', () => {
  it('26 fiches (7 + 19), toutes rangées dans l’une des 6 familles du menu', () => {
    expect(FICHES).toHaveLength(26)
    expect(GROUPES_FICHES).toHaveLength(6)
    for (const f of FICHES) expect(GROUPES_FICHES.map((g) => g.id), f.id).toContain(f.groupe)
    for (const g of GROUPES_FICHES) expect(FICHES.some((f) => f.groupe === g.id), g.id).toBe(true)
  })
  it('les 7 fiches d’origine gardent leur place dans le menu', () => {
    const g = (id: string) => FICHES.find((f) => f.id === id)?.groupe
    expect(g('plafond-placo')).toBe('cloisons')
    expect(g('cloison-placo')).toBe('cloisons')
    expect(g('carrelage')).toBe('sols')
    expect(g('peinture')).toBe('sols')
    expect(g('papier-peint')).toBe('sols')
    expect(g('dalle-beton')).toBe('maconnerie')
    expect(g('mur-parpaings')).toBe('maconnerie')
  })
  it('chaque fiche a une icône ; ses lignes utilisent des matériaux connus et listés', () => {
    for (const f of FICHES) {
      expect(f.icone, f.id).toBeTruthy()
      const r = f.calculer({ ...f.defauts(), longueur: 5, largeur: 4, hauteur: 2.5, surface: 20, rampant: 6, volume: 1, epaisseur: f.defauts().epaisseur ?? 5 }, P)
      for (const l of r.lignes) {
        expect(MATERIAUX_PAR_ID[l.materiauId] || GROUPES_PAR_ID[l.materiauId], `${f.id} → ${l.materiauId}`).toBeTruthy()
        expect(f.materiaux, `${f.id} ne liste pas ${l.materiauId}`).toContain(l.materiauId)
      }
    }
  })
  it('chaque fiche reste utilisable avec des champs vides (aucun NaN)', () => {
    for (const f of FICHES) {
      const vide = Object.fromEntries(Object.entries(f.defauts()).map(([k, v]) => [k, typeof v === 'number' || v === null ? null : v]))
      const r = f.calculer(vide, P)
      for (const l of r.lignes) expect(Number.isFinite(l.quantite), `${f.id} ${l.materiauId}`).toBe(true)
      for (const i of r.infos) expect(Number.isFinite(i.valeur), `${f.id} ${i.cle}`).toBe(true)
    }
  })
  it('les nouvelles fiches ont 5 champs visibles au plus avant « Options »', () => {
    const anciennes = ['plafond-placo', 'cloison-placo', 'carrelage', 'peinture', 'papier-peint', 'dalle-beton', 'mur-parpaings']
    for (const f of FICHES.filter((x) => !anciennes.includes(x.id))) {
      const i = f.champs.findIndex((c) => c.type === 'titre' && c.label === 'Options')
      const visibles = (i < 0 ? f.champs : f.champs.slice(0, i)).filter((c) => c.type !== 'titre')
      expect(visibles.length, f.id).toBeLessThanOrEqual(5)
    }
  })
  it('un devis global additionne les fractions de plusieurs fiches avant d’arrondir', () => {
    // deux murs de doublage : 0,86 sac de mortier adhésif chacun → 1,72 → 2 sacs (et non 1 + 1 = 2 par mur, mais pas 3)
    const un = calculerDoublageColle({ ...ficheDoublageColle.defauts(), longueur: 4, hauteur: 2.5, ouvertures: fenetre14 })
    const d = construireDevis([un, un], {})
    const ligne = d.familles.flatMap((f) => f.lignes).find((l) => l.cle.startsWith('mortier-adhesif'))!
    expect(ligne.quantiteExacte).toBeCloseTo(1.72, 6)
    expect(ligne.quantite).toBe(2)
  })
  it('les volumes de sable et gravillons restent arrondis au 0,5 m³ dans le devis global', () => {
    const a = calculerMelange({ melange: 'beton', volume: 0.5, surface: null, epaisseur: null })
    const b = calculerMelange({ melange: 'beton', volume: 0.5, surface: null, epaisseur: null })
    const d = construireDevis([a, b], {})
    const sable = d.familles.flatMap((f) => f.lignes).find((l) => l.cle.startsWith('sable'))!
    expect(sable.quantiteExacte).toBeCloseTo(0.4, 6)
    expect(sable.quantite).toBe(0.5)
  })
})
