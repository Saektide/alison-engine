export default {
  async post({ engine }) {
    const samplePlugin = engine.plugins.samplePlugin
    samplePlugin.samplePrint()
    return { success: true }
  }
}
