"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/contexts/auth-context'
import { Loader2, Package, User, Mail, Phone, Calendar, DollarSign, Trash2, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Booking {
    id: string
    bookingId: string
    type: 'train' | 'bus' | 'flight' | 'hotel'
    from: string
    to: string
    departureDate: string
    returnDate?: string
    passengers: number
    status: 'confirmed' | 'pending' | 'cancelled'
    totalPrice: number
    createdAt: string
    passengerDetails?: {
        name: string
        email: string
        phone: string
        age: number
    }
    passengersList?: Array<{
        name: string
        email: string
        phone: string
        age: number
    }>
}

export function BookingsTable() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
    const [error, setError] = useState('')
    const { token } = useAuth()

    const fetchBookings = async () => {
        try {
            const response = await fetch('/api/admin/bookings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setBookings(data.bookings)
            } else {
                const data = await response.json()
                setError(data.error)
            }
        } catch (error) {
            setError('Failed to fetch bookings')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBookings()
    }, [token])

    const handleDeleteBooking = async (bookingId: string) => {
        if (!confirm('Are you sure you want to delete this booking?')) return

        setDeleteLoading(bookingId)
        try {
            const response = await fetch(`/api/admin/bookings?bookingId=${bookingId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                setBookings(prev => prev.filter(b => b.id !== bookingId))
            } else {
                const data = await response.json()
                alert('Failed to delete booking: ' + data.error)
            }
        } catch (error) {
            alert('Failed to delete booking')
        } finally {
            setDeleteLoading(null)
        }
    }

    const handleClearAll = async () => {
        if (!confirm('⚠️ WARNING: This will permanently delete ALL bookings. This action cannot be undone. Are you sure?')) return

        setLoading(true)
        try {
            const response = await fetch('/api/admin/bookings?clearAll=true', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                setBookings([])
            } else {
                const data = await response.json()
                alert('Failed to clear bookings: ' + data.error)
            }
        } catch (error) {
            alert('Failed to clear bookings')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Card className="border-border/60 bg-card/60 backdrop-blur">
                <CardContent className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Loading bookings...</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-500/10 text-green-500 border-green-500/20'
            case 'pending':
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            case 'cancelled':
                return 'bg-red-500/10 text-red-500 border-red-500/20'
            default:
                return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'flight':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            case 'train':
                return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
            case 'bus':
                return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
            case 'hotel':
                return 'bg-pink-500/10 text-pink-500 border-pink-500/20'
            default:
                return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
        }
    }

    return (
        <Card className="border-border/60 bg-card/60 backdrop-blur">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        All User Bookings ({bookings.length})
                    </CardTitle>
                    {bookings.length > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleClearAll}
                            className="flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear All
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm mb-4">
                        {error}
                    </div>
                )}

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Booking ID</TableHead>
                                <TableHead>User Details</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Route</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Passengers</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bookings.map((booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell className="font-mono font-medium text-sm">{booking.bookingId}</TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            {(() => {
                                                // Get passenger list (handle both old and new formats)
                                                const passengers = booking.passengersList ||
                                                    (booking.passengerDetails ? [booking.passengerDetails] : [])
                                                const primaryPassenger = passengers[0]

                                                if (!primaryPassenger) {
                                                    return <span className="text-muted-foreground">N/A</span>
                                                }

                                                return (
                                                    <>
                                                        <div className="flex items-center gap-2">
                                                            <User className="w-3 h-3 text-muted-foreground" />
                                                            <span className="font-medium text-sm">
                                                                {primaryPassenger.name}
                                                                {passengers.length > 1 && (
                                                                    <span className="text-xs text-muted-foreground ml-1">
                                                                        + {passengers.length - 1} more
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="w-3 h-3 text-muted-foreground" />
                                                            <span className="text-xs text-muted-foreground">
                                                                {primaryPassenger.email || 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="w-3 h-3 text-muted-foreground" />
                                                            <span className="text-xs text-muted-foreground">
                                                                {primaryPassenger.phone || 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-muted-foreground">
                                                                Age: {primaryPassenger.age || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </>
                                                )
                                            })()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getTypeColor(booking.type)}>
                                            {booking.type.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div>{booking.from}</div>
                                            <div className="text-muted-foreground">↓</div>
                                            <div>{booking.to}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm">
                                            <Calendar className="w-3 h-3 text-muted-foreground" />
                                            {new Date(booking.departureDate).toLocaleDateString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>{booking.passengers}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 font-medium">
                                            <DollarSign className="w-3 h-3" />
                                            {booking.totalPrice.toFixed(2)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(booking.status)}>
                                            {booking.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(booking.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteBooking(booking.id)}
                                            disabled={deleteLoading === booking.id}
                                            className="hover:bg-red-500/10 hover:text-red-500"
                                        >
                                            {deleteLoading === booking.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {bookings.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No bookings found</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
