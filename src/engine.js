import { createApp } from 'h3'
import EventEmitter from 'eventemitter3'
// Internal modules
import AlisonServer from './server.js'
import AlisonPluginManager from './plugins.js'
// Utilities
import Logger from './util/logger.js'
import Router from './util/router.js'

export default class AlisonEngine {
  /**
   * Initialize essential props.
   */
  constructor(config) {
    this.initEmitter()
    this.debug = process.env.DEBUG || false;
    this.app = createApp()
    this.server = new AlisonServer()
    this.logger = new Logger('engine')
    this.router = new Router(this)
    this.config = config || {}
    // Plugins
    this.pluginManager = new AlisonPluginManager(this)
    this.plugins = {}
  }

  /**
   * Initialize event emitter props for class.
   */
  initEmitter() {
    const emitter = new EventEmitter()
    this.events = emitter
  }

  async initPlugins() {
    await this.pluginManager.getModules()
    await this.pluginManager.initAllModules()
  }

  /**
   * Import routes then run the server on a specified port.
   */
  async listen() {
    // Load plugin modules
    await this.initPlugins()
    this.plugins = this.pluginManager.plugins
    // Get routes and sync
    const routes = await this.router.getRoutes()
    Object.keys(routes).forEach((pathName) => {
      const pathMethods = Object.keys(routes[pathName])
      pathMethods.forEach((methodName) => {
        this.router.instance[methodName](pathName, routes[pathName][methodName])
      })
    })
    this.app.use(this.router.instance)
    // Run HTTP server
    this.server.listen(this)
  }
}