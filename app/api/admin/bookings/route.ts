import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'

// GET - Admin only: Fetch all bookings with user details
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

        // Check if user is admin
        if (user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
        }

        const { db } = await connectToDatabase()

        // Fetch all bookings
        const bookings = await db
            .collection('bookings')
            .find({})
            .sort({ createdAt: -1 })
            .toArray()

        // Format bookings with passenger details
        const formattedBookings = bookings.map((booking) => ({
            id: booking._id.toString(),
            bookingId: booking.bookingId,
            type: booking.type,
            from: booking.from,
            to: booking.to,
            departureDate: booking.departureDate,
            returnDate: booking.returnDate,
            passengers: booking.passengers,
            status: booking.status,
            totalPrice: booking.totalPrice,
            bookingDetails: booking.bookingDetails,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
            passengerDetails: booking.passengerDetails || null,
            passengersList: booking.passengersList || null  // Add passengersList for multi-passenger bookings
        }))

        return NextResponse.json({ bookings: formattedBookings })

    } catch (error: any) {
        console.error('[Admin Bookings GET] Error:', error)
        return NextResponse.json({
            error: 'Internal server error',
            details: error.message
        }, { status: 500 })
    }
}

// DELETE - Admin only: Delete booking(s)
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

        // Check if user is admin
        if (user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
        }

        const { searchParams } = new URL(req.url)
        const bookingId = searchParams.get('bookingId')
        const clearAll = searchParams.get('clearAll')

        const { db } = await connectToDatabase()

        if (clearAll === 'true') {
            // Delete all bookings
            await db.collection('bookings').deleteMany({})
            return NextResponse.json({ message: 'All bookings deleted' })
        } else if (bookingId) {
            // Delete specific booking by MongoDB _id
            await db.collection('bookings').deleteOne({ _id: new ObjectId(bookingId) })
            return NextResponse.json({ message: 'Booking deleted' })
        } else {
            return NextResponse.json({ error: 'Missing bookingId or clearAll parameter' }, { status: 400 })
        }

    } catch (error: any) {
        console.error('[Admin Bookings DELETE] Error:', error)
        return NextResponse.json({
            error: 'Internal server error',
            details: error.message
        }, { status: 500 })
    }
}
