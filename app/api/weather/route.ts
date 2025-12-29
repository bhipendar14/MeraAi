import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const lat = searchParams.get("lat")
    const lon = searchParams.get("lon")
    const city = searchParams.get("city") || "New Delhi"

    try {
        let latitude: string
        let longitude: string
        let locationName = city
        let countryName = ""

        if (lat && lon) {
            // Use provided coordinates
            latitude = lat
            longitude = lon

            // Reverse geocode to get city name using BigDataCloud (free, no API key)
            try {
                const reverseGeoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                const reverseGeoResponse = await fetch(reverseGeoUrl)
                const reverseGeoData = await reverseGeoResponse.json()

                // Try to get city name from various fields
                locationName = reverseGeoData.city ||
                    reverseGeoData.locality ||
                    reverseGeoData.principalSubdivision ||
                    reverseGeoData.countryName ||
                    city

                // Get country name
                countryName = reverseGeoData.countryName || ""
            } catch (e) {
                console.error("Reverse geocoding error:", e)
                // Keep default city name
            }
        } else {
            // Geocode city name to get coordinates
            const geoResponse = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`
            )
            const geoData = await geoResponse.json()

            if (!geoData.results || geoData.results.length === 0) {
                throw new Error("City not found")
            }

            latitude = geoData.results[0].latitude.toString()
            longitude = geoData.results[0].longitude.toString()
            locationName = geoData.results[0].name
        }

        // Fetch weather data from Open-Meteo
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day&timezone=auto`

        const weatherResponse = await fetch(weatherUrl, {
            next: { revalidate: 600 }, // Cache for 10 minutes
        })

        if (!weatherResponse.ok) {
            throw new Error(`Open-Meteo API error: ${weatherResponse.status}`)
        }

        const data = await weatherResponse.json()

        // Map WMO weather codes to conditions
        const weatherCode = data.current.weather_code
        const isDay = data.current.is_day === 1 // 1 = day, 0 = night
        const { condition, description, icon } = mapWeatherCode(weatherCode, isDay)

        const celsius = Math.round(data.current.temperature_2m)
        const fahrenheit = Math.round((celsius * 9 / 5) + 32)

        const weatherData = {
            temperature: {
                celsius,
                fahrenheit,
            },
            condition,
            description,
            icon,
            city: locationName,
            country: countryName,
        }

        return NextResponse.json(weatherData)
    } catch (error) {
        console.error("Weather API error:", error)
        return NextResponse.json(
            { error: "Failed to fetch weather data" },
            { status: 500 }
        )
    }
}

// Map WMO Weather interpretation codes to conditions
// https://open-meteo.com/en/docs
function mapWeatherCode(code: number, isDay: boolean = true): { condition: string; description: string; icon: string } {
    const dayNightIcon = isDay ? "d" : "n"

    if (code === 0) return { condition: "Clear", description: "clear sky", icon: `01${dayNightIcon}` }
    if (code === 1) return { condition: "Clear", description: "mainly clear", icon: `01${dayNightIcon}` }
    if (code === 2) return { condition: "Clouds", description: "partly cloudy", icon: `02${dayNightIcon}` }
    if (code === 3) return { condition: "Clouds", description: "overcast", icon: `03${dayNightIcon}` }
    if (code >= 45 && code <= 48) return { condition: "Mist", description: "foggy", icon: "50d" }
    if (code >= 51 && code <= 55) return { condition: "Drizzle", description: "drizzle", icon: "09d" }
    if (code >= 56 && code <= 57) return { condition: "Drizzle", description: "freezing drizzle", icon: "09d" }
    if (code >= 61 && code <= 65) return { condition: "Rain", description: "rain", icon: "10d" }
    if (code >= 66 && code <= 67) return { condition: "Rain", description: "freezing rain", icon: "10d" }
    if (code >= 71 && code <= 75) return { condition: "Snow", description: "snow", icon: "13d" }
    if (code === 77) return { condition: "Snow", description: "snow grains", icon: "13d" }
    if (code >= 80 && code <= 82) return { condition: "Rain", description: "rain showers", icon: "09d" }
    if (code >= 85 && code <= 86) return { condition: "Snow", description: "snow showers", icon: "13d" }
    if (code === 95) return { condition: "Thunderstorm", description: "thunderstorm", icon: "11d" }
    if (code >= 96 && code <= 99) return { condition: "Thunderstorm", description: "thunderstorm with hail", icon: "11d" }

    return { condition: "Clouds", description: "cloudy", icon: `03${dayNightIcon}` }
}
