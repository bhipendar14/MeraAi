"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Calendar, Search, Train, Bus, Clock, Sparkles, CreditCard, Star, Navigation } from "lucide-react"
import { gemini } from "@/lib/ai-gemini"
import { BookingModal } from "@/components/travel/booking-modal"
import { MyBookings } from "@/components/travel/my-bookings"
import { DestinationRecommendations } from "@/components/travel/destination-recommendations"
import { DebugInfo } from "@/components/travel/debug-info"
import { useAuth } from "@/contexts/auth-context"

type Result = {
  id: number;
  type: "Train" | "Bus";
  seats: number;
  depart: string;
  arrive: string;
  price: number;
  operator?: string;
  duration?: string;
}

type Place = {
  name: string
  description: string
  category: string
  rating: number
  lat: number
  lng: number
  image: string
  bestTimeToVisit: string
  estimatedDuration: string
}

type TravelRecommendation = {
  destination: string
  places: Place[]
  aiSummary: string
  localTips: string[]
}



export function TravelModule() {
  const { user } = useAuth()
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [date, setDate] = useState("")
  const [results, setResults] = useState<Result[] | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [recommendation, setRecommendation] = useState<TravelRecommendation | null>(null)
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false)
  const [isCalendarUnlocked, setIsCalendarUnlocked] = useState(false)
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean
    data: any
  }>({ isOpen: false, data: null })
  const [notification, setNotification] = useState<string | null>(null)

  const [fromSuggestions, setFromSuggestions] = useState<string[]>([])
  const [toSuggestions, setToSuggestions] = useState<string[]>([])

  const cities = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Rajkot",
    "Ahmedabad",
    "Pune",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Jaipur",
  ]

  const handleFromChange = (value: string) => {
    setFrom(value)
    if (value.length > 0) {
      setFromSuggestions(cities.filter((c) => c.toLowerCase().includes(value.toLowerCase())))
    } else {
      setFromSuggestions([])
    }
  }

  const handleToChange = (value: string) => {
    setTo(value)
    if (value.length > 0) {
      setToSuggestions(cities.filter((c) => c.toLowerCase().includes(value.toLowerCase())))
      fetchRecommendations(value)
    } else {
      setToSuggestions([])
      setRecommendation(null)
    }
  }

  const fetchRecommendations = async (destination: string) => {
    setIsLoadingRecommendation(true)
    try {
      const response = await fetch(`/api/travel/recommendations?destination=${encodeURIComponent(destination.toLowerCase())}`)
      if (response.ok) {
        const data = await response.json()
        setRecommendation(data.recommendation)
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setIsLoadingRecommendation(false)
    }
  }

  const unlockCalendar = () => {
    setIsCalendarUnlocked(true)
  }

  const onSearch = async () => {
    if (!from || !to || !date) return

    setIsSearching(true)
    // Simulate API call with more realistic data
    await new Promise((resolve) => setTimeout(resolve, 1200))

    const basePrice = Math.floor(Math.random() * 1000) + 500
    const selectedDate = new Date(date)
    const today = new Date()
    const isToday = selectedDate.toDateString() === today.toDateString()
    const currentTime = today.getHours() * 60 + today.getMinutes() // Current time in minutes

    // Generate all possible results
    const allResults: Result[] = [
      {
        id: 1,
        type: "Train" as const,
        seats: 12,
        depart: "08:40",
        arrive: "12:10",
        price: basePrice + 200,
        operator: "Indian Railways",
        duration: "3h 30m"
      },
      {
        id: 2,
        type: "Bus" as const,
        seats: 5,
        depart: "10:00",
        arrive: "14:30",
        price: Math.floor(basePrice * 0.6),
        operator: "RedBus",
        duration: "4h 30m"
      },
      {
        id: 3,
        type: "Train" as const,
        seats: 0,
        depart: "11:20",
        arrive: "14:50",
        price: basePrice + 300,
        operator: "Indian Railways",
        duration: "3h 30m"
      },
      {
        id: 4,
        type: "Bus" as const,
        seats: 18,
        depart: "13:15",
        arrive: "17:45",
        price: Math.floor(basePrice * 0.55),
        operator: "RedBus",
        duration: "4h 30m"
      },
      {
        id: 5,
        type: "Train" as const,
        seats: 8,
        depart: "15:30",
        arrive: "19:00",
        price: basePrice + 250,
        operator: "Indian Railways",
        duration: "3h 30m"
      },
      {
        id: 6,
        type: "Train" as const,
        seats: 15,
        depart: "18:45",
        arrive: "22:15",
        price: basePrice + 180,
        operator: "Indian Railways",
        duration: "3h 30m"
      },
      {
        id: 7,
        type: "Bus" as const,
        seats: 22,
        depart: "20:30",
        arrive: "01:00",
        price: Math.floor(basePrice * 0.7),
        operator: "RedBus",
        duration: "4h 30m"
      },
    ]

    // Filter out past departure times if booking for today
    const filteredResults = isToday
      ? allResults.filter(result => {
        const [hours, minutes] = result.depart.split(':').map(Number)
        const departureTime = hours * 60 + minutes
        return departureTime > currentTime + 30 // Add 30 minutes buffer
      })
      : allResults

    // Show notification if results were filtered
    if (isToday && filteredResults.length < allResults.length) {
      const filteredCount = allResults.length - filteredResults.length
      setNotification(`${filteredCount} departure${filteredCount > 1 ? 's' : ''} with past times were filtered out for today's booking.`)
      setTimeout(() => setNotification(null), 5000)
    }

    setResults(filteredResults)
    setIsSearching(false)
  }

  const handleBookNow = (result: Result) => {
    setBookingModal({
      isOpen: true,
      data: {
        type: result.type.toLowerCase(),
        from,
        to,
        date,
        price: result.price,
        details: {
          operator: result.operator,
          duration: result.duration,
          departureTime: result.depart,
          arrivalTime: result.arrive
        }
      }
    })
  }

  return (
    <>
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">Search & Book</TabsTrigger>
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-3">
            {/* Search Section */}
            <Card className="border-border/60 bg-card/60 backdrop-blur xl:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search Transportation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-3">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <input
                      value={from}
                      onChange={(e) => handleFromChange(e.target.value)}
                      placeholder="From"
                      className="w-full rounded-md border border-border/60 bg-muted/30 pl-10 pr-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="From"
                    />
                    {fromSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-20 max-h-40 overflow-y-auto">
                        {fromSuggestions.map((city) => (
                          <button
                            key={city}
                            onClick={() => {
                              setFrom(city)
                              setFromSuggestions([])
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-muted/50 text-sm"
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <input
                      value={to}
                      onChange={(e) => handleToChange(e.target.value)}
                      placeholder="To"
                      className="w-full rounded-md border border-border/60 bg-muted/30 pl-10 pr-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="To"
                    />
                    {toSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-20 max-h-40 overflow-y-auto">
                        {toSuggestions.map((city) => (
                          <button
                            key={city}
                            onClick={() => {
                              setTo(city)
                              setToSuggestions([])
                              fetchRecommendations(city)
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-muted/50 text-sm"
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    {!isCalendarUnlocked ? (
                      <button
                        onClick={unlockCalendar}
                        className="w-full rounded-md border border-border/60 bg-muted/30 pl-10 pr-3 py-2 text-left text-muted-foreground hover:bg-muted/50 transition-colors"
                      >
                        Click to select date
                      </button>
                    ) : (
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]} // Prevent past dates
                        className="w-full rounded-md border border-border/60 bg-background pl-10 pr-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring animate-in fade-in duration-300 text-foreground"
                        style={{ colorScheme: 'light dark' }} // Ensures calendar picker is visible in both themes
                        aria-label="Date"
                      />
                    )}
                  </div>
                </div>

                <Button
                  onClick={onSearch}
                  disabled={!from || !to || !date || isSearching}
                  className="w-full transition-all hover:shadow-[0_0_12px_hsl(var(--chart-2))]"
                >
                  {isSearching ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Searching...
                    </span>
                  ) : (
                    "Search Routes"
                  )}
                </Button>

                {results && results.length === 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-center">
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      ⚠️ No available routes found for the selected date and time.
                      {new Date(date).toDateString() === new Date().toDateString() && (
                        <div className="mt-1 text-xs">
                          Try selecting a future date or check back later for more options.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {notification && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 animate-in slide-in-from-top duration-300">
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      ℹ️ {notification}
                    </div>
                  </div>
                )}

                {results && (
                  <div className="space-y-2 pt-2 animate-in slide-in-from-bottom duration-500">
                    <div className="text-sm font-medium text-muted-foreground">
                      Found {results.length} routes from {from} to {to}
                      {new Date(date).toDateString() === new Date().toDateString() && (
                        <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">
                          (Past departure times filtered)
                        </span>
                      )}
                    </div>
                    <div className="grid gap-2">
                      {results.map((r, idx) => (
                        <div
                          key={r.id}
                          className="rounded-lg border border-border/60 bg-card/60 p-4 hover:bg-muted/30 transition-all hover:scale-[1.02] animate-in slide-in-from-left duration-300"
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted flex-shrink-0">
                                {r.type === "Train" ? (
                                  <Train className="h-5 w-5 text-chart-2" />
                                ) : (
                                  <Bus className="h-5 w-5 text-chart-3" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium truncate">{r.type} - {r.operator}</div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{r.depart} → {r.arrive} ({r.duration})</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2 w-full sm:w-auto">
                              <div className="flex-1 sm:flex-none">
                                <div className="text-sm font-semibold">₹{r.price}</div>
                                <div className="text-xs text-muted-foreground">
                                  {r.seats > 0 ? `${r.seats} seats` : "Waitlist"}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleBookNow(r)}
                                disabled={r.seats === 0}
                                className="text-xs px-3 py-1 flex-shrink-0"
                              >
                                {r.seats > 0 ? "Book Now" : "Waitlist"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 sm:flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent text-xs" asChild>
                        <a href="https://www.redbus.in" target="_blank" rel="noopener noreferrer">
                          RedBus
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent text-xs" asChild>
                        <a href="https://www.irctc.co.in" target="_blank" rel="noopener noreferrer">
                          IRCTC
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent text-xs" asChild>
                        <a href="https://www.makemytrip.com" target="_blank" rel="noopener noreferrer">
                          Flights
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent text-xs" asChild>
                        <a href="https://www.booking.com" target="_blank" rel="noopener noreferrer">
                          Hotels
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Places Section */}
            <Card className="border-border/60 bg-card/60 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-chart-2" />
                  {to ? `Places in ${to}` : "AI Recommendations"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendation?.aiSummary && (
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/60 text-sm text-muted-foreground leading-relaxed animate-in fade-in duration-500">
                    {recommendation.aiSummary}
                  </div>
                )}

                {recommendation?.localTips && recommendation.localTips.length > 0 && (
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-semibold mb-2 text-blue-800 dark:text-blue-200">Local Tips</h4>
                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      {recommendation.localTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {isLoadingRecommendation && (
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/60 space-y-2">
                    <div className="h-3 bg-muted/50 rounded animate-pulse" />
                    <div className="h-3 bg-muted/50 rounded animate-pulse w-5/6" />
                  </div>
                )}

                {!recommendation && !isLoadingRecommendation && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Enter a destination to see AI-powered recommendations
                  </div>
                )}

                {recommendation?.places.map((place, idx) => (
                  <button
                    key={place.name}
                    onClick={() => setSelectedPlace(place)}
                    className="w-full flex flex-col sm:flex-row gap-3 text-left hover:bg-muted/30 p-3 rounded-lg transition-all hover:scale-[1.02] animate-in slide-in-from-right duration-300"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <img
                      src={`https://images.unsplash.com/400x300/?${encodeURIComponent(place.image)}`}
                      alt={place.name}
                      className="w-full sm:w-24 h-32 sm:h-16 object-cover rounded-md border border-border/60"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = `https://via.placeholder.com/400x300/6366f1/white?text=${encodeURIComponent(place.name)}`
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <div className="text-sm font-medium truncate flex-1">{place.name}</div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-muted-foreground">{place.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2 mb-2">{place.description}</div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="bg-muted/50 px-2 py-0.5 rounded">{place.category}</span>
                        <span className="text-muted-foreground">{place.estimatedDuration}</span>
                        <span className="text-blue-600 dark:text-blue-400">{place.bestTimeToVisit}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Map Section */}
            <Card className="border-border/60 bg-card/60 backdrop-blur xl:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Popular Destinations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DestinationRecommendations />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bookings">
          <MyBookings />
        </TabsContent>
      </Tabs>

      <BookingModal
        isOpen={bookingModal.isOpen}
        onClose={() => setBookingModal({ isOpen: false, data: null })}
        bookingData={bookingModal.data}
      />
    </>
  )
}
