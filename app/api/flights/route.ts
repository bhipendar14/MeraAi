import { NextRequest, NextResponse } from 'next/server'

const AVIATIONSTACK_API_KEY = '22decc05eeb3372795c6e0c3932c4a05'
const AVIATIONSTACK_BASE_URL = 'http://api.aviationstack.com/v1'

// Major airport codes database
const AIRPORT_CODES: Record<string, { code: string; name: string; city: string; country: string }> = {
    // India
    'DEL': { code: 'DEL', name: 'Indira Gandhi International', city: 'Delhi', country: 'India' },
    'BOM': { code: 'BOM', name: 'Chhatrapati Shivaji International', city: 'Mumbai', country: 'India' },
    'BLR': { code: 'BLR', name: 'Kempegowda International', city: 'Bangalore', country: 'India' },
    'MAA': { code: 'MAA', name: 'Chennai International', city: 'Chennai', country: 'India' },
    'CCU': { code: 'CCU', name: 'Netaji Subhas Chandra Bose International', city: 'Kolkata', country: 'India' },
    'HYD': { code: 'HYD', name: 'Rajiv Gandhi International', city: 'Hyderabad', country: 'India' },
    'GOI': { code: 'GOI', name: 'Goa International', city: 'Goa', country: 'India' },
    'JAI': { code: 'JAI', name: 'Jaipur International', city: 'Jaipur', country: 'India' },

    // International
    'JFK': { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA' },
    'LAX': { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA' },
    'LHR': { code: 'LHR', name: 'Heathrow', city: 'London', country: 'UK' },
    'CDG': { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France' },
    'DXB': { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' },
    'SIN': { code: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'Singapore' },
    'HND': { code: 'HND', name: 'Tokyo Haneda', city: 'Tokyo', country: 'Japan' },
    'ICN': { code: 'ICN', name: 'Incheon International', city: 'Seoul', country: 'South Korea' },
    'SYD': { code: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia' },
    'FRA': { code: 'FRA', name: 'Frankfurt', city: 'Frankfurt', country: 'Germany' },
    'AMS': { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands' },
}

// Airlines database
const AIRLINES: Record<string, { name: string; logo: string }> = {
    'AI': { name: 'Air India', logo: '🇮🇳' },
    'UK': { name: 'Vistara', logo: '✈️' },
    '6E': { name: 'IndiGo', logo: '🔵' },
    'SG': { name: 'SpiceJet', logo: '🔴' },
    'AA': { name: 'American Airlines', logo: '🦅' },
    'BA': { name: 'British Airways', logo: '🇬🇧' },
    'EK': { name: 'Emirates', logo: '🇦🇪' },
    'SQ': { name: 'Singapore Airlines', logo: '🇸🇬' },
    'QR': { name: 'Qatar Airways', logo: '🇶🇦' },
}

function generateMockFlights(from: string, to: string, date: string) {
    const fromAirport = AIRPORT_CODES[from.toUpperCase()]
    const toAirport = AIRPORT_CODES[to.toUpperCase()]

    if (!fromAirport || !toAirport) {
        return []
    }

    const basePrice = 3000 + Math.random() * 7000
    const flights = []
    const airlineCodes = Object.keys(AIRLINES)

    // Generate 5-8 flights
    const flightCount = 5 + Math.floor(Math.random() * 4)

    for (let i = 0; i < flightCount; i++) {
        const departureHour = 6 + Math.floor(Math.random() * 16)
        const departureMinute = Math.floor(Math.random() * 60)
        const duration = 2 + Math.random() * 8 // 2-10 hours
        const arrivalTime = new Date()
        arrivalTime.setHours(departureHour + Math.floor(duration), departureMinute + Math.floor((duration % 1) * 60))

        const airlineCode = airlineCodes[Math.floor(Math.random() * airlineCodes.length)]
        const airline = AIRLINES[airlineCode]
        const stops = Math.random() > 0.6 ? 0 : Math.random() > 0.5 ? 1 : 2
        const priceMultiplier = 1 + (stops * 0.2) + (Math.random() * 0.4 - 0.2)

        flights.push({
            id: `FL${Date.now()}-${i}`,
            airline: airline.name,
            airlineCode,
            logo: airline.logo,
            flightNumber: `${airlineCode}${Math.floor(1000 + Math.random() * 9000)}`,
            from: fromAirport.code,
            fromCity: fromAirport.city,
            fromAirport: fromAirport.name,
            to: toAirport.code,
            toCity: toAirport.city,
            toAirport: toAirport.name,
            departureTime: `${String(departureHour).padStart(2, '0')}:${String(departureMinute).padStart(2, '0')}`,
            arrivalTime: `${String(arrivalTime.getHours()).padStart(2, '0')}:${String(arrivalTime.getMinutes()).padStart(2, '0')}`,
            duration: `${Math.floor(duration)}h ${Math.floor((duration % 1) * 60)}m`,
            stops,
            price: Math.round(basePrice * priceMultiplier),
            class: 'Economy',
            availableSeats: Math.floor(10 + Math.random() * 90),
            date
        })
    }

    // Sort by price
    return flights.sort((a, b) => a.price - b.price)
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl
        const action = searchParams.get('action')

        // Airport search/autocomplete
        if (action === 'airports') {
            const query = searchParams.get('query')?.toLowerCase() || ''

            const matches = Object.values(AIRPORT_CODES).filter(airport =>
                airport.city.toLowerCase().includes(query) ||
                airport.code.toLowerCase().includes(query) ||
                airport.name.toLowerCase().includes(query)
            ).slice(0, 10)

            return NextResponse.json({ airports: matches })
        }

        // Flight search
        const from = searchParams.get('from')
        const to = searchParams.get('to')
        const date = searchParams.get('date')
        const passengers = parseInt(searchParams.get('passengers') || '1')

        if (!from || !to || !date) {
            return NextResponse.json(
                { error: 'Missing required parameters: from, to, date' },
                { status: 400 }
            )
        }

        // Generate mock flights (since AviationStack free tier has limitations)
        // In production, you would call the real API here
        const flights = generateMockFlights(from, to, date)

        if (flights.length === 0) {
            return NextResponse.json({
                flights: [],
                message: 'No flights found for this route'
            })
        }

        return NextResponse.json({
            flights,
            searchParams: { from, to, date, passengers }
        })
    } catch (error) {
        console.error('Error in flights API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
