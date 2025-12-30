import { type NextRequest, NextResponse } from "next/server"

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

interface Track {
    id: string
    title: string
    artist: string
    album: string
    image: string
    preview_url: string | null
    duration: number
    year: string
    genre: string
    category: string
    spotify_url: string
}

// Get Spotify access token
async function getSpotifyAccessToken(): Promise<string> {
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
        },
        body: "grant_type=client_credentials",
        cache: "no-store",
    })

    if (!response.ok) {
        throw new Error("Failed to get Spotify access token")
    }

    const data = await response.json()
    return data.access_token
}

// Spotify playlist IDs for different categories
const CATEGORY_PLAYLISTS: Record<string, string> = {
    trending: "37i9dQZEVXbMDoHDwVN2tF", // Global Top 50
    most_liked: "37i9dQZEVXbLiRSasKsNU9", // Viral 50 Global
    viral: "37i9dQZEVXbLiRSasKsNU9", // Viral 50 Global
    new_releases: "37i9dQZEVXbKuaTI1Z1Afx", // New Music Friday
    hip_hop: "37i9dQZF1DX0XUsuxWHRQd", // RapCaviar
    pop: "37i9dQZF1DXcBWIGoYBM5M", // Today's Top Hits
}

async function fetchSpotifyPlaylist(playlistId: string, category: string, token: string): Promise<Track[]> {
    try {
        const response = await fetch(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=20`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            }
        )

        if (!response.ok) {
            console.error(`Spotify API error: ${response.status}`)
            return []
        }

        const data = await response.json()
        const tracks = data.items || []

        return tracks
            .filter((item: any) => item.track && item.track.id)
            .slice(0, 12)
            .map((item: any) => {
                const track = item.track
                return {
                    id: track.id,
                    title: track.name,
                    artist: track.artists.map((a: any) => a.name).join(", "),
                    album: track.album.name,
                    image: track.album.images[0]?.url || "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop",
                    preview_url: track.preview_url,
                    duration: track.duration_ms,
                    year: track.album.release_date?.split("-")[0] || "Unknown",
                    genre: category,
                    category: category,
                    spotify_url: track.external_urls.spotify,
                }
            })
    } catch (error) {
        console.error(`Error fetching Spotify playlist ${playlistId}:`, error)
        return []
    }
}

async function searchSpotifyTracks(query: string, token: string): Promise<Track[]> {
    try {
        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=12`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            }
        )

        if (!response.ok) {
            return []
        }

        const data = await response.json()
        const tracks = data.tracks?.items || []

        return tracks.map((track: any) => ({
            id: track.id,
            title: track.name,
            artist: track.artists.map((a: any) => a.name).join(", "),
            album: track.album.name,
            image: track.album.images[0]?.url || "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop",
            preview_url: track.preview_url,
            duration: track.duration_ms,
            year: track.album.release_date?.split("-")[0] || "Unknown",
            genre: "search",
            category: "search",
            spotify_url: track.external_urls.spotify,
        }))
    } catch (error) {
        console.error("Error searching Spotify:", error)
        return []
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category") || "trending"
    const query = searchParams.get("q")

    try {
        const token = await getSpotifyAccessToken()
        let tracks: Track[]
        let summary = ""

        if (query) {
            tracks = await searchSpotifyTracks(query, token)
            if (tracks.length > 0) {
                const topArtists = tracks.slice(0, 3).map(t => t.artist).join(", ")
                summary = `Found ${tracks.length} tracks for "${query}" featuring ${topArtists} and more.`
            } else {
                summary = `No tracks found for "${query}". Try a different search.`
            }
        } else {
            const playlistId = CATEGORY_PLAYLISTS[category] || CATEGORY_PLAYLISTS.trending
            tracks = await fetchSpotifyPlaylist(playlistId, category, token)
            if (tracks.length > 0) {
                const topArtists = tracks.slice(0, 3).map(t => t.artist).join(", ")
                summary = `Discover the hottest ${category} music featuring ${topArtists} and more. These tracks are trending worldwide on Spotify.`
            } else {
                summary = `No ${category} music available right now.`
            }
        }

        return NextResponse.json({
            tracks,
            summary,
            category,
            total: tracks.length,
        })
    } catch (error) {
        console.error("Spotify API error:", error)
        return NextResponse.json(
            { tracks: [], summary: "Failed to fetch music from Spotify", category, total: 0, error: "Failed to fetch music" },
            { status: 500 }
        )
    }
}
