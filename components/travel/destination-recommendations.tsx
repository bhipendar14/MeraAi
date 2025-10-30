"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Clock, ArrowRight, Heart } from "lucide-react"

interface Destination {
  id: string
  name: string
  state: string
  description: string
  image: string
  rating: number
  bestTime: string
  duration: string
  highlights: string[]
  price: string
}

const POPULAR_DESTINATIONS: Destination[] = [
  {
    id: "goa",
    name: "Goa",
    state: "Goa",
    description: "Beautiful beaches, vibrant nightlife, and Portuguese heritage make Goa a perfect tropical getaway.",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop",
    rating: 4.6,
    bestTime: "Nov-Feb",
    duration: "3-5 days",
    highlights: ["Beaches", "Nightlife", "Water Sports", "Heritage"],
    price: "₹15,000"
  },
  {
    id: "mumbai",
    name: "Mumbai",
    state: "Maharashtra", 
    description: "The city of dreams offers Bollywood glamour, street food, and the iconic Gateway of India.",
    image: "https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800&h=600&fit=crop",
    rating: 4.4,
    bestTime: "Oct-Mar",
    duration: "2-4 days",
    highlights: ["Bollywood", "Street Food", "Marine Drive", "Shopping"],
    price: "₹12,000"
  },
  {
    id: "rajasthan",
    name: "Rajasthan",
    state: "Rajasthan",
    description: "Land of kings with majestic palaces, desert safaris, and rich cultural heritage.",
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&h=600&fit=crop",
    rating: 4.7,
    bestTime: "Oct-Mar",
    duration: "5-7 days",
    highlights: ["Palaces", "Desert Safari", "Culture", "Architecture"],
    price: "₹20,000"
  },
  {
    id: "kerala",
    name: "Kerala",
    state: "Kerala",
    description: "God's own country with backwaters, hill stations, and lush green landscapes.",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=600&fit=crop",
    rating: 4.8,
    bestTime: "Sep-Mar",
    duration: "4-6 days",
    highlights: ["Backwaters", "Hill Stations", "Ayurveda", "Wildlife"],
    price: "₹18,000"
  },
  {
    id: "himachal",
    name: "Himachal Pradesh",
    state: "Himachal Pradesh",
    description: "Mountain paradise with snow-capped peaks, adventure sports, and serene valleys.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    rating: 4.5,
    bestTime: "Mar-Jun, Sep-Nov",
    duration: "4-7 days",
    highlights: ["Mountains", "Adventure", "Trekking", "Snow"],
    price: "₹16,000"
  },
  {
    id: "kashmir",
    name: "Kashmir",
    state: "Jammu & Kashmir",
    description: "Paradise on earth with pristine lakes, houseboats, and breathtaking mountain views.",
    image: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800&h=600&fit=crop",
    rating: 4.9,
    bestTime: "Apr-Oct",
    duration: "5-8 days",
    highlights: ["Dal Lake", "Houseboats", "Gardens", "Skiing"],
    price: "₹25,000"
  },
  {
    id: "agra",
    name: "Agra",
    state: "Uttar Pradesh",
    description: "Home to the magnificent Taj Mahal and other Mughal architectural wonders.",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=600&fit=crop",
    rating: 4.3,
    bestTime: "Oct-Mar",
    duration: "1-2 days",
    highlights: ["Taj Mahal", "Red Fort", "History", "Architecture"],
    price: "₹8,000"
  },
  {
    id: "rishikesh",
    name: "Rishikesh",
    state: "Uttarakhand",
    description: "Yoga capital of the world with spiritual vibes, river rafting, and mountain views.",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop",
    rating: 4.4,
    bestTime: "Feb-May, Sep-Nov",
    duration: "2-4 days",
    highlights: ["Yoga", "River Rafting", "Temples", "Adventure"],
    price: "₹10,000"
  },
  {
    id: "andaman",
    name: "Andaman Islands",
    state: "Andaman & Nicobar",
    description: "Tropical paradise with crystal clear waters, coral reefs, and pristine beaches.",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
    rating: 4.7,
    bestTime: "Oct-May",
    duration: "5-7 days",
    highlights: ["Beaches", "Scuba Diving", "Water Sports", "Islands"],
    price: "₹30,000"
  }
]

export function DestinationRecommendations() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [favorites, setFavorites] = useState<string[]>([])

  // Auto-rotate destinations every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % POPULAR_DESTINATIONS.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    )
  }

  const currentDestination = POPULAR_DESTINATIONS[currentIndex]

  return (
    <div className="space-y-6">
      {/* Featured Destination Card */}
      <Card className="overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-0">
          <div className="relative">
            <img
              src={currentDestination.image}
              alt={currentDestination.name}
              className="w-full h-64 object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = `https://via.placeholder.com/800x600/3b82f6/white?text=${encodeURIComponent(currentDestination.name)}`
              }}
            />
            <div className="absolute top-4 right-4">
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full w-10 h-10 p-0 bg-white/90 hover:bg-white"
                onClick={() => toggleFavorite(currentDestination.id)}
              >
                <Heart 
                  className={`h-4 w-4 ${favorites.includes(currentDestination.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                />
              </Button>
            </div>
            <div className="absolute bottom-4 left-4">
              <Badge variant="secondary" className="bg-white/90 text-gray-800">
                Featured Destination
              </Badge>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentDestination.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {currentDestination.state}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{currentDestination.rating}</span>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {currentDestination.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {currentDestination.highlights.map((highlight) => (
                <Badge key={highlight} variant="outline" className="text-xs">
                  {highlight}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4 text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{currentDestination.duration}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Best time: </span>
                  <span className="font-medium">{currentDestination.bestTime}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Starting from</div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {currentDestination.price}
                </div>
              </div>
            </div>

            <Button className="w-full" size="lg">
              <span>Explore {currentDestination.name}</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Destination Indicators */}
      <div className="flex justify-center gap-2">
        {POPULAR_DESTINATIONS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex 
                ? 'bg-blue-500 w-6' 
                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* Quick Destinations Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {POPULAR_DESTINATIONS.slice(0, 6).map((destination) => (
          <Card 
            key={destination.id} 
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setCurrentIndex(POPULAR_DESTINATIONS.findIndex(d => d.id === destination.id))}
          >
            <CardContent className="p-0">
              <img
                src={destination.image}
                alt={destination.name}
                className="w-full h-24 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = `https://via.placeholder.com/400x200/3b82f6/white?text=${encodeURIComponent(destination.name)}`
                }}
              />
              <div className="p-3">
                <div className="font-semibold text-sm truncate">{destination.name}</div>
                <div className="text-xs text-muted-foreground">{destination.price}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}