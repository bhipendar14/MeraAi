import { type NextRequest, NextResponse } from "next/server"
import { gemini, extractJson } from "@/lib/ai-gemini"

interface MovieItem {
  id: number;
  title: string;
  overview: string;
  poster: string | null;
  href: string;
  rating: number;
}

export async function GET(req: NextRequest) {
  const key = process.env.TMDB_API_KEY
  const { searchParams } = new URL(req.url)
  const mediaType = searchParams.get("type") || "all" // movie|tv|all
  try {
    if (!key) throw new Error("TMDB_API_KEY not set")
    const url = `https://api.themoviedb.org/3/trending/${mediaType}/day?api_key=${key}`
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) throw new Error(`TMDB ${res.status}`)
    const data = await res.json()

    const items: MovieItem[] = (data?.results || []).slice(0, 12).map((r: any) => ({
      id: r.id,
      title: r.title || r.name,
      overview: r.overview || "",
      poster: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : null,
      href: r.title ? `https://www.themoviedb.org/movie/${r.id}` : `https://www.themoviedb.org/tv/${r.id}`,
      rating: r.vote_average,
    }))

    const prompt = `From the following trending titles, pick 5 to recommend with a one-sentence reason. Return JSON array "recommendations" of {title, reason}.
Titles:
${items.map((item: MovieItem) => `- ${item.title}: ${item.overview}`).join("\n")}

Return JSON like:
{"recommendations":[{"title":"...", "reason":"..."}]}`

    let recommendations: Array<{ title: string; reason: string }> = []
    try {
      const text = await gemini(prompt)
      const parsed = extractJson<{ recommendations: Array<{ title: string; reason: string }> }>(text)
      if (parsed?.recommendations) recommendations = parsed.recommendations
    } catch { }

    return NextResponse.json({ items, recommendations })
  } catch (e: any) {
    return NextResponse.json({ items: [], recommendations: [] }, { status: 200 })
  }
}