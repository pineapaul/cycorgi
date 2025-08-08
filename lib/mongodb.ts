import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local')
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient

declare global {
  var _mongoClientPromise: Promise<MongoClient>
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri!, options)
  global._mongoClientPromise = client.connect()
}
const clientPromise = global._mongoClientPromise

export default clientPromise