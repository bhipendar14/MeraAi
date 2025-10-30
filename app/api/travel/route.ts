import { type NextRequest, NextResponse } from "next/server"
import { gemini } from "@/lib/ai-gemini"

export async function GET(req: NextRequest) {
  const key = process.env.GOOGLE_PLACES_API_KEY
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || "best places in San Francisco"
  try {
    if (!key) throw new Error("GOOGLE_PLACES_API_KEY not set")
    const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json")
    url.searchParams.set("query", q)
    url.searchParams.set("key", key)

    const res = await fetch(url.toString(), { cache: "no-store" })
    if (!res.ok) throw new Error(`Places ${res.status}`)
    const data = await res.json()
    const places = (data.results || []).slice(0, 10).map((p: any) => ({
      id: p.place_id,
      name: p.name,
      rating: p.rating,
      address: p.formatted_address,
      types: p.types,
      location: p.geometry?.location || null,
    }))

    const prompt = `Given these places, propose a tight 1-day itinerary (morning/afternoon/evening) with brief rationale and travel tips. 
Return 4-8 bullet points, keep it practical.

Places:
${places.map((p) => `- ${p.name} (${p.rating || "n/a"}★): ${p.address}`).join("\n")}`

    let itinerary = "Itinerary unavailable."
    try {
      itinerary = await gemini(prompt)
    } catch {}

    return NextResponse.json({ places, itinerary })
  } catch (e: any) {
    return NextResponse.json({ places: [], itinerary: "Itinerary unavailable." }, { status: 200 })
  }
}
