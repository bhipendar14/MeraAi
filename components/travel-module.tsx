"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plane, Building2, Train, MapPin, CreditCard } from "lucide-react"
import { FlightSearch } from "@/components/travel/flight-search"
import { HotelSearch } from "@/components/travel/hotel-search"
import { DestinationExplorer } from "@/components/travel/destination-explorer"
import { BookingModal } from "@/components/travel/booking-modal"
import { MyBookings } from "@/components/travel/my-bookings"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { Calendar, Search, Bus, Clock, Users } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { validateAdvanceBooking } from "@/lib/travel-validation"

type Result = {
  id: number
  type: "Train" | "Bus"
  seats: number
  depart: string
  arrive: string
  price: number
  operator?: string
  duration?: string
}

export function TravelModule() {
  const { user } = useAuth()
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean
    data: any
  }>({ isOpen: false, data: null })

  // Train/Bus search state
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [date, setDate] = useState<Date>()
  const [passengerCount, setPassengerCount] = useState(1) // Track passenger count
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([])
  const [toSuggestions, setToSuggestions] = useState<string[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)
  const [isCalendarUnlocked, setIsCalendarUnlocked] = useState(false)
  const [popularDestinations, setPopularDestinations] = useState<any[]>([])
  const [searchError, setSearchError] = useState("")
  const [activeTab, setActiveTab] = useState("destinations")
  const [selectedDestinationFromTape, setSelectedDestinationFromTape] = useState<any>(null)

  // Calculate max date (2 months from now for trains/buses)
  const today = new Date()
  const maxDateTrains = new Date(today)
  maxDateTrains.setMonth(maxDateTrains.getMonth() + 2)
  const minDate = new Date(today)

  const cities = [
    "Mumbai", "Delhi", "Bangalore", "Rajkot", "Ahmedabad",
    "Pune", "Hyderabad", "Chennai", "Kolkata", "Jaipur",
  ]

  // Load popular destinations for scrolling tape
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch('/api/destinations')
        const data = await response.json()
        setPopularDestinations(data.destinations || [])
      } catch (error) {
        console.error('Error fetching destinations:', error)
      }
    }
    fetchDestinations()
  }, [])

  const unlockCalendar = () => {
    setIsCalendarUnlocked(true)
    setSearchError("")
  }

  const handleFromChange = (value: string) => {
    setFrom(value)
    if (value.length > 0) {
      const matches = cities.filter(city =>
        city.toLowerCase().includes(value.toLowerCase())
      )
      setFromSuggestions(matches)
    } else {
      setFromSuggestions([])
    }
    // Unlock calendar if both cities are selected
    if (value && to) {
      unlockCalendar()
    }
  }

  const handleToChange = (value: string) => {
    setTo(value)
    if (value.length > 0) {
      const matches = cities.filter(city =>
        city.toLowerCase().includes(value.toLowerCase())
      )
      setToSuggestions(matches)
    } else {
      setToSuggestions([])
    }
    // Unlock calendar if both cities are selected
    if (from && value) {
      unlockCalendar()
    }
  }

  const onSearch = async () => {
    if (!from || !to || !date) {
      setSearchError("Please fill in all fields")
      return
    }

    const dateStr = date.toISOString().split('T')[0]

    // Validate advance booking (2 months for trains/buses)
    const advanceValidation = validateAdvanceBooking(dateStr, 'train')
    if (!advanceValidation.isValid) {
      setSearchError(advanceValidation.error || "Booking too far in advance")
      return
    }

    setSearchError("")
    setIsSearching(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))

    const basePrice = Math.floor(Math.random() * 1000) + 500
    const selectedDate = new Date(date)
    const today = new Date()
    const isToday = selectedDate.toDateString() === today.toDateString()
    const currentTime = today.getHours() * 60 + today.getMinutes()

    const allResults: Result[] = [
      { id: 1, type: "Train" as const, seats: 12, depart: "08:40", arrive: "12:10", price: basePrice + 200, operator: "Indian Railways", duration: "3h 30m" },
      { id: 2, type: "Bus" as const, seats: 5, depart: "10:00", arrive: "14:30", price: Math.floor(basePrice * 0.6), operator: "RedBus", duration: "4h 30m" },
      { id: 3, type: "Train" as const, seats: 0, depart: "11:20", arrive: "14:50", price: basePrice + 300, operator: "Indian Railways", duration: "3h 30m" },
      { id: 4, type: "Bus" as const, seats: 18, depart: "13:15", arrive: "17:45", price: Math.floor(basePrice * 0.55), operator: "RedBus", duration: "4h 30m" },
      { id: 5, type: "Train" as const, seats: 8, depart: "15:30", arrive: "19:00", price: basePrice + 250, operator: "Indian Railways", duration: "3h 30m" },
      { id: 6, type: "Train" as const, seats: 15, depart: "18:45", arrive: "22:15", price: basePrice + 180, operator: "Indian Railways", duration: "3h 30m" },
      { id: 7, type: "Bus" as const, seats: 22, depart: "20:30", arrive: "01:00", price: Math.floor(basePrice * 0.7), operator: "RedBus", duration: "4h 30m" },
    ]

    const filteredResults = isToday
      ? allResults.filter(result => {
        const [hours, minutes] = result.depart.split(':').map(Number)
        const departureTime = hours * 60 + minutes
        return departureTime > currentTime + 30
      })
      : allResults

    setResults(filteredResults)
    setIsSearching(false)
  }

  const handleBookNow = (result: Result) => {
    if (!user) {
      alert("Please sign in to book tickets")
      return
    }

    setBookingModal({
      isOpen: true,
      data: {
        type: result.type,
        from,
        to,
        date: date?.toLocaleDateString() || '',
        price: result.price,
        passengerCount, // Pass passenger count
        details: {
          operator: result.operator,
          departure: result.depart,
          arrival: result.arrive,
          duration: result.duration,
        },
      },
    })
  }

  const handleBookFlight = (flight: any) => {
    if (!user) {
      alert("Please sign in to book flights")
      return
    }

    setBookingModal({
      isOpen: true,
      data: {
        type: 'flight',
        from: flight.from,
        to: flight.to,
        date: flight.departureTime.split(' ')[0],
        price: flight.price,
        details: {
          airline: flight.airline,
          flightNumber: flight.flightNumber,
          departure: flight.departureTime,
          arrival: flight.arrivalTime,
          duration: flight.duration,
          stops: flight.stops,
        },
      },
    })
  }

  const handleBookHotel = (hotel: any) => {
    if (!user) {
      alert("Please sign in to book hotels")
      return
    }

    setBookingModal({
      isOpen: true,
      data: {
        type: 'hotel',
        from: hotel.address,
        to: hotel.name,
        date: typeof hotel.checkIn === 'string' ? hotel.checkIn : hotel.checkIn?.toLocaleDateString() || '',
        price: hotel.totalPrice,
        details: {
          hotelName: hotel.name,
          checkIn: hotel.checkIn,
          checkOut: hotel.checkOut,
          nights: hotel.nights,
          guests: hotel.guests,
          roomType: hotel.roomType,
          rating: hotel.rating,
        },
      },
    })
  }

  const handleDestinationClick = (dest: any) => {
    // Navigate to destinations tab and pass the selected destination
    setActiveTab("destinations")
    setSelectedDestinationFromTape(dest)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Travel & Booking</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Search transportation, discover destinations, and book your next journey with AI-powered recommendations.
          </p>
        </div>

        {/* Scrolling Tape - Now at the top, visible on all tabs */}
        {popularDestinations.length > 0 && (
          <div className="mb-6 overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-900/20 rounded-lg py-4">
            <div className="flex animate-scroll gap-6">
              {/* Duplicate the array for seamless loop */}
              {[...popularDestinations, ...popularDestinations].map((dest, idx) => (
                <button
                  key={`scroll-${idx}`}
                  onClick={() => handleDestinationClick(dest)}
                  className="flex-shrink-0 flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-900 rounded-full hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    {dest.image && (
                      <img
                        src={dest.image}
                        alt={dest.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">{dest.name}</div>
                    <div className="text-xs text-muted-foreground">{dest.country}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .animate-scroll {
            animation: scroll 60s linear infinite;
          }
          .animate-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 gap-1 h-auto p-1">
            <TabsTrigger value="destinations" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Destinations</span>
              <span className="sm:hidden">Places</span>
            </TabsTrigger>
            <TabsTrigger value="flights" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <Plane className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Flights</span>
            </TabsTrigger>
            <TabsTrigger value="hotels" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Hotels</span>
            </TabsTrigger>
            <TabsTrigger value="trains" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <Train className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden lg:inline">Trains & Buses</span>
              <span className="lg:hidden">Train/Bus</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">My Bookings</span>
              <span className="sm:hidden">Bookings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="destinations" className="mt-4 sm:mt-6">
            <DestinationExplorer
              selectedDestination={selectedDestinationFromTape}
              onNavigateToFlights={() => setActiveTab("flights")}
              onNavigateToHotels={() => setActiveTab("hotels")}
              onNavigateToTrains={() => setActiveTab("trains")}
            />
          </TabsContent>

          <TabsContent value="flights" className="mt-4 sm:mt-6">
            <FlightSearch onBookFlight={handleBookFlight} />
          </TabsContent>

          <TabsContent value="hotels" className="mt-4 sm:mt-6">
            <HotelSearch onBookHotel={handleBookHotel} />
          </TabsContent>

          <TabsContent value="trains" className="mt-4 sm:mt-6">
            <Card className="border-border/60 bg-card/60 backdrop-blur">
              <CardContent className="p-4 sm:p-6">
                <div className="grid gap-4">
                  {/* From/To Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* From */}
                    <div className="space-y-2 relative">
                      <Label htmlFor="train-from" className="text-sm font-medium">From</Label>
                      <div className="relative">
                        <Train className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="train-from"
                          value={from}
                          onChange={(e) => handleFromChange(e.target.value)}
                          placeholder="Enter city"
                          className="pl-10"
                        />
                      </div>
                      {fromSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
                          {fromSuggestions.map((city) => (
                            <button
                              key={city}
                              onClick={() => {
                                setFrom(city)
                                setFromSuggestions([])
                                unlockCalendar()
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-muted/50 text-sm"
                            >
                              {city}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* To */}
                    <div className="space-y-2 relative">
                      <Label htmlFor="train-to" className="text-sm font-medium">To</Label>
                      <div className="relative">
                        <Train className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rotate-90" />
                        <Input
                          id="train-to"
                          value={to}
                          onChange={(e) => handleToChange(e.target.value)}
                          placeholder="Enter city"
                          className="pl-10"
                        />
                      </div>
                      {toSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
                          {toSuggestions.map((city) => (
                            <button
                              key={city}
                              onClick={() => {
                                setTo(city)
                                setToSuggestions([])
                                unlockCalendar()
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-muted/50 text-sm"
                            >
                              {city}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date/Passengers Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="train-date" className="text-sm font-medium">Travel Date</Label>
                      <DatePicker
                        id="train-date"
                        value={date}
                        onChange={(selectedDate) => setDate(selectedDate)}
                        minDate={minDate}
                        maxDate={maxDateTrains}
                        disabled={!isCalendarUnlocked}
                        placeholder="Select travel date"
                      />
                      <p className="text-xs text-muted-foreground">Book up to 2 months in advance</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="train-passengers" className="text-sm font-medium">Passengers</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="train-passengers"
                          type="number"
                          min="1"
                          max="9"
                          value={passengerCount}
                          onChange={(e) => setPassengerCount(Math.max(1, Math.min(9, parseInt(e.target.value) || 1)))}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Search Button */}
                  <Button
                    onClick={onSearch}
                    disabled={isSearching || !from || !to || !date}
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
                        Search Routes
                      </>
                    )}
                  </Button>

                  {searchError && (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-800 rounded-lg p-3 text-sm text-red-800 dark:text-red-200">
                      {searchError}
                    </div>
                  )}
                </div>
              </CardContent>

              {results && results.length > 0 && (
                <div className="space-y-3 mt-4">
                  {results.map((result) => (
                    <Card key={result.id} className="border-border/60 bg-card/60 backdrop-blur">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`p-2 rounded-lg ${result.type === 'Train' ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-green-100 dark:bg-green-900/20'}`}>
                              {result.type === 'Train' ? (
                                <Train className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              ) : (
                                <Bus className="h-5 w-5 text-green-600 dark:text-green-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">{result.operator}</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${result.seats > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                                  {result.seats > 0 ? `${result.seats} seats` : 'Sold out'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{result.depart} - {result.arrive}</span>
                                <span>•</span>
                                <span>{result.duration}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="text-right flex-1 sm:flex-initial">
                              <div className="text-2xl font-bold">₹{result.price}</div>
                              <div className="text-xs text-muted-foreground">per person</div>
                            </div>
                            <Button
                              onClick={() => handleBookNow(result)}
                              disabled={result.seats === 0}
                              className="w-full sm:w-auto"
                            >
                              Book Now
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {results && results.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No routes available for the selected date and time.
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="mt-4 sm:mt-6">
            <MyBookings />
          </TabsContent>
        </Tabs>

        {notification && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-bottom">
            {notification}
          </div>
        )}

        <BookingModal
          isOpen={bookingModal.isOpen}
          onClose={() => setBookingModal({ isOpen: false, data: null })}
          bookingData={bookingModal.data}
        />
      </div>
    </div>
  )
}
