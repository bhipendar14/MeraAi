import { NextRequest, NextResponse } from 'next/server'
import { searchDestinationImages } from '@/lib/unsplash'
import { gemini } from '@/lib/ai-gemini'

// Expanded worldwide destinations database with background images
const POPULAR_DESTINATIONS = [
    // Asia
    { name: 'Tokyo', country: 'Japan', continent: 'Asia', lat: 35.6762, lng: 139.6503, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800' },
    { name: 'Bangkok', country: 'Thailand', continent: 'Asia', lat: 13.7563, lng: 100.5018, image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800' },
    { name: 'Singapore', country: 'Singapore', continent: 'Asia', lat: 1.3521, lng: 103.8198, image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800' },
    { name: 'Dubai', country: 'UAE', continent: 'Asia', lat: 25.2048, lng: 55.2708, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800' },
    { name: 'Bali', country: 'Indonesia', continent: 'Asia', lat: -8.3405, lng: 115.0920, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800' },
    { name: 'Seoul', country: 'South Korea', continent: 'Asia', lat: 37.5665, lng: 126.9780, image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800' },
    { name: 'Hong Kong', country: 'China', continent: 'Asia', lat: 22.3193, lng: 114.1694, image: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800' },
    { name: 'Kyoto', country: 'Japan', continent: 'Asia', lat: 35.0116, lng: 135.7681, image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800' },
    { name: 'Shanghai', country: 'China', continent: 'Asia', lat: 31.2304, lng: 121.4737, image: 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=800' },
    { name: 'Phuket', country: 'Thailand', continent: 'Asia', lat: 7.8804, lng: 98.3923, image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800' },
    { name: 'Kuala Lumpur', country: 'Malaysia', continent: 'Asia', lat: 3.1390, lng: 101.6869, image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800' },
    { name: 'Hanoi', country: 'Vietnam', continent: 'Asia', lat: 21.0285, lng: 105.8542, image: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800' },
    { name: 'Maldives', country: 'Maldives', continent: 'Asia', lat: 3.2028, lng: 73.2207, image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800' },
    { name: 'Osaka', country: 'Japan', continent: 'Asia', lat: 34.6937, lng: 135.5023, image: 'https://images.unsplash.com/photo-1590253230532-a67f6bc61c9e?w=800' },
    { name: 'Beijing', country: 'China', continent: 'Asia', lat: 39.9042, lng: 116.4074, image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800' },
    { name: 'Taipei', country: 'Taiwan', continent: 'Asia', lat: 25.0330, lng: 121.5654, image: 'https://images.unsplash.com/photo-1540960149-a0d4e1e8f3e3?w=800' },
    { name: 'Chiang Mai', country: 'Thailand', continent: 'Asia', lat: 18.7883, lng: 98.9853, image: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?w=800' },

    // Europe
    { name: 'Paris', country: 'France', continent: 'Europe', lat: 48.8566, lng: 2.3522, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800' },
    { name: 'London', country: 'UK', continent: 'Europe', lat: 51.5074, lng: -0.1278, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800' },
    { name: 'Rome', country: 'Italy', continent: 'Europe', lat: 41.9028, lng: 12.4964, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800' },
    { name: 'Barcelona', country: 'Spain', continent: 'Europe', lat: 41.3851, lng: 2.1734, image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800' },
    { name: 'Amsterdam', country: 'Netherlands', continent: 'Europe', lat: 52.3676, lng: 4.9041, image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800' },
    { name: 'Prague', country: 'Czech Republic', continent: 'Europe', lat: 50.0755, lng: 14.4378, image: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800' },
    { name: 'Vienna', country: 'Austria', continent: 'Europe', lat: 48.2082, lng: 16.3738, image: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800' },
    { name: 'Istanbul', country: 'Turkey', continent: 'Europe', lat: 41.0082, lng: 28.9784, image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800' },
    { name: 'Athens', country: 'Greece', continent: 'Europe', lat: 37.9838, lng: 23.7275, image: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800' },
    { name: 'Venice', country: 'Italy', continent: 'Europe', lat: 45.4408, lng: 12.3155, image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800' },
    { name: 'Santorini', country: 'Greece', continent: 'Europe', lat: 36.3932, lng: 25.4615, image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800' },
    { name: 'Lisbon', country: 'Portugal', continent: 'Europe', lat: 38.7223, lng: -9.1393, image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800' },
    { name: 'Berlin', country: 'Germany', continent: 'Europe', lat: 52.5200, lng: 13.4050, image: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800' },
    { name: 'Madrid', country: 'Spain', continent: 'Europe', lat: 40.4168, lng: -3.7038, image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800' },
    { name: 'Budapest', country: 'Hungary', continent: 'Europe', lat: 47.4979, lng: 19.0402, image: 'https://images.unsplash.com/photo-1541963058-d5c01eec0c4e?w=800' },
    { name: 'Edinburgh', country: 'Scotland', continent: 'Europe', lat: 55.9533, lng: -3.1883, image: 'https://images.unsplash.com/photo-1549918864-48ac978761a4?w=800' },

    // Americas
    { name: 'New York', country: 'USA', continent: 'North America', lat: 40.7128, lng: -74.0060, image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800' },
    { name: 'Los Angeles', country: 'USA', continent: 'North America', lat: 34.0522, lng: -118.2437, image: 'https://images.unsplash.com/photo-1534190239940-9ba8944ea261?w=800' },
    { name: 'Miami', country: 'USA', continent: 'North America', lat: 25.7617, lng: -80.1918, image: 'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=800' },
    { name: 'Cancun', country: 'Mexico', continent: 'North America', lat: 21.1619, lng: -86.8515, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800' },
    { name: 'Rio de Janeiro', country: 'Brazil', continent: 'South America', lat: -22.9068, lng: -43.1729, image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800' },
    { name: 'Buenos Aires', country: 'Argentina', continent: 'South America', lat: -34.6037, lng: -58.3816, image: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800' },
    { name: 'San Francisco', country: 'USA', continent: 'North America', lat: 37.7749, lng: -122.4194, image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800' },
    { name: 'Las Vegas', country: 'USA', continent: 'North America', lat: 36.1699, lng: -115.1398, image: 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=800' },
    { name: 'Toronto', country: 'Canada', continent: 'North America', lat: 43.6532, lng: -79.3832, image: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800' },
    { name: 'Vancouver', country: 'Canada', continent: 'North America', lat: 49.2827, lng: -123.1207, image: 'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=800' },
    { name: 'Mexico City', country: 'Mexico', continent: 'North America', lat: 19.4326, lng: -99.1332, image: 'https://images.unsplash.com/photo-1518659526054-e6c2c5c1c6c7?w=800' },
    { name: 'Lima', country: 'Peru', continent: 'South America', lat: -12.0464, lng: -77.0428, image: 'https://images.unsplash.com/photo-1531968455001-5c5272a41129?w=800' },

    // Oceania
    { name: 'Sydney', country: 'Australia', continent: 'Oceania', lat: -33.8688, lng: 151.2093, image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800' },
    { name: 'Melbourne', country: 'Australia', continent: 'Oceania', lat: -37.8136, lng: 144.9631, image: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=800' },
    { name: 'Auckland', country: 'New Zealand', continent: 'Oceania', lat: -36.8485, lng: 174.7633, image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800' },
    { name: 'Queenstown', country: 'New Zealand', continent: 'Oceania', lat: -45.0312, lng: 168.6626, image: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=800' },
    { name: 'Gold Coast', country: 'Australia', continent: 'Oceania', lat: -28.0167, lng: 153.4000, image: 'https://images.unsplash.com/photo-1583952734649-9b8a9d0d4c8e?w=800' },

    // Africa
    { name: 'Cape Town', country: 'South Africa', continent: 'Africa', lat: -33.9249, lng: 18.4241, image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800' },
    { name: 'Marrakech', country: 'Morocco', continent: 'Africa', lat: 31.6295, lng: -7.9811, image: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800' },
    { name: 'Cairo', country: 'Egypt', continent: 'Africa', lat: 30.0444, lng: 31.2357, image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800' },
    { name: 'Nairobi', country: 'Kenya', continent: 'Africa', lat: -1.2921, lng: 36.8219, image: 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=800' },
    { name: 'Zanzibar', country: 'Tanzania', continent: 'Africa', lat: -6.1659, lng: 39.2026, image: 'https://images.unsplash.com/photo-1568625365034-c3bb47a5f0c1?w=800' },

    // India
    { name: 'Mumbai', country: 'India', continent: 'Asia', lat: 19.0760, lng: 72.8777, image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800' },
    { name: 'Delhi', country: 'India', continent: 'Asia', lat: 28.6139, lng: 77.2090, image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800' },
    { name: 'Bangalore', country: 'India', continent: 'Asia', lat: 12.9716, lng: 77.5946, image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800' },
    { name: 'Goa', country: 'India', continent: 'Asia', lat: 15.2993, lng: 74.1240, image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800' },
    { name: 'Jaipur', country: 'India', continent: 'Asia', lat: 26.9124, lng: 75.7873, image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800' },
    { name: 'Kerala', country: 'India', continent: 'Asia', lat: 10.8505, lng: 76.2711, image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800' },
    { name: 'Agra', country: 'India', continent: 'Asia', lat: 27.1767, lng: 78.0081, image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800' },
    { name: 'Udaipur', country: 'India', continent: 'Asia', lat: 24.5854, lng: 73.7125, image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800' },
    { name: 'Varanasi', country: 'India', continent: 'Asia', lat: 25.3176, lng: 82.9739, image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800' },
    { name: 'Kolkata', country: 'India', continent: 'Asia', lat: 22.5726, lng: 88.3639, image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=800' },
    { name: 'Chennai', country: 'India', continent: 'Asia', lat: 13.0827, lng: 80.2707, image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800' },
    { name: 'Hyderabad', country: 'India', continent: 'Asia', lat: 17.3850, lng: 78.4867, image: 'https://images.unsplash.com/photo-1603262110225-d6f31d1a4d0d?w=800' },
    { name: 'Pune', country: 'India', continent: 'Asia', lat: 18.5204, lng: 73.8567, image: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800' },
    { name: 'Ahmedabad', country: 'India', continent: 'Asia', lat: 23.0225, lng: 72.5714, image: 'https://images.unsplash.com/photo-1585737034897-e9f0b4e5d3d9?w=800' },
    { name: 'Indore', country: 'India', continent: 'Asia', lat: 22.7196, lng: 75.8577, image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800' },
    { name: 'Rajkot', country: 'India', continent: 'Asia', lat: 22.3039, lng: 70.8022, image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800' },
    { name: 'Shimla', country: 'India', continent: 'Asia', lat: 31.1048, lng: 77.1734, image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800' },
    { name: 'Rishikesh', country: 'India', continent: 'Asia', lat: 30.0869, lng: 78.2676, image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800' },
]

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl
        const query = searchParams.get('query')?.toLowerCase()
        const action = searchParams.get('action') // 'search' or 'details'

        // Autocomplete search
        if (query && action === 'search') {
            const matches = POPULAR_DESTINATIONS.filter(dest =>
                dest.name.toLowerCase().includes(query) ||
                dest.country.toLowerCase().includes(query)
            ).slice(0, 10)

            return NextResponse.json({ destinations: matches })
        }

        // Get destination details
        if (query && action === 'details') {
            const destination = POPULAR_DESTINATIONS.find(
                dest => dest.name.toLowerCase() === query
            )

            if (!destination) {
                return NextResponse.json(
                    { error: 'Destination not found' },
                    { status: 404 }
                )
            }

            // Fetch real images from Unsplash
            const images = await searchDestinationImages(destination.name, 6)

            // Generate AI summary
            let aiSummary = ''
            try {
                aiSummary = await gemini(
                    `Write a compelling 150-word travel guide for ${destination.name}, ${destination.country}. Include: best time to visit, top attractions, local culture, must-try food, and unique experiences. Make it engaging and informative.`
                )
            } catch (error) {
                aiSummary = `${destination.name} is a captivating destination in ${destination.country}, offering unforgettable experiences for every traveler.`
            }

            // Generate local tips
            let localTips: string[] = []
            try {
                const tipsResponse = await gemini(
                    `Provide 5 practical travel tips for visiting ${destination.name}, ${destination.country}. Format as a simple list, each tip concise and actionable.`
                )
                localTips = tipsResponse
                    .split('\n')
                    .filter((tip: string) => tip.trim().length > 0)
                    .map((tip: string) => tip.replace(/^[-•*]\s*/, '').trim())
                    .slice(0, 5)
            } catch (error) {
                localTips = [
                    'Book accommodations in advance during peak season',
                    'Learn a few basic local phrases',
                    'Try authentic local cuisine',
                    'Respect local customs and traditions',
                    'Keep emergency contacts handy'
                ]
            }

            // Generate top attractions
            let attractions: Array<{ name: string; description: string; category: string }> = []
            try {
                const attractionsPrompt = `List 5 top tourist attractions in ${destination.name}, ${destination.country}. For each, provide: name, brief 1-sentence description, and category (Historical/Nature/Cultural/Entertainment). Format as JSON array.`
                const attractionsResponse = await gemini(attractionsPrompt)
                attractions = JSON.parse(attractionsResponse)
            } catch (error) {
                attractions = [
                    { name: 'City Center', description: 'Explore the vibrant heart of the city', category: 'Cultural' },
                    { name: 'Historic District', description: 'Discover rich history and heritage', category: 'Historical' },
                    { name: 'Local Market', description: 'Experience authentic local life', category: 'Cultural' },
                ]
            }

            return NextResponse.json({
                destination: {
                    ...destination,
                    images: images.map(img => ({
                        url: img.urls.regular,
                        thumb: img.urls.thumb,
                        photographer: img.user.name,
                        photographerUrl: img.user.links.html,
                        alt: img.alt_description || destination.name
                    })),
                    aiSummary,
                    localTips,
                    attractions
                }
            })
        }

        // Return popular destinations
        return NextResponse.json({ destinations: POPULAR_DESTINATIONS.slice(0, 30) })
    } catch (error) {
        console.error('Error in destinations API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
