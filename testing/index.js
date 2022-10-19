import AlisonEngine from '../src/index.js'
const engine = new AlisonEngine({
  plugins: [
    './plugins/samplePlugin.js'
  ]
})
engine.listen()
