'use strict'

import fs from 'fs'
import validator from 'validator'
import utils from './utils'

/* Used solely in debugging */
const log = utils.log  // eslint-disable-line no-unused-vars


/*
  Returns a valid configuration JSON out of 'fileName' or 'node index --config_file_name=dev_config.json' or from default file.
  In case of error of the file, will throw a (hopefully) meaningful message.
  Returned object is frozen using the 'utils.recursiveFreezeObject()' function
*/
function getConfig (fileName) {
  /* Secure always a string value for 'fileName' */
  if (typeof fileName !== 'string' ||
      !fileName.length
  ) {
    /* Try to guess the config file path from the starting arguments
       if same was not sent as an incoming arguments
       Example: 'node index --config_file_name=dev_config.json'
    */
    const config_args = utils.toString(process.argv[2]).split('=')
    if (config_args[0] === '--config_file_name' &&
        config_args[1] &&
        typeof config_args[1] === 'string'
    ) {
      fileName = config_args[1]
    } else {
      fileName = 'default_config.json'
    }
  }

  {
    /* Any delayed tick above 1 year is useless */
    const MAX_VALID_TIMEOUT = 1 * 365 * 24 * 60 * 60 * 100

    /* Set a custom rule to determine a common timeout limits */
    validator.extend('isTimeout', function (test) {
      return validator.isInt(test) &&
             test * 1 >= 1 &&
             test * 1 <= MAX_VALID_TIMEOUT
    })
  }

  try {
    let filePath = `${__dirname}/${fileName}`
    try {
      fs.accessSync(filePath)
    } catch (error) {
      throw new Error(`Unable to access config "${filePath}": ${error.stack}`)
    }

    /* Will run a series of tests so all valid fields from 'configUntested' will be set into 'config' */
    let config = {}
    let configUntested
    try {
      configUntested = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    } catch (error) {
      throw new Error(`Config file "${filePath}" have invalid JSON: ${error.stack}`)
    }

    {
      const validEnvironments = [
        'test',
        'prod',
        'production',
        'dev',
        'develop',
        'development',
        'stage',
        'staging'
      ]

      if (!validEnvironments.includes(configUntested.environment)) {
        throw new Error(`Config file "${filePath}" have invalid property {string} "environment" = {${typeof configUntested.environment}} "${utils.toString(configUntested.environment)}". Valid environments are ["${validEnvironments.join('", "')}"]`)
      }
      config.environment = configUntested.environment
    }

    if (!configUntested.database ||
        typeof configUntested.database !== 'object'
    ) {
      throw new Error(`Config file "${filePath}" have invalid property {object} "database" = {${typeof configUntested.database}} "${utils.toString(configUntested.database)}"`)
    }
    config.database = {}

    if (!configUntested.database.server ||
        typeof configUntested.database.server !== 'object'
    ) {
      throw new Error(`Config file "${filePath}" have invalid property {object} "database.server" = {${typeof configUntested.database.server}} "${utils.toString(configUntested.database.server)}"`)
    }
    config.database.server = {}

    if (!validator.isIP(configUntested.database.server.ip)) {
      throw new Error(`Config file "${filePath}" have invalid property {IP} "database.server.ip" = {${typeof configUntested.database.server.ip}} "${utils.toString(configUntested.database.server.ip)}"`)
    }
    config.database.server.ip = configUntested.database.server.ip

    if (!validator.isInt(configUntested.database.server.port, {min: 0})) {
      throw new Error(`Config file "${filePath}" have invalid property {port} "database.server.port" = {${typeof configUntested.database.server.port}} "${utils.toString(configUntested.database.server.port)}"`)
    }
    config.database.server.port = configUntested.database.server.port

    if (!configUntested.database.name ||
        typeof configUntested.database.name !== 'string'
    ) {
      throw new Error(`Config file "${filePath}" have invalid property {string} "database.name" = {${typeof configUntested.database.name}} "${utils.toString(configUntested.database.name)}"`)
    }
    config.database.name = configUntested.database.name

    if (!configUntested.frontEndServer ||
        typeof configUntested.frontEndServer !== 'object'
    ) {
      throw new Error(`Config file "${filePath}" have invalid property {object} "frontEndServer" = {${typeof configUntested.frontEndServer}} "${utils.toString(configUntested.frontEndServer)}"`)
    }
    config.frontEndServer = {}

    if (!validator.isIP(configUntested.frontEndServer.ip)) {
      throw new Error(`Config file "${filePath}" have invalid property {IP} "frontEndServer.ip" = {${typeof configUntested.frontEndServer.ip}} "${utils.toString(configUntested.frontEndServer.ip)}"`)
    }
    config.frontEndServer.ip = configUntested.frontEndServer.ip

    if (!validator.isInt(configUntested.frontEndServer.port, {min: 0})) {
      throw new Error(`Config file "${filePath}" have invalid property {port} "frontEndServer.port" = {${typeof configUntested.frontEndServer.port}} "${utils.toString(configUntested.frontEndServer.port)}"`)
    }
    config.frontEndServer.port = configUntested.frontEndServer.port

    /* Be sure no one will be able to alter the set and valid configuration */
    return utils.recursiveFreezeObject(config)
  } catch (error) {
    throw new Error(`Unable to get config: ${error.message}`)
  }
}

/*
  Give access not only to the default configuration but give access to the mechanism as well
  so the callee can produce separate configs if find suitable
*/
export default getConfig()
export {getConfig as getConfig}
