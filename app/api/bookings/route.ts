import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { verifyToken } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      console.log('[Bookings GET] No token provided')
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      console.log('[Bookings GET] Invalid token')
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    console.log('[Bookings GET] Fetching bookings for user:', decoded.id)

    const { db } = await connectToDatabase()

    // Query by userId as string to avoid ObjectId conversion issues
    const bookings = await db
      .collection('bookings')
      .find({ userId: decoded.id, status: { $ne: 'cancelled' } })
      .sort({ createdAt: -1 })
      .toArray()

    console.log('[Bookings GET] Found', bookings.length, 'bookings')

    return NextResponse.json({ bookings })
  } catch (error: any) {
    console.error('[Bookings GET] Error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      console.log('[Bookings POST] No token provided')
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      console.log('[Bookings POST] Invalid token')
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    console.log('[Bookings POST] Request body:', JSON.stringify(body, null, 2))

    const { type, from, to, departureDate, returnDate, passengers, totalPrice, bookingDetails, passengerDetails, passengersList } = body

    if (!type || !from || !to || !departureDate || !passengers || !totalPrice) {
      console.log('[Bookings POST] Missing required fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate passenger list if provided
    if (passengersList && passengersList.length !== passengers) {
      console.log('[Bookings POST] Passenger list count mismatch')
      return NextResponse.json({
        error: `Passenger list must contain ${passengers} passenger(s)`
      }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    console.log('[Bookings POST] Connected to database')

    // Generate unique booking ID using UUID
    const uniqueId = uuidv4().split('-')[0].toUpperCase()
    const bookingId = `BK-${uniqueId}`

    const booking = {
      userId: decoded.id,
      bookingId,
      type,
      from,
      to,
      departureDate,
      returnDate,
      passengers,
      passengerDetails: passengerDetails || null, // Old format - for backward compatibility
      passengersList: passengersList || null, // New format - array of passengers
      status: 'confirmed',
      totalPrice,
      bookingDetails: bookingDetails || {},
      createdAt: new Date(),
      updatedAt: new Date()
    }

    console.log('[Bookings POST] Creating booking:', booking.bookingId)

    const result = await db.collection('bookings').insertOne(booking)
    console.log('[Bookings POST] Booking created successfully:', result.insertedId)

    return NextResponse.json({
      message: 'Booking created successfully',
      bookingId: booking.bookingId,
      id: result.insertedId
    })
  } catch (error: any) {
    console.error('[Bookings POST] Error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      console.log('[Bookings DELETE] No token provided')
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      console.log('[Bookings DELETE] Invalid token')
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 })
    }

    console.log('[Bookings DELETE] Cancelling booking:', bookingId)

    const { db } = await connectToDatabase()

    // Find the booking
    const booking = await db.collection('bookings').findOne({
      bookingId,
      userId: decoded.id
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.status === 'cancelled') {
      return NextResponse.json({ error: 'Booking already cancelled' }, { status: 400 })
    }

    // Check 48-hour policy
    const departureTime = new Date(booking.departureDate).getTime()
    const now = Date.now()
    const hoursUntilDeparture = (departureTime - now) / (1000 * 60 * 60)

    console.log('[Bookings DELETE] Hours until departure:', hoursUntilDeparture)

    if (hoursUntilDeparture < 48) {
      return NextResponse.json({
        error: 'Cannot cancel within 48 hours',
        canCancel: false,
        hoursUntilDeparture,
        reason: '48_hour_policy'
      }, { status: 400 })
    }

    // Cancel the booking
    await db.collection('bookings').updateOne(
      { bookingId, userId: decoded.id },
      {
        $set: {
          status: 'cancelled',
          cancelledAt: new Date(),
          updatedAt: new Date()
        }
      }
    )

    console.log('[Bookings DELETE] Booking cancelled successfully')

    return NextResponse.json({
      message: 'Booking cancelled successfully',
      bookingId
    })
  } catch (error: any) {
    console.error('[Bookings DELETE] Error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}