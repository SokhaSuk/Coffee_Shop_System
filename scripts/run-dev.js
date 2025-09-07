/* eslint-disable no-console */
const { networkInterfaces } = require('os')
const { spawn } = require('child_process')

function getLanIPv4() {
  const interfaces = networkInterfaces()
  const all = Object.values(interfaces).flat().filter(Boolean)
  const isPrivate = (addr) => {
    if (!addr) return false
    if (addr.startsWith('10.')) return true
    if (addr.startsWith('192.168.')) return true
    const octets = addr.split('.').map(Number)
    if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true
    return false
  }
  const candidates = all.filter((a) => a.family === 'IPv4' && a.internal === false)
  const preferred = candidates.find((a) => isPrivate(a.address))
  if (preferred) return preferred.address
  if (candidates.length > 0) return candidates[0].address
  return '0.0.0.0'
}

function parsePortFromArgs(argv) {
  for (let i = 0; i < argv.length; i++) {
    const arg = String(argv[i])
    if (arg === '-p' || arg === '--port') {
      const val = String(argv[i + 1] || '')
      if (/^\d+$/.test(val)) return val
    }
    const m = arg.match(/^--port=(\d+)$/)
    if (m) return m[1]
  }
  return null
}

function getPort(argv) {
  if (process.env.PORT && /^\d+$/.test(process.env.PORT)) return String(Number(process.env.PORT))
  const fromArgs = parsePortFromArgs(argv)
  if (fromArgs) return fromArgs
  return '3000'
}

function run() {
  const argv = process.argv.slice(2)
  const lanIp = getLanIPv4()
  const port = getPort(argv)
  const bindHost = process.env.DEV_HOST || '0.0.0.0'

  console.log('')
  console.log(`Local:   http://localhost:${port}`)
  console.log(`Network: http://${lanIp}:${port}`)
  console.log('')

  const nextBin = require.resolve('next/dist/bin/next')

  // Respect provided hostname flags, otherwise bind to 0.0.0.0
  const hasHostFlag = argv.some((a) => a === '-H' || a === '--hostname' || /^--hostname=/.test(String(a)))
  const args = hasHostFlag ? ['dev', ...argv] : ['dev', '-H', bindHost, ...argv]

  const child = spawn(process.execPath, [nextBin, ...args], {
    stdio: 'inherit',
    env: process.env,
  })

  child.on('exit', (code) => process.exit(code || 0))
}

run()


