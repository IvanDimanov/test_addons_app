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

export default router
