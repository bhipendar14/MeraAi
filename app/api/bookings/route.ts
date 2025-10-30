import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { verifyToken } from '@/lib/auth'
import { Booking } from '@/lib/models/booking'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const bookings = await db
      .collection<Booking>('bookings')
      .find({ userId: ObjectId.createFromHexString(decoded.id) })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { type, from, to, departureDate, returnDate, passengers, totalPrice, bookingDetails } = body

    if (!type || !from || !to || !departureDate || !passengers || !totalPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    
    const booking: Booking = {
      userId: ObjectId.createFromHexString(decoded.id),
      bookingId: `BK${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      type,
      from,
      to,
      departureDate,
      returnDate,
      passengers,
      status: 'confirmed',
      totalPrice,
      bookingDetails: bookingDetails || {},
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection<Booking>('bookings').insertOne(booking)
    
    return NextResponse.json({ 
      message: 'Booking created successfully',
      bookingId: booking.bookingId,
      id: result.insertedId
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}