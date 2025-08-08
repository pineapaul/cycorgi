import { MongoClient } from 'mongodb'

const options = {}

let client: MongoClient

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI
  
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable in .env.local')
  }

  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  
  return global._mongoClientPromise
}

export default getClientPromise