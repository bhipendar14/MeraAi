import { type NextRequest, NextResponse } from "next/server"
import { gemini, extractJson } from "@/lib/ai-gemini"

const NEWS_API_KEY = "810e61dcbd7c4ebb8800947eca57dbcd"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const country = searchParams.get("country") || "us"
  const category = searchParams.get("category") || ""
  const q = searchParams.get("q") || ""
  const pageSize = searchParams.get("pageSize") || "8"

  try {
    const url = new URL("https://newsapi.org/v2/top-headlines")
    if (q) url.searchParams.set("q", q)
    if (category) url.searchParams.set("category", category)
    url.searchParams.set("country", country)
    url.searchParams.set("pageSize", pageSize)
    url.searchParams.set("apiKey", NEWS_API_KEY)

    const res = await fetch(url.toString(), { cache: "no-store" })
    if (!res.ok) throw new Error(`NewsAPI ${res.status}`)
    const json = await res.json()

    const articles = Array.isArray(json.articles) ? json.articles.slice(0, 8) : []
    const condensed = articles.map((a: any) => ({
      headline: a?.title || "",
      description: a?.description || "",
      url: a?.url || "",
      source: a?.source?.name || "Unknown",
    }))

    const prompt = `Summarize the following news items in 1-2 sentences each. Return JSON array "summaries" aligned by index.
Items:
${condensed.map((x, i) => `${i + 1}. ${x.headline} — ${x.description}`).join("\n")}

Return JSON like:
{"summaries":["...","..."]}`

    let summaries: string[] = []
    try {
      const text = await gemini(prompt, true)
      const parsed = extractJson<{ summaries: string[] }>(text)
      if (parsed?.summaries?.length) summaries = parsed.summaries
    } catch {}

    const items = condensed.map((n, i) => ({
      id: i + 1,
      headline: n.headline,
      summary: summaries[i] || n.description || "No summary available.",
      url: n.url,
      source: n.source,
    }))

    return NextResponse.json({ items })
  } catch (e: any) {
    return NextResponse.json({ items: [] }, { status: 200 })
  }
}
