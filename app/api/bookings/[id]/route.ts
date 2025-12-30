import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { verifyToken } from '@/lib/auth'
import { Booking } from '@/lib/models/booking'
import { ObjectId } from 'mongodb'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const bookingId = params.id
    if (!bookingId || !ObjectId.isValid(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    
    // Find the booking and verify ownership
    const booking = await db
      .collection<Booking>('bookings')
      .findOne({ 
        _id: new ObjectId(bookingId),
        userId: new ObjectId(decoded.id)
      })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.status === 'cancelled') {
      return NextResponse.json({ error: 'Booking is already cancelled' }, { status: 400 })
    }

    // Update booking status to cancelled
    const result = await db
      .collection<Booking>('bookings')
      .updateOne(
        { 
          _id: new ObjectId(bookingId),
          userId: new ObjectId(decoded.id)
        },
        { 
          $set: { 
            status: 'cancelled',
            updatedAt: new Date()
          }
        }
      )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Booking cancelled successfully',
      bookingId: booking.bookingId
    })
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const bookingId = params.id
    if (!bookingId || !ObjectId.isValid(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    
    const booking = await db
      .collection<Booking>('bookings')
      .findOne({ 
        _id: new ObjectId(bookingId),
        userId: new ObjectId(decoded.id)
      })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}