import { getAemetUrlData } from './getUrlData.js'

const convertPoligon = (poligon) => {
  return poligon?.trim()
    .split(' ')
    .map(p => {
      const [lat, lon] = p.split(',').map(Number)
      return [lon, lat]
    })
    .filter(p => !isNaN(p[0]) && !isNaN(p[1])) || []
}

function agruparAvisos (avisos) {
  const mapa = new Map()

  avisos.forEach(aviso => {
    if (!aviso.poligon) return

    // Clave única: el polígono completo + fecha inicio (para evitar duplicados raros)
    const clave = `${aviso.poligon}|${aviso.inicio}`

    if (!mapa.has(clave)) {
      mapa.set(clave, {
        id: aviso.id,
        poligon: aviso.poligon,
        zona: aviso.zona,
        inicio: aviso.inicio,
        fin: aviso.fin,
        nivel: aviso.nivel,
        eventos: [], // aquí juntamos todos los tipos de aviso
        descripciones: []
      })
    }

    const grupo = mapa.get(clave)
    grupo.eventos.push(aviso.evento)
    if (aviso.descripcion) grupo.descripciones.push(aviso.descripcion)
  })

  // Convertimos el Map a array y limpiamos duplicados en eventos
  return Array.from(mapa.values()).map(grupo => ({
    ...grupo,
    eventos: [...new Set(grupo.eventos)], // elimina duplicados
    descripcion: grupo.descripciones.join(' | ') || null,
    poligon: convertPoligon(grupo.poligon)
  }))
}

async function getAemetWarnings (url) {
  const res = await fetch(url)
  const buffer = await res.arrayBuffer()
  const bytes = new Uint8Array(buffer)

  const warnings = []
  let offset = 0

  while (offset < bytes.length) {
    const header = bytes.slice(offset, offset + 512)

    const name = new TextDecoder().decode(header.slice(0, 100)).replace(/\0/g, '')
    if (!name) break

    const sizeOctal = new TextDecoder().decode(header.slice(124, 136)).replace(/\0/g, '').trim()
    const size = parseInt(sizeOctal, 8)

    const fileStart = offset + 512
    const fileEnd = fileStart + size

    const content = new TextDecoder().decode(bytes.slice(fileStart, fileEnd))

    if (name.endsWith('.xml')) {
      const doc = new globalThis.DOMParser().parseFromString(content, 'text/xml')
      const infos = Array.from(doc.querySelectorAll('info'))
      const info = infos.find(
        i => i.querySelector('language')?.textContent === 'es-ES'
      )

      if (info) {
        const params = Array.from(info.querySelectorAll('parameter'))

        const nivel =
          params.find(p => p.querySelector('valueName')?.textContent?.includes('nivel'))
            ?.querySelector('value')?.textContent ?? null

        const parametro =
          params.find(p => p.querySelector('valueName')?.textContent?.includes('parametro'))
            ?.querySelector('value')?.textContent ?? null

        warnings.push({
          id: doc.querySelector('identifier')?.textContent ?? null,
          evento: info.querySelector('event')?.textContent ?? null,
          nivel,
          zona: info.querySelector('areaDesc')?.textContent ?? null,
          poligon: info.querySelector('polygon')?.textContent || '',
          inicio: info.querySelector('onset')?.textContent ?? null,
          fin: info.querySelector('expires')?.textContent ?? null,
          descripcion: info.querySelector('description')?.textContent ?? null,
          parametro
        })
      }
    }

    offset = fileStart + Math.ceil(size / 512) * 512
  }

  return agruparAvisos(warnings)
}

async function getLastAlerts () {
  try {
    const initialData = await getAemetUrlData('/aemet/avisos_cap/ultimoelaborado/area/esp')
    const xmlUrl = initialData.datos
    if (!xmlUrl) throw new Error('AEMET: No se encontró URL de datos')

    const alerts = await getAemetWarnings(xmlUrl)
    const response = {
      desconocido: [],
      verde: [],
      amarillo: [],
      naranja: [],
      rojo: []
    }

    alerts.forEach(item => {
      if (item.nivel === 'amarillo') response.amarillo.push(item)
      else if (item.nivel === 'verde') response.verde.push(item)
      else if (item.nivel === 'rojo') response.rojo.push(item)
      else if (item.nivel === 'naranja') response.naranja.push(item)
      else response.desconocido.push(item)
    })
    return response
  } catch (err) {
    return err
  }
}

export { getLastAlerts }
