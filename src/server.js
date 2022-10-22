import { createServer } from 'http'
import { toNodeListener } from 'h3'
import { validatePort } from './util/validate.js'

export default class AlisonServerInstance {
  constructor() {
    // Get port and validate it, defaults to 3000
    this.port = process.env.PORT || 3000
    validatePort.bind(this)(this.port)
  }

  listen(engine) {
    const port = this.port
    const { logger, events, app } = engine
    createServer(toNodeListener(app))
      .listen(port)
      .on('listening', () => {
        logger.info('Server listening port', port)
        events.emit('listening', port)
      })
      .on('request', (request) => {
        events.emit('request', request)
      })
      .on('error', (err) => {
        events.emit('serverError', err)
      });
  }
}