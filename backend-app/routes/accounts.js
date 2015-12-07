'use strict'

/* Used for debug only */
function log (...args) { // eslint-disable-line no-unused-vars
  return console.log(...args)
}

import express from 'express'
const router = express.Router()

router.get('/', async function getAllAccounts (req, res) {
  const accounts = await global.mongoDb.collection('accounts')
  res.json( await accounts.find().toArray() )
})

/* NOTE: Route matches 'id' parameter but searches the DB with '_id' */
router.get('/:id', async function getSingleAccount (req, res) {
  const accounts = await global.mongoDb.collection('accounts')
  res.json( await accounts.findOne({_id: global.mongoDb.ObjectId(req.params.id)}) )
})

router.put('/:id/features', async function updateAccountFeatures (req, res) {
  const feature = req.body
  const featurePropertyName = `${feature.isPremium + '' === 'true' ? 'premiumFeatures' : 'features'}.${feature.id}`

  const accounts = await global.mongoDb.collection('accounts')
  await accounts.update({
    _id: global.mongoDb.ObjectId(req.params.id)
  }, {
    $set: {
      [featurePropertyName]: feature.isSet + '' === 'true'  /* Data always comes as a string so string verification needed */
    }
  }, {
    upsert: false, /* Do not insert if same is not found */
    multi: false /* Single update only */
  })

  /* Send back exact picture of the updated Account */
  res.json( await accounts.findOne({_id: global.mongoDb.ObjectId(req.params.id)}) )
})

export default router
