// Génère les icônes PNG de l'appli (sans dépendance externe).
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

const ORANGE = [194, 65, 12]
const BLANC = [255, 255, 255]

function dansPolygone(x, y, pts) {
  let dedans = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i]
    const [xj, yj] = pts[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dedans = !dedans
  }
  return dedans
}

const MAISON = [[256,130],[126,245],[166,245],[166,370],[346,370],[346,245],[386,245]]

function couleur(x, y) {
  // x, y dans un repère 512 x 512
  if (x >= 226 && x <= 286 && y >= 290 && y <= 370) return ORANGE
  if (dansPolygone(x, y, MAISON)) return BLANC
  return ORANGE
}

function crc32(buf) {
  let c, crc = 0xffffffff
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    crc = (crc >>> 8) ^ c
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const t = Buffer.from(type)
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])))
  return Buffer.concat([len, t, data, crc])
}

function png(taille) {
  const raw = Buffer.alloc((taille * 3 + 1) * taille)
  const SS = 3
  for (let py = 0; py < taille; py++) {
    raw[py * (taille * 3 + 1)] = 0
    for (let px = 0; px < taille; px++) {
      let r = 0, g = 0, b = 0
      for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
        const x = ((px + (sx + 0.5) / SS) / taille) * 512
        const y = ((py + (sy + 0.5) / SS) / taille) * 512
        const c = couleur(x, y)
        r += c[0]; g += c[1]; b += c[2]
      }
      const o = py * (taille * 3 + 1) + 1 + px * 3
      raw[o] = Math.round(r / (SS * SS)); raw[o + 1] = Math.round(g / (SS * SS)); raw[o + 2] = Math.round(b / (SS * SS))
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(taille, 0); ihdr.writeUInt32BE(taille, 4)
  ihdr[8] = 8; ihdr[9] = 2
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

writeFileSync('public/pwa-192.png', png(192))
writeFileSync('public/pwa-512.png', png(512))
writeFileSync('public/apple-touch-icon.png', png(180))
console.log('Icônes générées.')
