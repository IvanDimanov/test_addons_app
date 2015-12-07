'use strict'

/* Used for debug only */
function log (...args) { // eslint-disable-line no-unused-vars
  return console.log(...args)
}

import express from 'express'
import nodemailer from 'nodemailer'
import config from '../../config'
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

/* Notify our sales team about the Premium request */
function sendApprovalEmail(user, title) {
  /* Manage the sender transport */
  const transporter = nodemailer.createTransport({
    service: config.emailService.type,
    auth: {
      user: config.emailService.auth.user,
      pass: config.emailService.auth.password
    }
  })

  const mailOptions = {
    from: config.emailService.user,
    to: config.salesEmailAddress,
    subject: 'Premium account request',
    text: `Dear Sales team, User ${user.userName} (${user.email}) have just requested a Premium Addon "${title}". Kind Regards, Backend Server`,
    html: `Dear Sales team,
      <p>User <b>${user.userName} (${user.email})</b> have just requested a Premium Addon <b>"${title}"</b>.</p>
      <p>Kind Regards,<br />Backend Server</p>`
  }

  /* Try to send the predefined options to the received */
  transporter.sendMail(mailOptions, function sendingResponse (error, info) {
    if (error) {
      log(`Unable to send email ${JSON.stringify(mailOptions)}\n\nError: ${error.stack}`)
      return
    }

    log(`Mail to sales ${config.salesEmailAddress} successfully sent: ${info.response}`)
  })
}

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

  /* Send a special approval email for the requested user Premium feature */
  if (feature.isSet + '' === 'true' &&
    feature.isPremium + '' === 'true'
  ) {
    const user = await global.mongoDb.collection('users')
      .findOne({
        accountId: global.mongoDb.ObjectId(req.params.id)
      }, {
        userName: 1,
        email: 1
      })
    sendApprovalEmail(user, feature.title)
  }
})

export default router
