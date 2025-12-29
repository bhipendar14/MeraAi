import { type NextRequest, NextResponse } from "next/server"
import { gemini, extractJson } from "@/lib/ai-gemini"

const NEWS_API_KEY = process.env.NEWS_API_KEY || "d9c5b4898d2d4701adf05d3e4eed6c0c"
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "AIzaSyBs15zGLY0vtpkZey8EjvHEMwbPKAeBzzc"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const endpoint = searchParams.get("endpoint") || "news"

  // Route to different endpoints
  if (endpoint === "videos") {
    return getNewsVideos(searchParams)
  } else if (endpoint === "breaking") {
    return getBreakingNews(searchParams)
  } else if (endpoint === "digest") {
    return getAIDigest(searchParams)
  } else {
    return getNews(searchParams)
  }
}

// Main news endpoint with filters
async function getNews(searchParams: URLSearchParams) {
  const language = searchParams.get("language") || "en"
  const country = searchParams.get("country") || ""
  const category = searchParams.get("category") || ""
  const q = searchParams.get("q") || ""
  const pageSize = searchParams.get("pageSize") || "12"

  // Map country codes to language codes for fallback
  const countryToLanguage: Record<string, string> = {
    us: "en", gb: "en", au: "en", ca: "en",
    de: "de", fr: "fr", es: "es", it: "it",
    jp: "ja", cn: "zh", kr: "ko",
    in: "hi", br: "pt", ru: "ru", ar: "ar"
  }

  try {
    let url: URL
    let articles: any[] = []

    // If country is specified, try top-headlines first
    if (country) {
      url = new URL("https://newsapi.org/v2/top-headlines")
      url.searchParams.set("country", country)

      if (category) {
        url.searchParams.set("category", category)
      }
      if (q) {
        url.searchParams.set("q", q)
      }

      url.searchParams.set("pageSize", pageSize)
      url.searchParams.set("apiKey", NEWS_API_KEY)

      console.log(`[News API] Fetching country-specific: ${url.toString()}`)

      const res = await fetch(url.toString(), { cache: "no-store" })
      if (res.ok) {
        const json = await res.json()
        if (json.status !== "error" && Array.isArray(json.articles)) {
          articles = json.articles
        }
      }

      // Fallback: If no articles from country-specific endpoint, try /v2/everything with language
      if (articles.length === 0) {
        console.log(`[News API] No results for country ${country}, falling back to language-based search`)
        const fallbackLang = countryToLanguage[country] || language

        url = new URL("https://newsapi.org/v2/everything")
        url.searchParams.set("language", fallbackLang)
        url.searchParams.set("sortBy", "publishedAt")

        if (q) {
          url.searchParams.set("q", q)
        } else {
          // Search for country-specific news with category if specified
          const countryNames: Record<string, string> = {
            us: "USA", gb: "UK", jp: "Japan", in: "India", de: "Germany",
            fr: "France", ca: "Canada", au: "Australia", br: "Brazil", cn: "China"
          }
          const countryName = countryNames[country] || country

          if (category) {
            // Include category in the search
            url.searchParams.set("q", `${countryName} ${category} news`)
          } else {
            url.searchParams.set("q", `${countryName} OR news`)
          }
        }

        url.searchParams.set("pageSize", pageSize)
        url.searchParams.set("apiKey", NEWS_API_KEY)

        console.log(`[News API] Fallback fetch: ${url.toString()}`)

        const fallbackRes = await fetch(url.toString(), { cache: "no-store" })
        if (fallbackRes.ok) {
          const fallbackJson = await fallbackRes.json()
          if (fallbackJson.status !== "error" && Array.isArray(fallbackJson.articles)) {
            articles = fallbackJson.articles
          }
        }
      }
    } else {
      // Global news with language filter
      url = new URL("https://newsapi.org/v2/everything")
      url.searchParams.set("language", language)
      url.searchParams.set("sortBy", "publishedAt")

      if (q) {
        url.searchParams.set("q", q)
      } else if (category) {
        // If category is selected, search for that category
        url.searchParams.set("q", `${category} news`)
      } else {
        // If no search query or category, search for general news terms
        url.searchParams.set("q", "news OR world OR breaking")
      }

      url.searchParams.set("pageSize", pageSize)
      url.searchParams.set("apiKey", NEWS_API_KEY)

      console.log(`[News API] Fetching global: ${url.toString()}`)

      const res = await fetch(url.toString(), { cache: "no-store" })
      if (res.ok) {
        const json = await res.json()
        if (json.status !== "error" && Array.isArray(json.articles)) {
          articles = json.articles
        }
      }
    }

    // Format articles (prefer articles with images, but allow without)
    const items = articles
      .slice(0, parseInt(pageSize))
      .map((a: any, index: number) => ({
        id: index + 1,
        headline: a.title || "",
        description: a.description || "",
        content: a.content || "",
        url: a.url || "",
        image: a.urlToImage || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=450&fit=crop", // Placeholder for news
        source: a.source?.name || "Unknown",
        publishedAt: a.publishedAt || "",
        author: a.author || "Unknown",
      }))

    // Generate AI summaries for articles
    let summaries: string[] = []
    if (items.length > 0) {
      try {
        const condensed = items.slice(0, 6).map((x: any) => `${x.headline} — ${x.description}`)
        const prompt = `Summarize each news item in 1-2 sentences. Return JSON array "summaries" aligned by index.
Items:
${condensed.map((x, i) => `${i + 1}. ${x}`).join("\\n")}

Return JSON like: {"summaries":["...","..."]}`

        const text = await gemini(prompt, true)
        const parsed = extractJson(text) as { summaries: string[] } | null
        if (parsed?.summaries?.length) {
          summaries = parsed.summaries
        }
      } catch (e) {
        console.error("AI summary error:", e)
      }
    }

    // Add summaries to items
    const itemsWithSummaries = items.map((item: any, i: number) => ({
      ...item,
      summary: summaries[i] || item.description || "No summary available.",
    }))

    return NextResponse.json({
      items: itemsWithSummaries,
      total: articles.length
    })
  } catch (e: any) {
    console.error("News API error:", e)
    return NextResponse.json({ items: [], total: 0 })
  }
}

