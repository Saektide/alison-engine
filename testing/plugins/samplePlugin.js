import { AlisonPlugin } from '../../src/index.js'

export default class samplePlugin extends AlisonPlugin {
  constructor(engine) {
    super('samplePlugin', engine)
    this.foo = 'bar'
  }

  samplePrint() {
    this.logger.info('Hello from samplePlugin!')
  }
}
