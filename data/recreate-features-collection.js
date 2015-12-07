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

  const config = require('../config').default
  const promisedMongo = require('promised-mongo')

  /* Try to establish DB connection */
  const mongoDb = promisedMongo(`mongodb://${config.database.server.ip}:${config.database.server.port}/${config.database.name}`)

  /* Clear the way for the collection */
  const collectionName = 'features'
  mongoDb.collection(collectionName).drop()
    .catch(function onDropError (error) {
      log(`Unable to drop collection "${collectionName}": ${error.stack}`)

      /* Note: 'mongodb.close()' throws but we need to exit anyway */
      /* https://github.com/gordonmleigh/promised-mongo/issues/31#issuecomment-161629837 */
      process.exit()
    })

    /* Try to establish the collection wrap */
    .then(() => mongoDb.createCollection(collectionName))
    .catch(function onCreationError (error) {
      log(`Unable to create collection "${collectionName}": ${error.stack}`)
      process.exit()
    })
    .then(() => log(`Collection "${collectionName}" successfully created`))

    /* Fill with test data that's already met in the 'accounts' collection */
    .then(function fillWithTestData () {
      return mongoDb.collection(collectionName)
        .insert([{
          _id: 'security',
          title: 'Security',
          description: 'Top security policies and mechanics',
          isPremium: true
        }, {
          _id: 'approvalProcess',
          title: 'Approval Process',
          description: 'Do not let those processes unapproved',
          isPremium: false
        }, {
          _id: 'insightsUserActions',
          title: 'Insights',
          description: 'Why not let a colleague give it a look',
          isPremium: false
        }, {
          _id: 'coworking',
          title: 'Co-Working',
          description: 'Share those hard times will all of your team-mates',
          isPremium: false
        }, {
          _id: 'categories',
          title: 'Categories',
          description: 'Let no item stay out of focus with our very best "Categories" feature',
          isPremium: false
        }, {
          _id: 'categoriesForceUserToTag',
          title: 'Forced Categories',
          description: 'Be absolute in your categorization demand',
          isPremium: false
        }, {
          _id: 'templates',
          title: 'Templates',
          description: 'Have a quick and polite answer ready for you at any moment',
          isPremium: false
        }, {
          _id: 'cp_beta',
          title: 'Content-Planner',
          description: 'Still on beta but out QAs love it so far :)',
          isPremium: false
        }])
    })
    .catch(function onCreationError (error) {
      log(`Unable to fill collection "${collectionName}" with test data: ${error.stack}`)
      process.exit()
    })
    .then(() => log(`Test data successfuly loaded into collection "${collectionName}"`))

    .then(process.exit)
})()
