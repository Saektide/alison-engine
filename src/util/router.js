import { createRouter,  fromNodeMiddleware, readBody } from 'h3'
import Logger from './logger.js'
import { validateRequestMethod } from './validate.js'
import fs from 'fs'
import path from 'path'

export default class Router {
  constructor(engineObject) {
    this.instance = new createRouter()
    this.log = new Logger('router')
    this.routerFiles = []
    this._engine = engineObject
  }

  async getRoutes() {
    const dirPath = path.join(process.cwd(), 'routes')
    await this.scanDir(dirPath)
    const routesToExport = {}

    await Promise.all(
      this.routerFiles.map(async (file) => {
        // If path is a directory, skip it
        if (file.isDir) return
        // Add route object
        const routeModule = await this.importFile(file.path, file.name)
        if (!routeModule) return;
        const routePath = file.normalized
        routesToExport[routePath] = {}
        const routeKeys = Object.keys(routeModule)
        // Validate and import methods
        routeKeys.forEach((methodKey) => {
          if (!validateRequestMethod(methodKey, true)) return;
          this.log.debug(methodKey.toUpperCase(), 'method discovered at', file.normalized, 'module.')
          routesToExport[routePath][methodKey] = fromNodeMiddleware(async (request, response) => {
            const routeLogger = new Logger(`route(${file.normalized})`)
            this._engine.events.emit('beforeRequest', { path: file.normalized, method: methodKey })
            const methodFunctionObject = {
              request,
              response,
              engine: this._engine,
              logger: routeLogger
            }
            if (methodKey.toLowerCase() !== 'get') {
              methodFunctionObject.body = await readBody(request)
            }
            const result = await routeModule[methodKey](methodFunctionObject)
            this._engine.events.emit('afterRequest', { path: file.normalized, method: methodKey })
            return result
          })
        })
        this.log.debug('"' + file.normalized + '" added.')
      })
    )
    return routesToExport
  }

  isDir(path) {
    return fs.lstatSync(path).isDirectory()
  }

  async scanDir(dirPath, prefix = '') {
    const files = []
    const dirContent = fs.readdirSync(dirPath)
    await Promise.all(
      dirContent.map(async (filename) => {
        const filepath = path.join(dirPath, filename)
        const isDir = this.isDir(filepath)
        const normalizedName = prefix + '/' + filename.replace(/.(js|ts)$/, '').replace(/^index$/i, '')
        const fileDetails = {
          name: filename,
          normalized: normalizedName,
          path: filepath,
          isDir,
          ext: path.extname(filepath)
        }
        if (isDir) {
          const subDirContent = await this.scanDir(filepath, normalizedName)
          fileDetails.content = subDirContent
        } else {
          this.routerFiles.push(fileDetails)
        }
        files.push(fileDetails)
      })
    )
    return files
  }

  async importFile(filepath) {
    const filepathURI = 'file://' + filepath
    const routerModuleImport = await import(filepathURI)
    const routerModule = routerModuleImport.default
    if (!routerModule) {
      this.log.warn(filepathURI, 'is not a valid JS file, skipping...')
      return
    }
    return routerModule
  }
}
