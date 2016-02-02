;(function main () {
  'use strict'

  /* Top level error handler */
  process.on('uncaughtException', function proggramCrashed (error) {
    console.log(' ')
    console.log(`   Final process Error at ${Date.now()}`)
    console.log('----------------------------------------------------------------')
    console.log(error instanceof Error ? error.stack : error)
    process.exit()
  })

  /* Triggered when a rejection occurred on a Promise that have no '.catch()' handler */
  process.on('unhandledRejection', function uncaughtPromiseRejection (reason, promise) {
    console.log(' ')
    console.log(`   Unhandled Rejection at ${Date.now()}`)
    console.log('----------------------------------------------------------------')
    console.log(`Promise ${promise} reason: ${reason}`)
    process.exit()
  })

  function log () { // eslint-disable-line no-unused-vars
    return console.log.apply(console, arguments)
  }

  const fs = require('fs')
  const path = require('path')
  const config = require('../config').default

  const alreadyExistsRegExp = /file already exists/i

  /* Hosting directory for main DB data */
  const dbPath = path.resolve(__dirname, 'db')
  try {
    fs.mkdirSync(dbPath)
  } catch (error) {
    if (!alreadyExistsRegExp.test(error)) {
      throw error
    }
  }

  /* Hosting directory for access logs */
  const logsPath = path.resolve(__dirname, 'logs')
  try {
    fs.mkdirSync(logsPath)
  } catch (error) {
    if (!alreadyExistsRegExp.test(error)) {
      throw error
    }
  }

  const configureMongodFileName = 'configure_mongod.txt'
  const configureMongodTemplate = `
bind_ip   = ${config.database.server.ip}
port      = ${config.database.server.port}
dbpath    = ${dbPath}
logpath   = ${logsPath}/mongod.log
logappend = true
journal   = true
auth      = false`

  fs.writeFileSync(path.resolve(__dirname, configureMongodFileName), configureMongodTemplate, 'utf-8')

  log(`Saving MongoDB configuration file "${configureMongodFileName}" successfully completed`)
})()
