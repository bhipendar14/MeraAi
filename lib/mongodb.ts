import { MongoClient, Db } from 'mongodb'

const MONGODB_URI = process.env.MONGO_URI!
const MONGODB_DB = 'MeraAi1'

if (!MONGODB_URI) {
  throw new Error('Please define the MONGO_URI environment variable')
}

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  try {
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      connectTimeoutMS: 10000,
    })

    console.log('Attempting to connect to MongoDB...')
    await client.connect()
    console.log('Successfully connected to MongoDB')

    const db = client.db(MONGODB_DB)

    cachedClient = client
    cachedDb = db

    return { client, db }
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}