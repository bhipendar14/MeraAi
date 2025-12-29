"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Sparkles, Star, TrendingUp, Plane, Building2, Train } from "lucide-react"

interface Destination {
    name: string
    country: string
    continent: string
    lat: number
    lng: number
    image?: string
    images?: Array<{ url: string; thumb: string; photographer: string; alt: string }>
    aiSummary?: string
    localTips?: string[]
    attractions?: Array<{ name: string; description: string; category: string }>
}

interface DestinationExplorerProps {
    onNavigateToFlights?: () => void
    onNavigateToHotels?: () => void
    onNavigateToTrains?: () => void
    selectedDestination?: Destination | null
}

export function DestinationExplorer({ onNavigateToFlights, onNavigateToHotels, onNavigateToTrains, selectedDestination: selectedDestinationProp }: DestinationExplorerProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [suggestions, setSuggestions] = useState<Destination[]>([])
    const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [popularDestinations, setPopularDestinations] = useState<Destination[]>([])
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Load popular destinations on mount
        fetchPopularDestinations()
    }, [])

    // Load destination when passed from tape
    useEffect(() => {
        if (selectedDestinationProp) {
            loadDestinationDetails(selectedDestinationProp)
        }
    }, [selectedDestinationProp])

    const fetchPopularDestinations = async () => {
        try {
            const response = await fetch('/api/destinations')
            const data = await response.json()
            setPopularDestinations(data.destinations || [])
        } catch (error) {
            console.error('Error fetching popular destinations:', error)
        }
    }

    const handleSearch = async (query: string) => {
        setSearchQuery(query)

        if (query.length < 2) {
            setSuggestions([])
            return
        }

        try {
            const response = await fetch(`/api/destinations?action=search&query=${encodeURIComponent(query)}`)
            const data = await response.json()
            setSuggestions(data.destinations || [])
        } catch (error) {
            console.error('Error searching destinations:', error)
        }
    }

    const loadDestinationDetails = async (destination: Destination) => {
        setIsLoading(true)
        setSuggestions([])
        setSearchQuery(destination.name)

        try {
            const response = await fetch(`/api/destinations?action=details&query=${encodeURIComponent(destination.name.toLowerCase())}`)
            const data = await response.json()
            setSelectedDestination(data.destination)
        } catch (error) {
            console.error('Error loading destination details:', error)
            setSelectedDestination(destination)
        } finally {
            setIsLoading(false)
        }
    }

    const isIndianDestination = selectedDestination?.country === 'India'

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <Card className="border-border/60 bg-card/60 backdrop-blur">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search destinations worldwide..."
                            className="pl-10 h-12 text-base"
                        />
                    </div>

                    {/* Search Suggestions */}
                    {suggestions.length > 0 && (
                        <div className="mt-2 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {suggestions.map((dest) => (
                                <button
                                    key={`${dest.name}-${dest.country}`}
                                    onClick={() => loadDestinationDetails(dest)}
                                    className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{dest.name}</div>
                                            <div className="text-sm text-muted-foreground truncate">{dest.country}, {dest.continent}</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Destination Details */}
            {isLoading && (
                <Card className="border-border/60 bg-card/60 backdrop-blur">
                    <CardContent className="p-8">
                        <div className="space-y-4">
                            <div className="h-64 bg-muted/30 rounded-lg animate-pulse" />
                            <div className="h-4 bg-muted/30 rounded animate-pulse w-3/4" />
                            <div className="h-4 bg-muted/30 rounded animate-pulse w-1/2" />
                        </div>
                    </CardContent>
                </Card>
            )}

            {selectedDestination && !isLoading && (
                <div className="space-y-4 animate-in fade-in duration-500">
                    {/* Hero Image */}
                    {selectedDestination.images && selectedDestination.images.length > 0 && (
                        <Card className="border-border/60 bg-card/60 backdrop-blur overflow-hidden">
                            <CardContent className="p-0">
                                <div className="relative h-64 sm:h-80 md:h-96">
                                    <img
                                        src={selectedDestination.images[0].url}
                                        alt={selectedDestination.images[0].alt}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                        <h1 className="text-3xl sm:text-4xl font-bold mb-2">{selectedDestination.name}</h1>
                                        <div className="flex items-center gap-2 text-sm sm:text-base">
                                            <MapPin className="h-4 w-4" />
                                            <span>{selectedDestination.country}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Booking CTAs */}
                    <Card className="border-border/60 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-4">
                            <h3 className="font-semibold mb-3 text-sm">Book Your Trip to {selectedDestination.name}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onNavigateToFlights}
                                    className="flex items-center gap-2 bg-white dark:bg-gray-900"
                                >
                                    <Plane className="h-4 w-4" />
                                    <span className="text-xs sm:text-sm">Flights</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onNavigateToHotels}
                                    className="flex items-center gap-2 bg-white dark:bg-gray-900"
                                >
                                    <Building2 className="h-4 w-4" />
                                    <span className="text-xs sm:text-sm">Hotels</span>
                                </Button>
                                {isIndianDestination && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onNavigateToTrains}
                                        className="flex items-center gap-2 bg-white dark:bg-gray-900 col-span-2 sm:col-span-1"
                                    >
                                        <Train className="h-4 w-4" />
                                        <span className="text-xs sm:text-sm">Trains & Buses</span>
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Summary */}
                    {selectedDestination.aiSummary && (
                        <Card className="border-border/60 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex items-start gap-3">
                                    <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">AI Travel Guide</h3>
                                        <p className="text-sm sm:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
                                            {selectedDestination.aiSummary}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Image Gallery */}
                    {selectedDestination.images && selectedDestination.images.length > 1 && (
                        <Card className="border-border/60 bg-card/60 backdrop-blur">
                            <CardContent className="p-4">
                                <h3 className="font-semibold mb-3">Explore {selectedDestination.name}</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                    {selectedDestination.images.slice(1).map((img, idx) => (
                                        <div key={idx} className="relative aspect-video overflow-hidden rounded-lg group">
                                            <img
                                                src={img.url}
                                                alt={img.alt}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Attractions */}
                    {selectedDestination.attractions && selectedDestination.attractions.length > 0 && (
                        <Card className="border-border/60 bg-card/60 backdrop-blur">
                            <CardContent className="p-4 sm:p-6">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <Star className="h-5 w-5 text-yellow-500" />
                                    Top Attractions
                                </h3>
                                <div className="grid gap-3">
                                    {selectedDestination.attractions.map((attraction, idx) => (
                                        <div
                                            key={idx}
                                            className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h4 className="font-medium text-sm sm:text-base">{attraction.name}</h4>
                                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded flex-shrink-0">
                                                    {attraction.category}
                                                </span>
                                            </div>
                                            <p className="text-xs sm:text-sm text-muted-foreground">{attraction.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Local Tips */}
                    {selectedDestination.localTips && selectedDestination.localTips.length > 0 && (
                        <Card className="border-border/60 bg-card/60 backdrop-blur">
                            <CardContent className="p-4 sm:p-6">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    Local Tips
                                </h3>
                                <ul className="space-y-2">
                                    {selectedDestination.localTips.map((tip, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm sm:text-base">
                                            <span className="text-green-600 dark:text-green-400 mt-1 flex-shrink-0">•</span>
                                            <span className="text-muted-foreground">{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Popular Destinations with Background Images */}
            {!selectedDestination && !isLoading && popularDestinations.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">Popular Destinations</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {popularDestinations.slice(0, 6).map((dest) => (
                            <Card
                                key={`${dest.name}-${dest.country}`}
                                className="border-border/60 bg-card/60 backdrop-blur hover:scale-105 transition-all cursor-pointer group overflow-hidden"
                                onClick={() => loadDestinationDetails(dest)}
                            >
                                <CardContent className="p-0">
                                    <div className="relative h-40">
                                        {dest.image && (
                                            <img
                                                src={dest.image}
                                                alt={dest.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                            <h4 className="font-bold text-lg mb-1">{dest.name}</h4>
                                            <p className="text-sm opacity-90 flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {dest.country}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
