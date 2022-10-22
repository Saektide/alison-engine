import Logger from './logger.js'
const fallbackLogger = new Logger('validate')

export function validatePort(portNumber) {
  const logger = this?.logger || fallbackLogger
  if (!portNumber) {
    logger.error('Port cannot be undefined!', 'EngineError')
    return
  }

  if (isNaN(parseInt(portNumber))) {
    logger.error('Port is not a valid number, got ' + portNumber.constructor.name, 'EngineError')
    return
  }

  if (portNumber > Math.pow(2, 16)) {
    logger.error('Port cannot be greater than ' + Math.pow(2, 16), 'EngineError')
    return
  }

  return true
}

export function validateRequestMethod(requestMethod, shouldThrowError = true) {
  const logger = this?.logger || fallbackLogger
  if (typeof requestMethod !== 'string') {
    const throwType = shouldThrowError ? logger.error : logger.warn
    throwType('Request method is not valid, expected String but got', typeof requestMethod)
    return
  }
  const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD']
  return validMethods.includes(requestMethod.toUpperCase())
}