// YouTube News Videos endpoint
async function getNewsVideos(searchParams: URLSearchParams) {
  const country = searchParams.get("country") || ""
  const category = searchParams.get("category") || ""
  const language = searchParams.get("language") || "en"
  const q = searchParams.get("q") || ""

  try {
    // Build search query based on filters
    let searchQuery = ""

    // Priority: custom search query > category + country > country > category > default
    if (q) {
      searchQuery = q
      // If country is also specified, add it to the query
      if (country) {
        const countryNames: Record<string, string> = {
          us: "USA", gb: "UK", jp: "Japan", in: "India", de: "Germany",
          fr: "France", ca: "Canada", au: "Australia", br: "Brazil", cn: "China"
        }
        const countryName = countryNames[country] || country
        searchQuery = `${q} ${countryName}`
      }
    } else {
      // Build query from category and/or country
      const countryNames: Record<string, string> = {
        us: "USA", gb: "UK", jp: "Japan", in: "India", de: "Germany",
        fr: "France", ca: "Canada", au: "Australia", br: "Brazil", cn: "China"
      }
      const countryName = country ? countryNames[country] || country : ""

      if (category && country) {
        // Both category and country selected
        searchQuery = `${countryName} ${category} news`
      } else if (country) {
        // Only country selected
        searchQuery = `${countryName} news`
      } else if (category) {
        // Only category selected
        searchQuery = `${category} news`
      } else {
        // No filters
        searchQuery = "news"
      }
    }

    const url = new URL("https://www.googleapis.com/youtube/v3/search")
    url.searchParams.set("part", "snippet")
    url.searchParams.set("q", searchQuery)
    url.searchParams.set("type", "video")
    url.searchParams.set("videoDuration", "medium")
    url.searchParams.set("order", "date")
    url.searchParams.set("maxResults", "12")
    url.searchParams.set("relevanceLanguage", language)
    url.searchParams.set("key", YOUTUBE_API_KEY)

    console.log(`[YouTube API] Fetching videos with query: ${searchQuery}`)

    const res = await fetch(url.toString(), { cache: "no-store" })
    if (!res.ok) {
      console.error(`YouTube API error: ${res.status}`)
      return NextResponse.json({ videos: [] })
    }

    const json = await res.json()
    const videos = (json.items || []).map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }))

    return NextResponse.json({ videos })
  } catch (e: any) {
    console.error("YouTube API error:", e)
    return NextResponse.json({ videos: [] })
  }
}

