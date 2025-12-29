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
const getWeatherIcon = (condition: string, iconCode: string, size: "sm" | "md" = "md") => {
    const sizeClass = size === "sm" ? "w-5 h-5" : "w-6 h-6"
    const isNight = iconCode?.endsWith("n") || false

    switch (condition?.toLowerCase()) {
        case "clear":
            return isNight ? <Moon className={`${sizeClass} text-blue-200`} /> : <Sun className={`${sizeClass} text-yellow-400`} />
        case "clouds":
            return <Cloud className={`${sizeClass} text-gray-400`} />
        case "rain":
            return <CloudRain className={`${sizeClass} text-blue-400`} />
        case "drizzle":
            return <CloudDrizzle className={`${sizeClass} text-blue-300`} />
        case "snow":
            return <CloudSnow className={`${sizeClass} text-blue-200`} />
        case "thunderstorm":
            return <CloudLightning className={`${sizeClass} text-purple-400`} />
        case "mist":
        case "fog":
        case "haze":
            return <Wind className={`${sizeClass} text-gray-300`} />
        default:
            return <Cloud className={`${sizeClass} text-gray-400`} />
    }
}

interface SidebarWeatherProps {
    collapsed: boolean
}

export function SidebarWeather({ collapsed }: SidebarWeatherProps) {
    const [weather, setWeather] = useState<WeatherData | null>(null)
    const [loading, setLoading] = useState(true)

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
            <div className={`flex ${collapsed ? "justify-center" : "items-center gap-2"} p-2 animate-pulse`}>
                <div className="w-5 h-5 bg-muted rounded-full" />
                {!collapsed && <div className="h-3 w-16 bg-muted rounded" />}
            </div>
        )
    }

    if (!weather || !weather.temperature) {
        return null
    }

    if (collapsed) {
        // Show only icon when collapsed
        return (
            <div className="flex justify-center p-2" title={`${weather.temperature.celsius}°C - ${weather.description}`}>
                {getWeatherIcon(weather.condition, weather.icon, "sm")}
            </div>
        )
    }

    // Show full info when expanded
    return (
        <div className="p-3 rounded-lg border border-border/60 bg-card/60">
            <div className="flex items-center gap-2">
                {getWeatherIcon(weather.condition, weather.icon, "sm")}
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground">
                        {weather.temperature.celsius}°C / {weather.temperature.fahrenheit}°F
                    </div>
                    <div className="text-xs text-muted-foreground truncate capitalize">
                        {weather.description}
                    </div>
                </div>
            </div>
        </div>
    )
}
