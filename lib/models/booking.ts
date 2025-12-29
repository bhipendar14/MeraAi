import { ObjectId } from 'mongodb'

export interface PassengerDetails {
  name: string
  email: string
  phone: string
  age: number
}

export interface Booking {
  _id?: ObjectId
  userId: string  // Changed from ObjectId to string
  bookingId: string
  type: 'train' | 'bus' | 'flight' | 'hotel'
  from: string
  to: string
  departureDate: string
  returnDate?: string
  passengers: number
  passengerDetails?: PassengerDetails  // Old field - for backward compatibility
  passengersList?: PassengerDetails[]  // New field - array of all passengers
  status: 'confirmed' | 'pending' | 'cancelled'
  totalPrice: number
  bookingDetails: {
    transportId?: string
    seatNumbers?: string[]
    hotelName?: string
    roomType?: string
    checkIn?: string
    checkOut?: string
    operator?: string
    airline?: string
    flightNumber?: string
    departureTime?: string
    arrivalTime?: string
    duration?: string
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