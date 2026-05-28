import { getLastAlerts } from './index.js'

console.log('🔧 AEMET ES SDK - Developer Environment')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📦 Available functions:')
console.log('  - getLastAlerts() - Obtener últimas alertas de AEMET')
console.log('')
console.log('📋 Ejemplo de uso:')
console.log('  const alertas = await getLastAlerts()')
await getLastAlerts()
  .then(res => console.log(res))
console.log('')
