import { type NextRequest, NextResponse } from "next/server"

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY_ID

// Music video categories mapped to search queries
const MUSIC_CATEGORIES: Record<string, string> = {
    trending: "trending music 2024",
    most_liked: "popular music 2024",
    viral: "viral songs 2024",
    new_releases: "new music 2024",
    hip_hop: "hip hop music 2024",
    pop: "pop music 2024",
}

interface MusicTrack {
    id: string
    title: string
    artist: string
    album: string
    image: string
    videoId: string
    duration: string
    views: string
    category: string
}

async function fetchYouTubeMusicVideos(query: string, category: string): Promise<MusicTrack[]> {
    try {
        // Search for music videos
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=20&key=${YOUTUBE_API_KEY}`

        const searchResponse = await fetch(searchUrl, { cache: "no-store" })

        if (!searchResponse.ok) {
            console.error(`YouTube search error: ${searchResponse.status}`)
            return []
        }

        const searchData = await searchResponse.json()
        const videos = searchData.items || []

        if (videos.length === 0) {
            return []
        }

        // Get video details for duration and view count
        const videoIds = videos.map((v: any) => v.id.videoId).join(",")
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`

        const detailsResponse = await fetch(detailsUrl, { cache: "no-store" })
        const detailsData = await detailsResponse.json()
        const videoDetails = detailsData.items || []

        // Combine search results with details
        const tracks: MusicTrack[] = videos.map((video: any, index: number) => {
            const details = videoDetails.find((d: any) => d.id === video.id.videoId)
            const snippet = video.snippet

            // Extract artist from channel name or title
            const artist = snippet.channelTitle || "Unknown Artist"

            return {
                id: video.id.videoId,
                title: snippet.title,
                artist: artist,
                album: category,
                image: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || "",
                videoId: video.id.videoId,
                duration: details?.contentDetails?.duration || "PT0S",
                views: details?.statistics?.viewCount || "0",
                category: category,
            }
        })

        return tracks.slice(0, 12)
    } catch (error) {
        console.error("Error fetching YouTube music:", error)
        return []
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category") || "trending"
    const searchQuery = searchParams.get("q")

    try {
        let tracks: MusicTrack[]
        let query: string

        if (searchQuery) {
            // User search
            query = `${searchQuery} music`
        } else {
            // Category-based
            query = MUSIC_CATEGORIES[category] || MUSIC_CATEGORIES.trending
        }

        tracks = await fetchYouTubeMusicVideos(query, category)

        // Generate AI summary
        let summary = ""
        if (tracks.length > 0) {
            const topArtists = tracks.slice(0, 3).map(t => t.artist).join(", ")
            if (searchQuery) {
                summary = `Found ${tracks.length} music videos for "${searchQuery}" featuring ${topArtists} and more.`
            } else {
                summary = `Discover the hottest ${category} music featuring ${topArtists} and more. These tracks are trending worldwide.`
            }
        } else {
            summary = searchQuery
                ? `No music found for "${searchQuery}". Try a different search.`
                : `No ${category} music available right now.`
        }

        return NextResponse.json({
            tracks,
            summary,
            category,
            total: tracks.length,
        })
    } catch (error) {
        console.error("Music API error:", error)
        return NextResponse.json(
            { tracks: [], summary: "Failed to load music", category, total: 0 },
            { status: 500 }
        )
    }
}
