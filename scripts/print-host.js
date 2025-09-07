/* eslint-disable no-console */
const { networkInterfaces } = require('os')

function getLanIPv4() {
  const interfaces = networkInterfaces()
  const all = Object.values(interfaces).flat().filter(Boolean)

  const isPrivate = (addr) => {
    if (!addr) return false
    if (addr.startsWith('10.')) return true
    if (addr.startsWith('192.168.')) return true
    const octets = addr.split('.').map(Number)
    // 172.16.0.0 – 172.31.255.255
    if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true
    return false
  }

  const candidates = all.filter((a) => a.family === 'IPv4' && a.internal === false)

  // Prefer private RFC1918 addresses
  const preferred = candidates.find((a) => isPrivate(a.address))
  if (preferred) return preferred.address

  // Fallback to first non-internal IPv4
  if (candidates.length > 0) return candidates[0].address

  return '0.0.0.0'
}

function getPort() {
  const fromEnv = process.env.PORT
  if (fromEnv && Number(fromEnv) > 0) return String(Number(fromEnv))

  try {
    const argvStr = process.env.npm_config_argv
    if (argvStr) {
      const argv = JSON.parse(argvStr)
      const original = Array.isArray(argv.original) ? argv.original : []
      for (let i = 0; i < original.length; i++) {
        const arg = String(original[i])
        if (arg === '-p' || arg === '--port') {
          const val = String(original[i + 1] || '')
          if (/^\d+$/.test(val)) return val
        }
        const m = arg.match(/^--port=(\d+)$/)
        if (m) return m[1]
      }
    }
  } catch (_) {
    // ignore
  }

  return '3000'
}

const ip = getLanIPv4()
const port = getPort()

console.log('')
console.log(`Local:   http://localhost:${port}`)
console.log(`Network: http://${ip}:${port}`)
console.log('')