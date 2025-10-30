import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const key = process.env.YOUTUBE_API_KEY
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || "movie trailers"
  const maxResults = Number(searchParams.get("maxResults") || "8")

  try {
    if (!key) throw new Error("YOUTUBE_API_KEY not set")
    const url = new URL("https://www.googleapis.com/youtube/v3/search")
    url.searchParams.set("part", "snippet")
    url.searchParams.set("q", q)
    url.searchParams.set("type", "video")
    url.searchParams.set("maxResults", String(Math.min(20, Math.max(1, maxResults))))
    url.searchParams.set("key", key)

    const res = await fetch(url.toString(), { cache: "no-store" })
    if (!res.ok) throw new Error(`YouTube ${res.status}`)
    const data = await res.json()
    const items = (data.items || []).map((v: any) => ({
      id: v.id?.videoId,
      title: v.snippet?.title,
      channelTitle: v.snippet?.channelTitle,
      publishedAt: v.snippet?.publishedAt,
      thumbnail: v.snippet?.thumbnails?.medium?.url || v.snippet?.thumbnails?.default?.url,
      href: v.id?.videoId ? `https://www.youtube.com/watch?v=${v.id.videoId}` : null,
    }))
    return NextResponse.json({ items })
  } catch (e: any) {
    return NextResponse.json({ items: [] }, { status: 200 })
  }
}
