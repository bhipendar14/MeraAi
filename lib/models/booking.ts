import { ObjectId } from 'mongodb'

export interface Booking {
  _id?: ObjectId
  userId: ObjectId
  bookingId: string
  type: 'train' | 'bus' | 'flight' | 'hotel'
  from: string
  to: string
  departureDate: string
  returnDate?: string
  passengers: number
  status: 'confirmed' | 'pending' | 'cancelled'
  totalPrice: number
  bookingDetails: {
    transportId?: string
    seatNumbers?: string[]
    hotelName?: string
    roomType?: string
    checkIn?: string
    checkOut?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface TravelRecommendation {
  _id?: ObjectId
  destination: string
  places: Array<{
    name: string
    description: string
    category: string
    rating: number
    lat: number
    lng: number
    image: string
    bestTimeToVisit: string
    estimatedDuration: string
  }>
  aiSummary: string
  weatherInfo?: {
    temperature: string
    condition: string
    humidity: string
  }
  localTips: string[]
  createdAt: Date
}