"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, CreditCard, Train, Bus, Plane, Building } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Booking } from "@/lib/models/booking"

export function MyBookings() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user])

  useEffect(() => {
    // Listen for booking created events
    const handleBookingCreated = () => {
      if (user) {
        fetchBookings()
      }
    }

    window.addEventListener('bookingCreated', handleBookingCreated)
    return () => window.removeEventListener('bookingCreated', handleBookingCreated)
  }, [user])

  const fetchBookings = async () => {
    try {
      const authToken = localStorage.getItem('auth_token')
      if (!authToken) return

      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    try {
      const authToken = localStorage.getItem('auth_token')
      if (!authToken) return

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        // Update the booking status locally
        setBookings(prev => prev.map(booking => 
          booking._id?.toString() === bookingId 
            ? { ...booking, status: 'cancelled' }
            : booking
        ))
      } else {
        alert('Failed to cancel booking. Please try again.')
      }
    } catch (error) {
      console.error('Error canceling booking:', error)
      alert('Failed to cancel booking. Please try again.')
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'train': return <Train className="h-4 w-4" />
      case 'bus': return <Bus className="h-4 w-4" />
      case 'flight': return <Plane className="h-4 w-4" />
      case 'hotel': return <Building className="h-4 w-4" />
      default: return <MapPin className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Please log in to view your bookings</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-muted/30 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No bookings yet</p>
              <p className="text-sm text-muted-foreground">Your travel bookings will appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Bookings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking._id?.toString()}
            className="border border-border/60 rounded-lg p-4 space-y-3 hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted/30 rounded-full flex items-center justify-center">
                  {getTypeIcon(booking.type)}
                </div>
                <div>
                  <p className="font-semibold">{booking.bookingId}</p>
                  <p className="text-sm text-muted-foreground capitalize">{booking.type}</p>
                </div>
              </div>
              <Badge className={getStatusColor(booking.status)}>
                {booking.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{booking.from} → {booking.to}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{new Date(booking.departureDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{booking.passengers} passenger{booking.passengers > 1 ? 's' : ''}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t gap-2">
              <span className="text-sm text-muted-foreground">
                Booked on {new Date(booking.createdAt).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-lg sm:text-base">₹{booking.totalPrice}</span>
                {booking.status === 'confirmed' && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleCancelBooking(booking._id?.toString() || '')}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}