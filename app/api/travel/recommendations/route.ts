import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { TravelRecommendation } from '@/lib/models/booking'
import { gemini } from '@/lib/ai-gemini'

// City coordinates for generating realistic locations
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  mumbai: { lat: 19.0760, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.2090 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bengaluru: { lat: 12.9716, lng: 77.5946 }, // Alternative name
  pune: { lat: 18.5204, lng: 73.8567 },
  hyderabad: { lat: 17.3850, lng: 78.4867 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  rajkot: { lat: 22.3039, lng: 70.8022 },
  surat: { lat: 21.1702, lng: 72.8311 },
  vadodara: { lat: 22.3072, lng: 73.1812 },
  nashik: { lat: 19.9975, lng: 73.7898 },
  nagpur: { lat: 21.1458, lng: 79.0882 },
  indore: { lat: 22.7196, lng: 75.8577 },
  bhopal: { lat: 23.2599, lng: 77.4126 },
  lucknow: { lat: 26.8467, lng: 80.9462 },
  kanpur: { lat: 26.4499, lng: 80.3319 },
  agra: { lat: 27.1767, lng: 78.0081 },
  varanasi: { lat: 25.3176, lng: 82.9739 },
  goa: { lat: 15.2993, lng: 74.1240 },
  kochi: { lat: 9.9312, lng: 76.2673 },
  thiruvananthapuram: { lat: 8.5241, lng: 76.9366 },
  coimbatore: { lat: 11.0168, lng: 76.9558 },
  madurai: { lat: 9.9252, lng: 78.1198 },
  chandigarh: { lat: 30.7333, lng: 76.7794 },
  amritsar: { lat: 31.6340, lng: 74.8723 },
  jodhpur: { lat: 26.2389, lng: 73.0243 },
  udaipur: { lat: 24.5854, lng: 73.7125 },
  shimla: { lat: 31.1048, lng: 77.1734 },
  manali: { lat: 32.2432, lng: 77.1892 },
  rishikesh: { lat: 30.0869, lng: 78.2676 },
  haridwar: { lat: 29.9457, lng: 78.1642 },
  dehradun: { lat: 30.3165, lng: 78.0322 },
  mussoorie: { lat: 30.4598, lng: 78.0664 }
}

async function generatePlacesWithAI(destination: string): Promise<any[]> {
  try {
    // First try to find exact match
    let cityCoords = CITY_COORDINATES[destination.toLowerCase()]
    
    // If not found, try partial matching
    if (!cityCoords) {
      const partialMatch = Object.keys(CITY_COORDINATES).find(city => 
        city.includes(destination.toLowerCase()) || destination.toLowerCase().includes(city)
      )
      if (partialMatch) {
        cityCoords = CITY_COORDINATES[partialMatch]
        destination = partialMatch // Use the matched city name
      }
    }
    
    // If still not found, use a default location (Delhi)
    if (!cityCoords) {
      cityCoords = CITY_COORDINATES.delhi
      destination = 'Delhi' // Fallback to Delhi
    }

    const placesPrompt = `Generate a JSON array of exactly 6 top tourist attractions and places to visit in ${destination}, India. For each place, provide:
    - name: The exact name of the place
    - description: A detailed 2-sentence description
    - category: One of "Historical", "Religious", "Nature", "Architecture", "Cultural", "Shopping", "Food", "Entertainment"
    - rating: A realistic rating between 4.0 and 4.9
    - lat: Realistic latitude near ${cityCoords.lat} (within 0.1 degrees)
    - lng: Realistic longitude near ${cityCoords.lng} (within 0.1 degrees)
    - image: A descriptive phrase for the place (e.g., "red fort delhi architecture")
    - bestTimeToVisit: Best time of day or season to visit
    - estimatedDuration: How long to spend there (e.g., "2-3 hours", "Half day")

    Return only valid JSON array, no other text.`

    const response = await gemini(placesPrompt, true)
    const places = JSON.parse(response)
    
    if (Array.isArray(places) && places.length > 0) {
      return places
    }
    
    throw new Error('Invalid AI response')
  } catch (error) {
    console.error('AI generation failed, using fallback:', error)
    // Fallback to basic places if AI fails
    return generateFallbackPlaces(destination)
  }
}

function generateFallbackPlaces(destination: string): any[] {
  let cityCoords = CITY_COORDINATES[destination.toLowerCase()]
  
  // Try partial matching if exact match not found
  if (!cityCoords) {
    const partialMatch = Object.keys(CITY_COORDINATES).find(city => 
      city.includes(destination.toLowerCase()) || destination.toLowerCase().includes(city)
    )
    if (partialMatch) {
      cityCoords = CITY_COORDINATES[partialMatch]
      destination = partialMatch
    } else {
      // Use Delhi as fallback
      cityCoords = CITY_COORDINATES.delhi
      destination = 'Delhi'
    }
  }

  const categories = ["Historical", "Religious", "Nature", "Architecture", "Cultural", "Shopping"]
  const places = []
  
  for (let i = 0; i < 6; i++) {
    places.push({
      name: `${destination} Attraction ${i + 1}`,
      description: `A popular tourist destination in ${destination}. Known for its cultural significance and beautiful architecture.`,
      category: categories[i % categories.length],
      rating: 4.0 + Math.random() * 0.9,
      lat: cityCoords.lat + (Math.random() - 0.5) * 0.1,
      lng: cityCoords.lng + (Math.random() - 0.5) * 0.1,
      image: `${destination.toLowerCase()}-attraction-${i + 1}`,
      bestTimeToVisit: i % 2 === 0 ? "Morning (9-12 PM)" : "Evening (4-7 PM)",
      estimatedDuration: i % 3 === 0 ? "2-3 hours" : i % 3 === 1 ? "1-2 hours" : "Half day"
    })
  }
  
  return places
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const destination = searchParams.get('destination')?.toLowerCase()

    if (!destination) {
      return NextResponse.json({ error: 'Destination parameter required' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    
    // Check if we have cached recommendations
    let recommendation = await db
      .collection<TravelRecommendation>('travel_recommendations')
      .findOne({ destination })

    if (!recommendation) {
      // Generate new recommendation using AI
      const places = await generatePlacesWithAI(destination)
      
      if (places.length === 0) {
        return NextResponse.json({ error: 'Unable to generate recommendations for this destination' }, { status: 404 })
      }

      // Generate AI summary
      let aiSummary = ''
      try {
        aiSummary = await gemini(
          `Write a comprehensive travel guide summary for ${destination}. Include information about the best time to visit, local culture, must-try food, transportation tips, and what makes this destination unique. Keep it engaging and informative, around 150-200 words.`,
          true
        )
      } catch (error) {
        aiSummary = `${destination.charAt(0).toUpperCase() + destination.slice(1)} is a vibrant destination with rich culture, amazing attractions, and unforgettable experiences waiting to be explored!`
      }

      // Generate local tips
      let localTips: string[] = []
      try {
        const tipsResponse = await gemini(
          `Provide 5 practical local tips for travelers visiting ${destination}. Format as a simple list, each tip should be concise and actionable.`,
          true
        )
        localTips = tipsResponse.split('\n').filter((tip: string) => tip.trim().length > 0).slice(0, 5)
      } catch (error) {
        localTips = [
          'Book accommodations in advance during peak season',
          'Try local street food for authentic flavors',
          'Use public transportation to save money',
          'Carry cash as some places may not accept cards',
          'Respect local customs and dress codes'
        ]
      }

      const newRecommendation = {
        destination,
        places,
        aiSummary,
        localTips,
        createdAt: new Date()
      }

      // Cache the recommendation
      const result = await db.collection<TravelRecommendation>('travel_recommendations').insertOne(newRecommendation)
      recommendation = { ...newRecommendation, _id: result.insertedId }
    }

    return NextResponse.json({ recommendation })
  } catch (error) {
    console.error('Error fetching travel recommendations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}