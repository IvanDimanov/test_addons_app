'use strict'

import config from '../config'
import {MongoClient, ObjectID} from 'mongodb'

/* Try to establish DB connection */
const mongoDbURL = `mongodb://${config.database.server.ip}:${config.database.server.port}/${config.database.name}`
const connectDb = MongoClient.connect(mongoDbURL)

/* Cache all requested collection Promises for reduced access time */
const cachedCollections = []
async function collection (collectionName) {
  if (cachedCollections[collectionName]) {
    return cachedCollections[collectionName]
  }

  const db = await connectDb
  return (cachedCollections[collectionName] = db.collection(collectionName))
}

/* Requesting a collection will set it in the cache for quicker future access */
/* NOTE: No need for handling the connection, only caching is intended */
config.database.preCachedCollections.forEach(collectionName => cachedCollections[collectionName] = collection(collectionName))

/* Have a restrict access main functions only */
export default {collection, ObjectID}
