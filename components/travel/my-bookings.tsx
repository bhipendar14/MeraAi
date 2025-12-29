"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, CreditCard, Train, Bus, Plane, Building, Download } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/toast-provider"
import { Booking } from "@/lib/models/booking"
import { CancellationPolicyModal } from "./cancellation-policy-modal"
import { downloadTicket } from "@/lib/ticket-generator"

export function MyBookings() {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [policyModal, setPolicyModal] = useState<{
    isOpen: boolean
    canCancel: boolean
    hoursUntilDeparture?: number
  }>({ isOpen: false, canCancel: false })

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
    try {
      const authToken = localStorage.getItem('auth_token')
      if (!authToken) return

      const response = await fetch(`/api/bookings?bookingId=${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        showSuccess('Your booking has been cancelled successfully', 'Booking Cancelled')
        // Refresh bookings
        fetchBookings()
      } else if (data.reason === '48_hour_policy') {
        // Show policy modal
        setPolicyModal({
          isOpen: true,
          canCancel: false,
          hoursUntilDeparture: data.hoursUntilDeparture
        })
      } else {
        showError(data.error || 'Failed to cancel booking', 'Cancellation Failed')
      }
    } catch (error) {
      console.error('Error canceling booking:', error)
      showError('Please try again later', 'Cancellation Failed')
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
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200'
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
    <>
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
                  <span>
                    {/* Show passenger details */}
                    {booking.passengersList && booking.passengersList.length > 0 ? (
                      booking.passengersList.length === 1 ? (
                        `${booking.passengersList[0].name}`
                      ) : (
                        `${booking.passengersList[0].name} + ${booking.passengersList.length - 1} more`
                      )
                    ) : booking.passengerDetails ? (
                      booking.passengerDetails.name
                    ) : (
                      `${booking.passengers} passenger${booking.passengers > 1 ? 's' : ''}`
                    )}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t gap-2">
                <span className="text-sm text-muted-foreground">
                  Booked on {new Date(booking.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-lg sm:text-base">₹{booking.totalPrice}</span>
                  {booking.status === 'confirmed' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadTicket(booking)}
                        className="text-xs flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleCancelBooking(booking.bookingId)}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <CancellationPolicyModal
        isOpen={policyModal.isOpen}
        onClose={() => setPolicyModal({ isOpen: false, canCancel: false })}
        canCancel={policyModal.canCancel}
        hoursUntilDeparture={policyModal.hoursUntilDeparture}
      />
    </>
  )
}