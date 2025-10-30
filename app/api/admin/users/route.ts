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
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        const { db } = await connectToDatabase()
        const users = db.collection('users')

        const allUsers = await users.find({}, {
            projection: {
                password: 0 // Exclude password from response
            }
        }).sort({ createdAt: -1 }).toArray()

        const formattedUsers = allUsers.map(user => ({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }))

        return NextResponse.json({ users: formattedUsers })

    } catch (error: any) {
        console.error('Admin users fetch error:', error)
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
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        const { userId } = await req.json()
        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        const { db } = await connectToDatabase()
        const users = db.collection('users')
        const chatHistory = db.collection('chat_history')

        // Check if user exists and is not an admin
        const targetUser = await users.findOne({ _id: ObjectId.createFromHexString(userId) })
        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        if (targetUser.role === 'admin') {
            return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 403 })
        }

        // Delete user and their chat history
        await Promise.all([
            users.deleteOne({ _id: ObjectId.createFromHexString(userId) }),
            chatHistory.deleteMany({ userId })
        ])

        return NextResponse.json({ message: 'User deleted successfully' })

    } catch (error: any) {
        console.error('Admin user delete error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}