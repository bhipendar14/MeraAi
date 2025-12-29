"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plane, Users, Search, Filter, Clock, ArrowRight } from "lucide-react"
import { validateFutureDate, validatePassengerCount, validateAdvanceBooking } from "@/lib/travel-validation"
import { DatePicker } from "@/components/ui/date-picker"

interface Airport {
    code: string
    name: string
    city: string
    country: string
}

interface Flight {
    id: string
    airline: string
    flightNumber: string
    from: string
    to: string
    departureTime: string
    arrivalTime: string
    duration: string
    price: number
    stops: number
    aircraft: string
}

interface FlightSearchProps {
    onBookFlight: (flight: Flight) => void
}

export function FlightSearch({ onBookFlight }: FlightSearchProps) {
    const [from, setFrom] = useState("")
    const [to, setTo] = useState("")
    const [date, setDate] = useState<Date>()
    const [passengers, setPassengers] = useState(1)
    const [fromSuggestions, setFromSuggestions] = useState<Airport[]>([])
    const [toSuggestions, setToSuggestions] = useState<Airport[]>([])
    const [flights, setFlights] = useState<Flight[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [error, setError] = useState("")
    const [showFilters, setShowFilters] = useState(false)
    const [priceFilter, setPriceFilter] = useState<number>(50000)
    const [stopsFilter, setStopsFilter] = useState<string>("all")

    // Calculate max date (1 year from now for flights)
    const today = new Date()
    const maxDate = new Date(today)
    maxDate.setFullYear(maxDate.getFullYear() + 1)
    const minDate = new Date(today)

    const searchAirports = async (query: string, type: 'from' | 'to') => {
        if (query.length < 2) {
            if (type === 'from') setFromSuggestions([])
            else setToSuggestions([])
            return
        }

        try {
            const response = await fetch(`/api/flights?action=airports&query=${encodeURIComponent(query)}`)
            const data = await response.json()

            if (type === 'from') {
                setFromSuggestions(data.airports || [])
            } else {
                setToSuggestions(data.airports || [])
            }
        } catch (error) {
            console.error('Error searching airports:', error)
        }
    }

    const handleSearch = async () => {
        setError("")

        // Validation
        if (!from || !to || !date) {
            setError("Please fill in all fields")
            return
        }

        const dateStr = date.toISOString().split('T')[0]
        const dateValidation = validateFutureDate(dateStr)
        if (!dateValidation.isValid) {
            setError(dateValidation.error || "Invalid date")
            return
        }

        // Validate advance booking (1 year for flights)
        const advanceValidation = validateAdvanceBooking(dateStr, 'flight')
        if (!advanceValidation.isValid) {
            setError(advanceValidation.error || "Booking too far in advance")
            return
        }

        const passengerValidation = validatePassengerCount(passengers)
        if (!passengerValidation.isValid) {
            setError(passengerValidation.error || "Invalid passenger count")
            return
        }

        setIsSearching(true)
        try {
            const response = await fetch(
                `/api/flights?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${dateStr}&passengers=${passengers}`
            )
            const data = await response.json()

            if (data.error) {
                setError(data.error)
                setFlights([])
            } else {
                setFlights(data.flights || [])
                if (data.flights?.length === 0) {
                    setError("No flights found for this route")
                }
            }
        } catch (error) {
            setError("Failed to search flights. Please try again.")
            console.error('Error searching flights:', error)
        } finally {
            setIsSearching(false)
        }
    }

    const filteredFlights = flights.filter(flight => {
        if (flight.price > priceFilter) return false
        if (stopsFilter === 'nonstop' && flight.stops > 0) return false
        if (stopsFilter === '1stop' && flight.stops !== 1) return false
        return true
    })

    return (
        <div className="space-y-4">
            {/* Search Form */}
            <Card className="border-border/60 bg-card/60 backdrop-blur">
                <CardContent className="p-4 sm:p-6">
                    <div className="grid gap-4">
                        {/* From/To Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* From */}
                            <div className="space-y-2 relative">
                                <Label htmlFor="from" className="text-sm font-medium">From</Label>
                                <div className="relative">
                                    <Plane className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="from"
                                        value={from}
                                        onChange={(e) => {
                                            setFrom(e.target.value)
                                            searchAirports(e.target.value, 'from')
                                        }}
                                        placeholder="City or airport code"
                                        className="pl-10"
                                    />
                                </div>
                                {fromSuggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
                                        {fromSuggestions.map((airport) => (
                                            <button
                                                key={airport.code}
                                                onClick={() => {
                                                    setFrom(airport.code)
                                                    setFromSuggestions([])
                                                }}
                                                className="w-full text-left px-3 py-2 hover:bg-muted/50 text-sm"
                                            >
                                                <div className="font-medium">{airport.city} ({airport.code})</div>
                                                <div className="text-xs text-muted-foreground">{airport.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* To */}
                            <div className="space-y-2 relative">
                                <Label htmlFor="to" className="text-sm font-medium">To</Label>
                                <div className="relative">
                                    <Plane className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rotate-90" />
                                    <Input
                                        id="to"
                                        value={to}
                                        onChange={(e) => {
                                            setTo(e.target.value)
                                            searchAirports(e.target.value, 'to')
                                        }}
                                        placeholder="City or airport code"
                                        className="pl-10"
                                    />
                                </div>
                                {toSuggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
                                        {toSuggestions.map((airport) => (
                                            <button
                                                key={airport.code}
                                                onClick={() => {
                                                    setTo(airport.code)
                                                    setToSuggestions([])
                                                }}
                                                className="w-full text-left px-3 py-2 hover:bg-muted/50 text-sm"
                                            >
                                                <div className="font-medium">{airport.city} ({airport.code})</div>
                                                <div className="text-xs text-muted-foreground">{airport.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Date/Passengers Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date" className="text-sm font-medium">Departure Date</Label>
                                <DatePicker
                                    id="date"
                                    value={date}
                                    onChange={(selectedDate) => setDate(selectedDate)}
                                    minDate={minDate}
                                    maxDate={maxDate}
                                    placeholder="Select departure date"
                                />
                                <p className="text-xs text-muted-foreground">Book up to 1 year in advance</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="passengers" className="text-sm font-medium">Passengers</Label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="passengers"
                                        type="number"
                                        min="1"
                                        max="9"
                                        value={passengers}
                                        onChange={(e) => setPassengers(parseInt(e.target.value) || 1)}
                                        className="pl-10"
                                    />
                                </div>
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
                                    Search Flights
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
            {flights.length > 0 && (
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
                                <span className="text-muted-foreground ml-2">({filteredFlights.length} flights)</span>
                                <span className="ml-auto text-xs text-muted-foreground">{showFilters ? '▼' : '▶'}</span>
                            </button>

                            {showFilters && (
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-border">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold flex items-center justify-between">
                                            <span>Max Price</span>
                                            <span className="text-primary">₹{priceFilter.toLocaleString()}</span>
                                        </Label>
                                        <input
                                            type="range"
                                            min="3000"
                                            max="50000"
                                            step="1000"
                                            value={priceFilter}
                                            onChange={(e) => setPriceFilter(parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>₹3,000</span>
                                            <span>₹50,000</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Stops</Label>
                                        <select
                                            value={stopsFilter}
                                            onChange={(e) => setStopsFilter(e.target.value)}
                                            className="w-full rounded-lg border-2 border-border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none"
                                        >
                                            <option value="all">All flights</option>
                                            <option value="nonstop">Non-stop only</option>
                                            <option value="1stop">1 stop max</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Flight Results */}
                    <div className="space-y-3">
                        {filteredFlights.map((flight, idx) => (
                            <Card
                                key={flight.id}
                                className="border-border/60 bg-card/60 backdrop-blur hover:bg-muted/30 transition-all animate-in slide-in-from-bottom duration-300"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <CardContent className="p-4">
                                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                                        {/* Flight Info */}
                                        <div className="flex-1 w-full lg:w-auto">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Plane className="h-6 w-6 text-primary" />
                                                <div>
                                                    <div className="font-semibold text-sm">{flight.airline}</div>
                                                    <div className="text-xs text-muted-foreground">{flight.flightNumber}</div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 items-center">
                                                <div>
                                                    <div className="text-lg font-bold">{flight.departureTime.split(' ')[1] || flight.departureTime}</div>
                                                    <div className="text-xs text-muted-foreground">{flight.from}</div>
                                                </div>

                                                <div className="text-center">
                                                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                                                        <Clock className="h-3 w-3" />
                                                        {flight.duration}
                                                    </div>
                                                    <div className="flex items-center justify-center">
                                                        <div className="h-px bg-border flex-1"></div>
                                                        <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />
                                                        <div className="h-px bg-border flex-1"></div>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className="text-lg font-bold">{flight.arrivalTime.split(' ')[1] || flight.arrivalTime}</div>
                                                    <div className="text-xs text-muted-foreground">{flight.to}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Price & Book */}
                                        <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 w-full lg:w-auto justify-between lg:justify-start">
                                            <div className="text-right">
                                                <div className="text-2xl font-bold">₹{flight.price.toLocaleString()}</div>
                                                <div className="text-xs text-muted-foreground">per person</div>
                                            </div>
                                            <Button
                                                onClick={() => onBookFlight(flight)}
                                                size="lg"
                                                className="w-full lg:w-auto"
                                            >
                                                Book Now
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
