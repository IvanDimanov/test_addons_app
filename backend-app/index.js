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

/* Used for debug only */
function log (...args) { // eslint-disable-line no-unused-vars
  return console.log(...args)
}

import path from 'path'
import express from 'express'
import winston from 'winston'
import expressWinston from 'express-winston'
import config from '../config'

import promisedMongo from 'promised-mongo'

/* Try to establish DB connection and present it to all local modules */
/* TODO: Auth */
global.mongoDb = promisedMongo(`mongodb://${config.database.server.ip}:${config.database.server.port}/${config.database.name}`)

const app = express()

/* No need for revealing the Backend serving mechanism */
app.disable('x-powered-by')

/* Let the Frontend know whats the running environment */
app.use(function setEnvironmentHeader (req, res, next) {
  if (!res.headersSent) {
    res.header('x-environment', config.environment)
  }
  next()
})

/* UI resource location for all JS and CSS */
app.use(express.static(path.resolve(__dirname + '/../frontend-app/public')))

/* Standard logging for all requests */
app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console({
      colorize: true
    })
  ],
  meta: true, // optional: control whether you want to log the meta data about the request (default to true)
  msg: 'HTTP {{req.method}} {{req.url}}', // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
  expressFormat: true, // Use the default Express/morgan request formatting, with the same colors. Enabling this will override any msg and colorStatus if true. Will only output colors on transports with colorize set to true
  colorStatus: true, // Color the status code, using the Express/morgan color palette (default green, 3XX cyan, 4XX yellow, 5XX red). Will not be recognized if expressFormat is true
  ignoreRoute: function (req, res) { return false } // optional: allows to skip some log messages based on request and/or response
}))

import accountsRouter from './routes/accounts'
import usersRouter from './routes/users'
import featuresRouter from './routes/features'

app.use('/accounts', accountsRouter)
app.use('/users', usersRouter)
app.use('/features', featuresRouter)

/* Never miss an error */
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      colorize: true
    })
  ]
}))

/* Kickoff with the Express server, ready to accept requests */
const server = app.listen(config.frontEndServer.port, config.frontEndServer.ip, function onServerStarted () {
  log(`Express server is up & running at http://${server.address().address}:${server.address().port}`)
  /* TODO: Compare "server.address().address / port" with "config.frontEndServer.ip / port" */
})
