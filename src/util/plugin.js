import Logger from './logger.js'

export default class AlisonPlugin {
  constructor(pluginName, engineObject) {
    this.name = pluginName
    this.logger = new Logger('plugin(' + this.name + ')')
    this.engine = engineObject || null
  }

  addProp(propName, propVal) {
    return Object.defineProperty(this.engine, propName, propVal)
  }
}