// Breaking News endpoint
async function getBreakingNews(searchParams: URLSearchParams) {
  const country = searchParams.get("country") || "us"

  try {
    const url = new URL("https://newsapi.org/v2/top-headlines")
    url.searchParams.set("country", country)
    url.searchParams.set("pageSize", "5")
    url.searchParams.set("apiKey", NEWS_API_KEY)

    const res = await fetch(url.toString(), { cache: "no-store" })
    if (!res.ok) {
      return NextResponse.json({ breaking: [] })
    }

    const json = await res.json()
    const breaking = (json.articles || []).slice(0, 5).map((a: any) => ({
      headline: a.title || "",
      url: a.url || "",
    }))

    return NextResponse.json({ breaking })
  } catch (e: any) {
    console.error("Breaking news error:", e)
    return NextResponse.json({ breaking: [] })
  }
}

// AI News Digest endpoint
async function getAIDigest(searchParams: URLSearchParams) {
  const country = searchParams.get("country") || "us"
  const language = searchParams.get("language") || "en"

  try {
    console.log('[News API] Fetching digest for country:', country)

    // Fetch top headlines for digest
    const url = new URL("https://newsapi.org/v2/top-headlines")
    url.searchParams.set("country", country)
    url.searchParams.set("pageSize", "10")
    url.searchParams.set("apiKey", NEWS_API_KEY)

    const res = await fetch(url.toString(), { cache: "no-store" })
    if (!res.ok) {
      console.error('[News API] Failed to fetch headlines:', res.status)
      return NextResponse.json({ digest: "Unable to fetch news for digest at this time." })
    }

    const json = await res.json()
    const articles = json.articles || []

    console.log('[News API] Fetched', articles.length, 'articles for digest')

    if (articles.length === 0) {
      return NextResponse.json({ digest: "No news available for digest." })
    }

    // Generate AI digest
    const headlines = articles.slice(0, 10).map((a: any, i: number) =>
      `${i + 1}. ${a.title}`
    ).join("\n")

    const prompt = `You are a news analyst. Summarize the following top news headlines into a brief, engaging digest (3-4 sentences). Focus on the main themes and important stories.

Top Stories:
${headlines}

Provide a concise, informative digest:`

    console.log('[News API] Generating AI digest...')

    try {
      const digest = await gemini(prompt, false)

      if (!digest || digest.trim().length === 0) {
        console.error('[News API] AI returned empty digest')
        // Fallback: Create a simple digest from headlines
        const fallbackDigest = `Today's top stories include: ${articles.slice(0, 3).map((a: any) => a.title).join('; ')}. Stay informed with the latest news updates.`
        return NextResponse.json({ digest: fallbackDigest })
      }

      console.log('[News API] AI digest generated successfully')
      return NextResponse.json({ digest })
    } catch (aiError: any) {
      console.error('[News API] AI generation failed:', aiError.message)
      // Fallback: Create a simple digest from headlines
      const fallbackDigest = `Today's top stories include: ${articles.slice(0, 3).map((a: any) => a.title).join('; ')}. Stay informed with the latest news updates.`
      return NextResponse.json({ digest: fallbackDigest })
    }
  } catch (e: any) {
    console.error("[News API] Digest error:", e.message)
    return NextResponse.json({ digest: "Unable to generate digest at this time." })
  }
}

