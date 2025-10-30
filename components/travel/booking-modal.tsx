"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, CreditCard, User, Calendar, MapPin } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  bookingData: {
    type: 'train' | 'bus' | 'flight' | 'hotel'
    from: string
    to: string
    date: string
    price: number
    details: any
  }
}

export function BookingModal({ isOpen, onClose, bookingData }: BookingModalProps) {
  const { user } = useAuth()
  const [passengers, setPassengers] = useState(1)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingId, setBookingId] = useState('')

  if (!isOpen) return null

  const handleBooking = async () => {
    if (!user) return

    setIsBooking(true)
    try {
      const authToken = localStorage.getItem('auth_token')
      if (!authToken) {
        alert('Please log in again to complete your booking')
        return
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          type: bookingData.type,
          from: bookingData.from,
          to: bookingData.to,
          departureDate: bookingData.date,
          passengers,
          totalPrice: bookingData.price * passengers,
          bookingDetails: bookingData.details
        })
      })

      const data = await response.json()
      console.log('Booking response:', { status: response.status, data })
      
      if (response.ok) {
        setBookingId(data.bookingId)
        setBookingSuccess(true)
        // Refresh bookings in parent component
        window.dispatchEvent(new CustomEvent('bookingCreated'))
      } else {
        console.error('Booking failed:', data)
        alert('Booking failed: ' + data.error)
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert('Booking failed. Please try again.')
    } finally {
      setIsBooking(false)
    }
  }

  if (bookingSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-green-600">Booking Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">Your booking has been confirmed successfully.</p>
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="font-semibold">Booking ID: {bookingId}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Save this ID for future reference
              </p>
            </div>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Booking
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Booking Summary */}
          <div className="bg-muted/30 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold">Booking Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{bookingData.from} → {bookingData.to}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{bookingData.date}</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-semibold">Type: {bookingData.type.toUpperCase()}</span>
              <span className="font-semibold">₹{bookingData.price}</span>
            </div>
          </div>

          {/* Passenger Details */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Passenger Details
            </h3>
            <div className="space-y-2">
              <Label htmlFor="passengers">Number of Passengers</Label>
              <Input
                id="passengers"
                type="number"
                min="1"
                max="6"
                value={passengers}
                onChange={(e) => setPassengers(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span>Base Price:</span>
              <span>₹{bookingData.price}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span>Passengers:</span>
              <span>{passengers}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span>Taxes & Fees:</span>
              <span>₹{Math.round(bookingData.price * passengers * 0.1)}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between items-center font-semibold text-lg">
              <span>Total:</span>
              <span>₹{Math.round(bookingData.price * passengers * 1.1)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 order-2 sm:order-1">
              Cancel
            </Button>
            <Button 
              onClick={handleBooking} 
              disabled={isBooking || !user}
              className="flex-1 order-1 sm:order-2"
            >
              {isBooking ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Booking...
                </span>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </div>

          {!user && (
            <p className="text-sm text-muted-foreground text-center">
              Please log in to complete your booking
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}