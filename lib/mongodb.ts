import { MongoClient, Db } from 'mongodb'
import dns from 'dns'

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

    const err = error as any
    if (err && (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') && err.syscall === 'querySrv') {
      console.warn('DNS SRV resolution failed. Setting fallback DNS servers (8.8.8.8, 1.1.1.1) and retrying...')
      try {
        dns.setServers(['8.8.8.8', '1.1.1.1'])
        
        const client = new MongoClient(MONGODB_URI, {
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 10000,
        })
        console.log('Attempting to connect to MongoDB with fallback DNS...')
        await client.connect()
        console.log('Successfully connected to MongoDB with fallback DNS')
        
        const db = client.db(MONGODB_DB)
        cachedClient = client
        cachedDb = db
        return { client, db }
      } catch (retryError) {
        console.error('MongoDB retry connection error:', retryError)
        throw new Error(`Failed to connect to MongoDB after DNS fallback: ${retryError instanceof Error ? retryError.message : 'Unknown error'}`)
      }
    }

    throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}