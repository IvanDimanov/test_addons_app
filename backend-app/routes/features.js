'use strict'

/* Used for debug only */
function log (...args) { // eslint-disable-line no-unused-vars
  return console.log(...args)
}

import express from 'express'
const router = express.Router()

router.get('/', async function getAllFeatures (req, res) {
  const features = await global.mongoDb.collection('features')
  res.json( await features.find().toArray() )
})

/* NOTE: Route matches 'id' parameter but searches the DB with '_id' */
router.get('/:id', async function getSingleFeature (req, res) {
  const features = await global.mongoDb.collection('features')
  res.json( await features.findOne({_id: req.params.id}) )
})

export default router
