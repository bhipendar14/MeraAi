import { NextRequest, NextResponse } from 'next/server'
import { searchDestinationImages } from '@/lib/unsplash'

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY
const RAPIDAPI_HOST = 'booking-com15.p.rapidapi.com'

// Hotel amenities options
const AMENITIES = [
    'Free WiFi', 'Swimming Pool', 'Gym', 'Restaurant', 'Bar',
    'Spa', 'Parking', 'Room Service', 'Air Conditioning', 'Pet Friendly'
]

function generateMockHotels(destination: string, checkIn: string, checkOut: string, guests: number) {
    const basePrice = 1000 + Math.random() * 3000 // Reduced from 2000-10000 to 1000-4000
    const hotels = []

    const hotelTypes = [
        { prefix: 'Grand', suffix: 'Hotel' },
        { prefix: 'The', suffix: 'Resort' },
        { prefix: 'Royal', suffix: 'Palace' },
        { prefix: 'Luxury', suffix: 'Suites' },
        { prefix: 'Premium', suffix: 'Inn' },
        { prefix: 'Elite', suffix: 'Residency' },
        { prefix: 'Majestic', suffix: 'Hotel' },
        { prefix: 'Paradise', suffix: 'Resort' }
    ]

    // Generate 8-12 hotels
    const hotelCount = 8 + Math.floor(Math.random() * 5)

    for (let i = 0; i < hotelCount; i++) {
        const hotelType = hotelTypes[Math.floor(Math.random() * hotelTypes.length)]
        const rating = 3 + Math.random() * 2 // 3-5 stars
        const reviewScore = 6 + Math.random() * 3.5 // 6-9.5
        const priceMultiplier = 0.4 + (rating / 8) + (Math.random() * 0.3) // Reduced multiplier
        const nightlyPrice = Math.round(basePrice * priceMultiplier)

        // Calculate nights
        const checkInDate = new Date(checkIn)
        const checkOutDate = new Date(checkOut)
        const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

        // Random amenities
        const hotelAmenities = AMENITIES
            .sort(() => Math.random() - 0.5)
            .slice(0, 5 + Math.floor(Math.random() * 5))

        hotels.push({
            id: `HOTEL${Date.now()}-${i}`,
            name: `${hotelType.prefix} ${destination} ${hotelType.suffix}`,
            rating: Math.round(rating * 10) / 10,
            reviewScore: Math.round(reviewScore * 10) / 10,
            reviewCount: Math.floor(100 + Math.random() * 900),
            pricePerNight: nightlyPrice,
            totalPrice: nightlyPrice * nights,
            currency: '₹',
            address: `${Math.floor(Math.random() * 500) + 1} Main Street, ${destination}`,
            distance: `${(Math.random() * 5).toFixed(1)} km from center`,
            amenities: hotelAmenities,
            roomType: guests > 2 ? 'Deluxe Room' : 'Standard Room',
            checkIn,
            checkOut,
            nights,
            guests,
            images: [], // Will be filled with Unsplash images
            freeCancellation: Math.random() > 0.3,
            breakfast: Math.random() > 0.4
        })
    }

    // Sort by price
    return hotels.sort((a, b) => a.pricePerNight - b.pricePerNight)
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl
        const destination = searchParams.get('destination')
        const checkIn = searchParams.get('checkIn')
        const checkOut = searchParams.get('checkOut')
        const guests = parseInt(searchParams.get('guests') || '2')

        if (!destination || !checkIn || !checkOut) {
            return NextResponse.json(
                { error: 'Missing required parameters: destination, checkIn, checkOut' },
                { status: 400 }
            )
        }

        // Validate dates
        const checkInDate = new Date(checkIn)
        const checkOutDate = new Date(checkOut)

        if (checkOutDate <= checkInDate) {
            return NextResponse.json(
                { error: 'Check-out date must be after check-in date' },
                { status: 400 }
            )
        }

        // Generate mock hotels
        let hotels = generateMockHotels(destination, checkIn, checkOut, guests)

        // Fetch real images from Unsplash for hotels
        try {
            const hotelImages = await searchDestinationImages(`${destination} luxury hotel room`, 12)

            hotels = hotels.map((hotel, index) => ({
                ...hotel,
                images: hotelImages.slice(index * 3, (index * 3) + 3).map(img => ({
                    url: img.urls.regular,
                    thumb: img.urls.small,
                    alt: img.alt_description || hotel.name
                }))
            }))
        } catch (error) {
            console.error('Error fetching hotel images:', error)
        }

        return NextResponse.json({
            hotels,
            searchParams: { destination, checkIn, checkOut, guests }
        })
    } catch (error) {
        console.error('Error in hotels API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
