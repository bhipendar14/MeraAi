"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Users, Search, Star, MapPin, Check, X, Filter, Wifi, Coffee, Dumbbell } from "lucide-react"
import { validateFutureDate, validateDateRange, validateGuestCount, calculateNights, validateAdvanceBooking } from "@/lib/travel-validation"
import { DatePicker } from "@/components/ui/date-picker"

interface Hotel {
    id: string
    name: string
    rating: number
    reviewScore: number
    reviewCount: number
    pricePerNight: number
    totalPrice: number
    currency: string
    address: string
    distance: string
    amenities: string[]
    roomType: string
    checkIn: string
    checkOut: string
    nights: number
    guests: number
    images: Array<{ url: string; thumb: string; alt: string }>
    freeCancellation: boolean
    breakfast: boolean
}

interface HotelSearchProps {
    onBookHotel: (hotel: Hotel) => void
}

const amenityIcons: Record<string, any> = {
    'Free WiFi': Wifi,
    'Restaurant': Coffee,
    'Gym': Dumbbell,
}

export function HotelSearch({ onBookHotel }: HotelSearchProps) {
    const [destination, setDestination] = useState("")
    const [checkIn, setCheckIn] = useState<Date>()
    const [checkOut, setCheckOut] = useState<Date>()
    const [guests, setGuests] = useState(2)
    const [hotels, setHotels] = useState<Hotel[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [error, setError] = useState("")
    const [showFilters, setShowFilters] = useState(false)
    const [priceFilter, setPriceFilter] = useState<number>(20000)
    const [ratingFilter, setRatingFilter] = useState<number>(0)
    const [selectedHotel, setSelectedHotel] = useState<string | null>(null)

    // Calculate max date (1 year from now for hotels)
    const today = new Date()
    const maxDate = new Date(today)
    maxDate.setFullYear(maxDate.getFullYear() + 1)
    const minDate = new Date(today)

    const handleSearch = async () => {
        setError("")

        // Validation
        if (!destination || !checkIn || !checkOut) {
            setError("Please fill in all fields")
            return
        }

        const checkInStr = checkIn.toISOString().split('T')[0]
        const checkOutStr = checkOut.toISOString().split('T')[0]

        const checkInValidation = validateFutureDate(checkInStr)
        if (!checkInValidation.isValid) {
            setError(checkInValidation.error || "Invalid check-in date")
            return
        }

        // Validate advance booking (1 year for hotels)
        const advanceValidation = validateAdvanceBooking(checkInStr, 'hotel')
        if (!advanceValidation.isValid) {
            setError(advanceValidation.error || "Booking too far in advance")
            return
        }

        const dateRangeValidation = validateDateRange(checkInStr, checkOutStr)
        if (!dateRangeValidation.isValid) {
            setError(dateRangeValidation.error || "Invalid date range")
            return
        }

        const guestValidation = validateGuestCount(guests)
        if (!guestValidation.isValid) {
            setError(guestValidation.error || "Invalid guest count")
            return
        }

        setIsSearching(true)
        try {
            const response = await fetch(
                `/api/hotels?destination=${encodeURIComponent(destination)}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
            )
            const data = await response.json()

            if (data.error) {
                setError(data.error)
                setHotels([])
            } else {
                setHotels(data.hotels || [])
                if (data.hotels?.length === 0) {
                    setError("No hotels found for this destination")
                }
            }
        } catch (error) {
            setError("Failed to search hotels. Please try again.")
            console.error('Error searching hotels:', error)
        } finally {
            setIsSearching(false)
        }
    }

    const filteredHotels = hotels.filter(hotel => {
        if (hotel.pricePerNight > priceFilter) return false
        if (hotel.rating < ratingFilter) return false
        return true
    })

    return (
        <div className="space-y-4">
            {/* Search Form */}
            <Card className="border-border/60 bg-card/60 backdrop-blur">
                <CardContent className="p-4 sm:p-6">
                    <div className="grid gap-4">
                        {/* Destination */}
                        <div className="space-y-2">
                            <Label htmlFor="destination" className="text-sm font-medium">Destination</Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="destination"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    placeholder="Where are you going?"
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Check-in/Check-out Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="checkIn" className="text-sm font-medium">Check-in</Label>
                                <DatePicker
                                    id="checkIn"
                                    value={checkIn}
                                    onChange={(selectedDate) => setCheckIn(selectedDate)}
                                    minDate={minDate}
                                    maxDate={maxDate}
                                    placeholder="Select check-in date"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="checkOut" className="text-sm font-medium">Check-out</Label>
                                <DatePicker
                                    id="checkOut"
                                    value={checkOut}
                                    onChange={(selectedDate) => setCheckOut(selectedDate)}
                                    minDate={checkIn || minDate}
                                    maxDate={maxDate}
                                    placeholder="Select check-out date"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground -mt-2">Book up to 1 year in advance</p>

                        {/* Guests */}
                        <div className="space-y-2">
                            <Label htmlFor="guests" className="text-sm font-medium">Guests</Label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="guests"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={guests}
                                    onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Search Button */}
                        <Button
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="w-full sm:w-auto"
                            size="lg"
                        >
                            {isSearching ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <Search className="h-4 w-4 mr-2" />
                                    Search Hotels
                                </>
                            )}
                        </Button>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-800 dark:text-red-200">
                                {error}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            {hotels.length > 0 && (
                <>
                    {/* Filters - Enhanced UI */}
                    <Card className="border-2 border-primary/20 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-900/30">
                        <CardContent className="p-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 text-base font-semibold w-full sm:w-auto bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-lg transition-colors"
                            >
                                <Filter className="h-5 w-5 text-primary" />
                                <span className="text-primary">Filters</span>
                                <span className="text-muted-foreground ml-2">({filteredHotels.length} hotels)</span>
                                <span className="ml-auto text-xs text-muted-foreground">{showFilters ? '▼' : '▶'}</span>
                            </button>

                            {showFilters && (
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-border">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold flex items-center justify-between">
                                            <span>Max Price per Night</span>
                                            <span className="text-primary">₹{priceFilter.toLocaleString()}</span>
                                        </Label>
                                        <input
                                            type="range"
                                            min="1000"
                                            max="20000"
                                            step="500"
                                            value={priceFilter}
                                            onChange={(e) => setPriceFilter(parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>₹1,000</span>
                                            <span>₹20,000</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Minimum Rating</Label>
                                        <select
                                            value={ratingFilter}
                                            onChange={(e) => setRatingFilter(parseFloat(e.target.value))}
                                            className="w-full rounded-lg border-2 border-border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none"
                                        >
                                            <option value="0">Any rating</option>
                                            <option value="3">3+ stars</option>
                                            <option value="4">4+ stars</option>
                                            <option value="4.5">4.5+ stars</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Hotel Results */}
                    <div className="space-y-4">
                        {filteredHotels.map((hotel, idx) => (
                            <Card
                                key={hotel.id}
                                className="border-border/60 bg-card/60 backdrop-blur hover:bg-muted/30 transition-all animate-in slide-in-from-bottom duration-300 overflow-hidden"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row">
                                        {/* Hotel Image */}
                                        <div className="md:w-1/3 relative">
                                            {hotel.images.length > 0 ? (
                                                <div className="relative h-48 md:h-full">
                                                    <img
                                                        src={hotel.images[0].url}
                                                        alt={hotel.images[0].alt}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {hotel.images.length > 1 && (
                                                        <button
                                                            onClick={() => setSelectedHotel(selectedHotel === hotel.id ? null : hotel.id)}
                                                            className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded"
                                                        >
                                                            +{hotel.images.length - 1} photos
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="h-48 md:h-full bg-muted flex items-center justify-center">
                                                    <Building2 className="h-12 w-12 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Hotel Details */}
                                        <div className="md:w-2/3 p-4 flex flex-col">
                                            <div className="flex-1">
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-lg mb-1">{hotel.name}</h3>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="flex items-center">
                                                                {Array.from({ length: 5 }).map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`h-3 w-3 ${i < Math.floor(hotel.rating)
                                                                            ? 'fill-yellow-400 text-yellow-400'
                                                                            : 'text-gray-300'
                                                                            }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-sm font-semibold">{hotel.rating}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-start sm:items-end">
                                                        <div className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-bold">
                                                            {hotel.reviewScore}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            {hotel.reviewCount} reviews
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                                                    <MapPin className="h-3 w-3" />
                                                    <span className="text-xs">{hotel.distance}</span>
                                                </div>

                                                {/* Amenities */}
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {hotel.amenities.slice(0, 4).map((amenity) => (
                                                        <span
                                                            key={amenity}
                                                            className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-1"
                                                        >
                                                            {amenity}
                                                        </span>
                                                    ))}
                                                    {hotel.amenities.length > 4 && (
                                                        <span className="text-xs text-muted-foreground">
                                                            +{hotel.amenities.length - 4} more
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Features */}
                                                <div className="flex flex-wrap gap-3 text-xs mb-3">
                                                    {hotel.freeCancellation && (
                                                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                            <Check className="h-3 w-3" />
                                                            Free cancellation
                                                        </div>
                                                    )}
                                                    {hotel.breakfast && (
                                                        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                                            <Check className="h-3 w-3" />
                                                            Breakfast included
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="text-xs text-muted-foreground">
                                                    {hotel.roomType} • {hotel.nights} night{hotel.nights > 1 ? 's' : ''}
                                                </div>
                                            </div>

                                            {/* Price & Book */}
                                            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mt-4 pt-4 border-t">
                                                <div>
                                                    <div className="text-xs text-muted-foreground">Total price</div>
                                                    <div className="text-2xl font-bold">₹{hotel.totalPrice.toLocaleString()}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        ₹{hotel.pricePerNight.toLocaleString()} per night
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={() => onBookHotel(hotel)}
                                                    size="lg"
                                                    className="w-full sm:w-auto"
                                                >
                                                    Reserve
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Image Gallery */}
                                    {selectedHotel === hotel.id && hotel.images.length > 1 && (
                                        <div className="border-t p-4 bg-muted/20">
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                                {hotel.images.slice(1).map((img, i) => (
                                                    <img
                                                        key={i}
                                                        src={img.thumb}
                                                        alt={img.alt}
                                                        className="w-full h-24 object-cover rounded"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
