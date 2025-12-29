"use client"

import { useEffect, useState } from "react"
import { Cloud, CloudRain, CloudSnow, Sun, CloudDrizzle, Wind, CloudLightning, Moon } from "lucide-react"

interface WeatherData {
    temperature: {
        celsius: number
        fahrenheit: number
    }
    condition: string
    description: string
    icon: string
    city: string
    country: string
}

// Map weather conditions to icons
const getWeatherIcon = (condition: string, iconCode: string) => {
    const isNight = iconCode?.endsWith("n") || false

    switch (condition?.toLowerCase()) {
        case "clear":
            return isNight ? <Moon className="w-8 h-8 text-blue-200" /> : <Sun className="w-8 h-8 text-yellow-400" />
        case "clouds":
            return <Cloud className="w-8 h-8 text-gray-400" />
        case "rain":
            return <CloudRain className="w-8 h-8 text-blue-400" />
        case "drizzle":
            return <CloudDrizzle className="w-8 h-8 text-blue-300" />
        case "snow":
            return <CloudSnow className="w-8 h-8 text-blue-200" />
        case "thunderstorm":
            return <CloudLightning className="w-8 h-8 text-purple-400" />
        case "mist":
        case "fog":
        case "haze":
            return <Wind className="w-8 h-8 text-gray-300" />
        default:
            return <Cloud className="w-8 h-8 text-gray-400" />
    }
}

// Get time-based greeting
const getGreeting = () => {
    const hour = new Date().getHours()

    if (hour >= 5 && hour < 12) {
        return "Good Morning"
    } else if (hour >= 12 && hour < 17) {
        return "Good Afternoon"
    } else {
        return "Good Evening"
    }
}

export function WeatherDisplay() {
    const [weather, setWeather] = useState<WeatherData | null>(null)
    const [loading, setLoading] = useState(true)
    const [greeting, setGreeting] = useState(getGreeting())

    useEffect(() => {
        // Update greeting every minute
        const interval = setInterval(() => {
            setGreeting(getGreeting())
        }, 60000)

        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // Try to get user's location
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            const { latitude, longitude } = position.coords
                            const response = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`)
                            const data = await response.json()
                            setWeather(data)
                            setLoading(false)
                        },
                        async () => {
                            // Fallback to default city if geolocation fails
                            const response = await fetch("/api/weather")
                            const data = await response.json()
                            setWeather(data)
                            setLoading(false)
                        }
                    )
                } else {
                    // Fallback if geolocation not supported
                    const response = await fetch("/api/weather")
                    const data = await response.json()
                    setWeather(data)
                    setLoading(false)
                }
            } catch (error) {
                console.error("Failed to fetch weather:", error)
                setLoading(false)
            }
        }

        fetchWeather()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-3 w-24 bg-muted rounded" />
                </div>
            </div>
        )
    }

    if (!weather || !weather.temperature) {
        return null
    }

    return (
        <div className="flex items-center gap-4">
            {/* Weather Icon */}
            <div className="flex-shrink-0">
                {getWeatherIcon(weather.condition, weather.icon)}
            </div>

            {/* Weather Info */}
            <div className="flex flex-col">
                <div className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {greeting}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                        {weather.temperature.celsius}°C / {weather.temperature.fahrenheit}°F
                    </span>
                    <span>•</span>
                    <span className="capitalize">{weather.description}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                    {weather.city}, {weather.country}
                </div>
            </div>
        </div>
    )
}
