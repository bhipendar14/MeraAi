"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, CreditCard, User, Calendar, MapPin, Mail, Phone, Cake } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/toast-provider"

interface PassengerInfo {
  name: string
  email: string
  phone: string
  age: number
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  bookingData: {
    type: 'train' | 'bus' | 'flight' | 'hotel'
    from: string
    to: string
    date: string
    price: number
    passengerCount?: number // Optional passenger count
    details: any
  }
}

export function BookingModal({ isOpen, onClose, bookingData }: BookingModalProps) {
  const { user } = useAuth()
  const { showError, showSuccess } = useToast()
  const [passengers, setPassengers] = useState(bookingData?.passengerCount || 1)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingId, setBookingId] = useState('')

  // Array of passenger details
  const [passengersList, setPassengersList] = useState<PassengerInfo[]>([])

  // Initialize passenger list when modal opens or passenger count changes
  useEffect(() => {
    if (isOpen && bookingData) {
      const count = bookingData.passengerCount || 1
      setPassengers(count)

      // Create array with first passenger pre-filled, others empty
      const initialPassengers: PassengerInfo[] = Array.from({ length: count }, (_, index) => ({
        name: index === 0 ? (user?.name || '') : '',
        email: index === 0 ? (user?.email || '') : '',
        phone: index === 0 ? (user?.phone || '') : '',
        age: index === 0 ? 25 : 18
      }))

      setPassengersList(initialPassengers)
    }
  }, [isOpen, bookingData?.passengerCount, user])

  if (!isOpen) return null

  const updatePassenger = (index: number, field: keyof PassengerInfo, value: string | number) => {
    const updated = [...passengersList]
    updated[index] = { ...updated[index], [field]: value }
    setPassengersList(updated)
  }

  const handleBooking = async () => {
    if (!user) return

    // Validate all passengers have names and ages
    for (let i = 0; i < passengersList.length; i++) {
      if (!passengersList[i].name.trim()) {
        showError(`Please enter name for Passenger ${i + 1}`, 'Validation Error')
        return
      }
      if (!passengersList[i].age || passengersList[i].age < 1) {
        showError(`Please enter valid age for Passenger ${i + 1}`, 'Validation Error')
        return
      }
    }

    setIsBooking(true)
    try {
      const authToken = localStorage.getItem('auth_token')
      if (!authToken) {
        showError('Please log in again to complete your booking', 'Authentication Required')
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
          bookingDetails: bookingData.details,
          passengersList: passengersList, // Send array of all passengers
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
        showError(data.error || 'Internal server error', 'Booking Failed')
      }
    } catch (error) {
      console.error('Booking error:', error)
      showError('Please try again later', 'Booking Failed')
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
            <Button
              onClick={() => {
                setBookingSuccess(false)
                setBookingId('')
                onClose()
              }}
              className="w-full"
            >
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
            <div className="grid grid-cols-1 gap-3 text-sm">
              {bookingData.type === 'hotel' ? (
                <>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{bookingData.details?.hotelName}</div>
                      <div className="text-xs text-muted-foreground truncate">{bookingData.from}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>{bookingData.details?.checkIn} → {bookingData.details?.checkOut}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {bookingData.details?.nights} night{bookingData.details?.nights > 1 ? 's' : ''} • {bookingData.details?.roomType}
                  </div>
                </>
              ) : bookingData.type === 'flight' ? (
                <>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{bookingData.from} → {bookingData.to}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>{bookingData.date}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {bookingData.details?.airline} • {bookingData.details?.flightNumber}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {bookingData.details?.departureTime} - {bookingData.details?.arrivalTime} ({bookingData.details?.duration})
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{bookingData.from} → {bookingData.to}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>{bookingData.date}</span>
                  </div>
                  {bookingData.details?.operator && (
                    <div className="text-xs text-muted-foreground">
                      {bookingData.details.operator} • {bookingData.details.departureTime} - {bookingData.details.arrivalTime}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-semibold capitalize">{bookingData.type}</span>
              <span className="font-semibold">₹{bookingData.price.toLocaleString()}</span>
            </div>
          </div>

          {/* Passenger Details */}
          <div className="space-y-6">
            {passengersList.map((passenger, index) => (
              <div key={index} className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Passenger {index + 1} Details
                  {index === 0 && <span className="text-xs text-muted-foreground font-normal">(Primary Contact)</span>}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`passenger-name-${index}`}>Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id={`passenger-name-${index}`}
                        value={passenger.name}
                        onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                        placeholder="Enter passenger name"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`passenger-email-${index}`}>Email {index === 0 && '*'}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id={`passenger-email-${index}`}
                        type="email"
                        value={passenger.email}
                        onChange={(e) => updatePassenger(index, 'email', e.target.value)}
                        placeholder="Enter email"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`passenger-phone-${index}`}>Phone {index === 0 && '*'}</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id={`passenger-phone-${index}`}
                        value={passenger.phone}
                        onChange={(e) => updatePassenger(index, 'phone', e.target.value)}
                        placeholder="Enter phone number"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`passenger-age-${index}`}>Age *</Label>
                    <div className="relative">
                      <Cake className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id={`passenger-age-${index}`}
                        type="number"
                        min="1"
                        max="120"
                        value={passenger.age}
                        onChange={(e) => updatePassenger(index, 'age', parseInt(e.target.value) || 18)}
                        placeholder="Enter age"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>
                {index < passengersList.length - 1 && <div className="border-t my-4" />}
              </div>
            ))}
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

          {
            !user && (
              <p className="text-sm text-muted-foreground text-center">
                Please log in to complete your booking
              </p>
            )
          }
        </CardContent >
      </Card >
    </div >
  )
}