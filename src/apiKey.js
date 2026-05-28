const getApiKey = () => {
  try {
    // 1. Buscamos en el objeto global 'process.env' (Next.js, Remix, Node)
    const processKey = typeof process !== 'undefined' && process.env
      ? (process.env.AEMET_API_KEY ||
                process.env.NEXT_PUBLIC_AEMET_API_KEY ||
                process.env.REACT_APP_AEMET_API_KEY)
      : undefined

    // 2. Buscamos en 'import.meta.env' (Vite, Astro, Nuxt)
    const metaKey = typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_AEMET_API_KEY ||
                import.meta.env.AEMET_API_KEY)
      : undefined

    const result = processKey || metaKey

    if (!result) {
      throw new Error(
        '⚠️ [aemet-e-sdk] No se encontró ninguna API Key de AEMET. ' +
                'Asegúrate de configurarla en tu archivo .env como AEMET_API_KEY'
      )
    }

    return result
  } catch (e) {
    return e
  }
}

export {
  getApiKey
}
