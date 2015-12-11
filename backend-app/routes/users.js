'use strict'

/* Used for debug only */
function log (...args) { // eslint-disable-line no-unused-vars
  return console.log(...args)
}

import express from 'express'
import db from '../db'
const router = express.Router()

router.get('/', async function getAllUsers (req, res) {
  const users = await db.collection('users')
  res.json( await users.find().toArray() )
})

/* NOTE: Route matches 'id' parameter but searches the DB with '_id' */
router.get('/:id', async function getSingleUser (req, res) {
  const users = await db.collection('users')
  res.json( await users.findOne({_id: new db.ObjectID(req.params.id)}) )
})

export default router
