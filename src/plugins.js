import path from 'path'
import Logger from './util/logger.js'

export default class AlisonPluginManager {
  constructor(engine) {
    this.logger = new Logger('pluginManager')
    this.pluginModules = {}
    this.plugins = {}
    this._engine = engine
  }

  async getModules() {
    const pluginPathsArray = this._engine.config?.plugins
    if (!pluginPathsArray) return;
    await Promise.all(
      pluginPathsArray.map(async (pluginPath) => {
        const normalizedPath = 'file://' + path.resolve(process.cwd(), pluginPath)
        const pluginModuleRaw = await import(normalizedPath)
        const pluginModule = pluginModuleRaw.default
        this.pluginModules[pluginModule.name] = pluginModule
      })
    )
    return this.pluginModules
  }

  async initModule(pluginModule) {
    return new pluginModule(this._engine)
  }

  async initAllModules() {
    await Promise.all(
      Object.keys(this.pluginModules).map(async (pluginName) => {
        const thisPlugin = this.pluginModules[pluginName]
        this.plugins[pluginName] = await this.initModule(thisPlugin)
        this.logger.debug(pluginName, 'initialized.')
      })
    )
    return this.plugins
  }
}