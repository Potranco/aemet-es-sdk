import { getApiKey } from './apiKey'
const AEMET_URL = 'https://opendata.aemet.es/opendata/api'
const local = ''

const getAemetUrlData = async (url) => {
  try {
    const apiKey = getApiKey()
    if (apiKey instanceof Error) throw apiKey

    const service = `${local}${url}`
    const res = await fetch(service, {
      headers: { api_key: apiKey }
    })

    if (!res.ok) {
      if (res.status === 404) return []
      const text = await res.text()
      throw new Error(`AEMET inicial ${res.status}: ${text.slice(0, 200)}`)
    }

    const responseControl = await res.json()
    if (responseControl.estado && responseControl.estado !== 200) {
      throw new Error(`AEMET control ${responseControl.estado}: ${responseControl.descripcion}`)
    }
    return responseControl
  } catch (e) {
    return e
  }
}

export { getAemetUrlData }
