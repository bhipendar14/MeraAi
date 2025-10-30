import { MongoClient, Db } from 'mongodb'

const MONGODB_URI = process.env.MONGO_URI!
const MONGODB_DB = 'MeraAi'

if (!MONGODB_URI) {
  throw new Error('Please define the MONGO_URI environment variable')
}

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  
  const db = client.db(MONGODB_DB)
  
  cachedClient = client
  cachedDb = db
  
  return { client, db }
}