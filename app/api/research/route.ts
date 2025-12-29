import { type NextRequest, NextResponse } from "next/server"

// Helper function to detect greeting queries
function isGreeting(query: string): boolean {
    const greetings = [
        'hello', 'hi', 'hey', 'greetings', 'good morning',
        'good afternoon', 'good evening', 'how are you',
        'whats up', 'what\'s up', 'sup', 'howdy', 'hiya',
        'yo', 'hola', 'bonjour', 'namaste', 'salut'
    ]
    const normalized = query.toLowerCase().trim()

    // Check if the entire query is a greeting or starts with one
    return greetings.some(g =>
        normalized === g ||
        normalized.startsWith(g + ' ') ||
        normalized.startsWith(g + ',') ||
        normalized.startsWith(g + '!')
    )
}

export async function POST(req: NextRequest) {
    try {
        const { query, file } = await req.json()

        if (!query) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 })
        }

        console.log("[Research API] Query:", query)
        const isGreetingQuery = isGreeting(query)
        console.log("[Research API] Is Greeting:", isGreetingQuery)

        // For greetings, only fetch AI response (no videos, links, images)
        if (isGreetingQuery) {
            const aiResponse = await getAIResponse(query, file, true)
            return NextResponse.json({
                aiResponse,
                videos: [],
                links: [],
                images: [],
            })
        }

        // For research queries, run all APIs in parallel
        const [aiResponse, videos, links, images] = await Promise.all([
            getAIResponse(query, file, false),
            getYouTubeVideos(query),
            getGoogleLinks(query),
            getGoogleImages(query),
        ])

        console.log("[Research API] Results:", {
            aiResponseLength: aiResponse.length,
            videosCount: videos.length,
            linksCount: links.length,
            imagesCount: images.length,
        })

        return NextResponse.json({
            aiResponse,
            videos,
            links,
            images,
        })
    } catch (error: any) {
        console.error("[Research API] Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// Get AI response from Gemini
async function getAIResponse(query: string, file?: { name: string; type: string; data: string }, isGreeting: boolean = false) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAeQZ8GOxlratY70LSztfCuo2gUkULLZ4s"
    const model = "gemini-2.5-flash-lite"
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`

    // Build parts array for multimodal content
    const parts: any[] = []

    // Add file if provided
    if (file) {
        // Extract base64 data (remove data:image/png;base64, prefix)
        const base64Data = file.data.split(',')[1]
        parts.push({
            inline_data: {
                mime_type: file.type,
                data: base64Data
            }
        })
    }

    // Add text query with context-aware prompting
    if (file) {
        parts.push({
            text: `Analyze this file and answer: ${query}`
        })
    } else if (isGreeting) {
        parts.push({
            text: `Respond to this greeting in a friendly, warm, and concise way (maximum 1-2 sentences): ${query}`
        })
    } else {
        parts.push({
            text: `Provide a clear, concise, and well-structured answer about: ${query}. Keep it brief but informative - aim for 2-3 paragraphs maximum unless the question specifically requires a detailed explanation.`
        })
    }

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts }],
            }),
        })

        if (!res.ok) {
            const errorText = await res.text()
            console.error("[Gemini API] Error response:", errorText)
            return "I'm having trouble generating a response right now. Please try again."
        }

        const data = await res.json()
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response available"
    } catch (error) {
        console.error("[Gemini API] Error:", error)
        return "Sorry, I encountered an error generating a response."
    }
}

// Get YouTube videos
async function getYouTubeVideos(query: string) {
    const apiKey = process.env.YOUTUBE_API_KEY || "AIzaSyBs15zGLY0vtpkZey8EjvHEMwbPKAeBzzc"
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=4&type=video&key=${apiKey}`

    try {
        console.log("[YouTube API] Fetching videos for:", query)
        const res = await fetch(url)

        if (!res.ok) {
            const errorText = await res.text()
            console.error("[YouTube API] Error response:", errorText)
            return []
        }

        const data = await res.json()
        const videos = data.items?.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.medium.url,
            channel: item.snippet.channelTitle,
        })) || []

        console.log("[YouTube API] Found videos:", videos.length)
        return videos
    } catch (error) {
        console.error("[YouTube API] Error:", error)
        return []
    }
}

// Get Google web links
async function getGoogleLinks(query: string) {
    const apiKey = process.env.CUSTOM_SEARCH_API_KEY || "AIzaSyCNEDYF-_R7iFiR2zsizLRg84uozldfvbo"
    const cx = process.env.CUSTOM_SEARCH_ENGINE_ID || "2263b218e4a6c47fd"

    try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=5`
        console.log("[Custom Search API] Fetching links for:", query)
        console.log("[Custom Search API] Using CX:", cx)
        console.log("[Custom Search API] Using API Key:", apiKey ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}` : "NONE")

        const res = await fetch(url)

        if (!res.ok) {
            const errorText = await res.text()
            console.error("[Custom Search API] Error response:", errorText)
            console.error("[Custom Search API] Status:", res.status)
            return []
        }

        const data = await res.json()

        if (data.error) {
            console.error("[Custom Search API] API Error:", data.error)
            return []
        }

        const links = data.items?.map((item: any) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
        })) || []

        console.log("[Custom Search API] Found links:", links.length)
        return links
    } catch (error) {
        console.error("[Custom Search API] Error:", error)
        return []
    }
}

// Get Google images
async function getGoogleImages(query: string) {
    const apiKey = process.env.CUSTOM_SEARCH_API_KEY || "AIzaSyCNEDYF-_R7iFiR2zsizLRg84uozldfvbo"
    const cx = process.env.CUSTOM_SEARCH_ENGINE_ID || "2263b218e4a6c47fd"

    try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&searchType=image&num=6`
        console.log("[Image Search API] Fetching images for:", query)
        console.log("[Image Search API] Using API Key:", apiKey ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}` : "NONE")

        const res = await fetch(url)

        if (!res.ok) {
            const errorText = await res.text()
            console.error("[Image Search API] Error response:", errorText)
            console.error("[Image Search API] Status:", res.status)
            return []
        }

        const data = await res.json()

        if (data.error) {
            console.error("[Image Search API] API Error:", data.error)
            return []
        }

        const images = data.items?.map((item: any) => ({
            link: item.link,
            title: item.title,
            thumbnail: item.image?.thumbnailLink || item.link,
            context: item.image?.contextLink,
        })) || []

        console.log("[Image Search API] Found images:", images.length)
        return images
    } catch (error) {
        console.error("[Image Search API] Error:", error)
        return []
    }
}
