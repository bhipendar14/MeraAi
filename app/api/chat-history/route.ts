import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const chatHistory = db.collection('chat_history')

    const history = await chatHistory.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .toArray()

    const formattedHistory = history.map(chat => ({
      id: chat._id.toString(),
      messages: chat.messages,
      mode: chat.mode,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    }))

    return NextResponse.json({ history: formattedHistory })

  } catch (error: any) {
    console.error('Chat history fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { messages, mode } = await req.json()

    const { db } = await connectToDatabase()
    const chatHistory = db.collection('chat_history')

    const newChat = {
      userId: user.id,
      messages,
      mode,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await chatHistory.insertOne(newChat)

    return NextResponse.json({
      id: result.insertedId.toString(),
      message: 'Chat saved successfully'
    })

  } catch (error: any) {
    console.error('Chat history save error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const chatHistory = db.collection('chat_history')

    await chatHistory.deleteMany({ userId: user.id })

    return NextResponse.json({ message: 'Chat history cleared successfully' })

  } catch (error: any) {
    console.error('Chat history clear error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}