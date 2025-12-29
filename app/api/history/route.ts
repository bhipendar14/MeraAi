import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'

const COLLECTION_NAME = 'activity_history'

// GET - Fetch user's history by category
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

        const { searchParams } = new URL(req.url)
        const category = searchParams.get('category')

        const { db } = await connectToDatabase()
        const collection = db.collection(COLLECTION_NAME)

        // Build query - filter by user and optionally by category
        const query: any = { userId: user.id }
        if (category) {
            query.category = category
        }

        const activities = await collection
            .find(query)
            .sort({ timestamp: -1 })
            .limit(100) // Limit to last 100 activities per category
            .toArray()

        const formattedActivities = activities.map(activity => ({
            id: activity._id.toString(),
            userId: activity.userId,
            category: activity.category,
            type: activity.type,
            data: activity.data,
            timestamp: activity.timestamp
        }))

        return NextResponse.json({ activities: formattedActivities })

    } catch (error: any) {
        console.error('[History GET] Error:', error)
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
    }
}

// POST - Save new activity
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

        const { category, type, data } = await req.json()

        if (!category || !type || !data) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const { db } = await connectToDatabase()
        const collection = db.collection(COLLECTION_NAME)

        const activity = {
            userId: user.id,
            category,
            type,
            data,
            timestamp: new Date()
        }

        const result = await collection.insertOne(activity)

        return NextResponse.json({
            id: result.insertedId.toString(),
            message: 'Activity saved successfully'
        })

    } catch (error: any) {
        console.error('[History POST] Error:', error)
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
    }
}

// DELETE - Delete specific item or clear all by category
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

        const { searchParams } = new URL(req.url)
        const itemId = searchParams.get('itemId')
        const category = searchParams.get('category')

        const { db } = await connectToDatabase()
        const collection = db.collection(COLLECTION_NAME)

        if (itemId) {
            // Delete specific item
            const result = await collection.deleteOne({
                _id: new ObjectId(itemId),
                userId: user.id // Ensure user can only delete their own items
            })

            if (result.deletedCount === 0) {
                return NextResponse.json({ error: 'Item not found' }, { status: 404 })
            }

            return NextResponse.json({ message: 'Item deleted successfully' })
        } else if (category) {
            // Clear all items in category
            await collection.deleteMany({
                userId: user.id,
                category
            })

            return NextResponse.json({ message: `All ${category} history cleared successfully` })
        } else {
            // Clear all history
            await collection.deleteMany({ userId: user.id })

            return NextResponse.json({ message: 'All history cleared successfully' })
        }

    } catch (error: any) {
        console.error('[History DELETE] Error:', error)
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
    }
}
