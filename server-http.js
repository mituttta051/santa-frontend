const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const os = require('os')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, hostname, (err) => {
    if (err) throw err
    const networkInterfaces = os.networkInterfaces()
    let networkIp = 'localhost'
    for (const interfaceName in networkInterfaces) {
      for (const iface of networkInterfaces[interfaceName]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          networkIp = iface.address
          break
        }
      }
      if (networkIp !== 'localhost') break
    }
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> Local: http://localhost:${port}`)
    console.log(`> Network: http://${networkIp}:${port}`)
  })
})

