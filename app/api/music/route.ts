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

// Fallback high-quality offline tracks
const FALLBACK_TRACKS: Record<string, Track[]> = {
    trending: [
        {
            id: "fallback-trending-1",
            title: "Blinding Lights",
            artist: "The Weeknd",
            album: "After Hours",
            image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop",
            preview_url: null,
            spotify_url: "https://open.spotify.com/track/0VjIjW4GlmCwq5v2kCUSik",
            duration: 200040,
            year: "2020",
            genre: "trending",
            category: "trending"
        },
        {
            id: "fallback-trending-2",
            title: "Shape of You",
            artist: "Ed Sheeran",
            album: "÷ (Deluxe)",
            image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
            preview_url: null,
            spotify_url: "https://open.spotify.com/track/7qiZjo2v65Qr80m2Iefs2m",
            duration: 233712,
            year: "2017",
            genre: "trending",
            category: "trending"
        },
        {
            id: "fallback-trending-3",
            title: "As It Was",
            artist: "Harry Styles",
            album: "Harry's House",
            image: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&h=300&fit=crop",
            preview_url: null,
            spotify_url: "https://open.spotify.com/track/4D7wQ4XPN3IQn4VKIvj1gX",
            duration: 167303,
            year: "2022",
            genre: "trending",
            category: "trending"
        },
        {
            id: "fallback-trending-4",
            title: "Cruel Summer",
            artist: "Taylor Swift",
            album: "Lover",
            image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop",
            preview_url: null,
            spotify_url: "https://open.spotify.com/track/1BxfEX2gvl2RPjLgSTZ4uR",
            duration: 178426,
            year: "2019",
            genre: "trending",
            category: "trending"
        },
        {
            id: "fallback-trending-5",
            title: "Flowers",
            artist: "Miley Cyrus",
            album: "Endless Summer Vacation",
            image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop",
            preview_url: null,
            spotify_url: "https://open.spotify.com/track/0y457Nspv2816694m47xh8",
            duration: 200455,
            year: "2023",
            genre: "trending",
            category: "trending"
        },
        {
            id: "fallback-trending-6",
            title: "Stay",
            artist: "The Kid LAROI, Justin Bieber",
            album: "F*CK LOVE 3: OVER YOU",
            image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop",
            preview_url: null,
            spotify_url: "https://open.spotify.com/track/5ocUzXjS6QhD216a7ur5s0",
            duration: 141805,
            year: "2021",
            genre: "trending",
            category: "trending"
        }
    ],
    pop: [
        {
            id: "fallback-pop-1",
            title: "Levitating",
            artist: "Dua Lipa",
            album: "Future Nostalgia",
            image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&h=300&fit=crop",
            preview_url: null,
            spotify_url: "https://open.spotify.com/track/39LLxExzy6HrmG2hkbuFFC",
            duration: 203064,
            year: "2020",
            genre: "pop",
            category: "pop"
        },
        {
            id: "fallback-pop-2",
            title: "Bad Habits",
            artist: "Ed Sheeran",
            album: "= (Equal)",
            image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
            preview_url: null,
            spotify_url: "https://open.spotify.com/track/37ZJwqUyvJdugzi3j73wHF",
            duration: 231041,
            year: "2021",
            genre: "pop",
            category: "pop"
        },
        {
            id: "fallback-pop-3",
            title: "Watermelon Sugar",
            artist: "Harry Styles",
            album: "Fine Line",
            image: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&h=300&fit=crop",
            preview_url: null,
            spotify_url: "https://open.spotify.com/track/6Uel4q5xbrImKbq2Xj6HXT",
            duration: 174000,
            year: "2019",
            genre: "pop",
            category: "pop"
        },
        {
            id: "fallback-pop-4",
            title: "Anti-Hero",
            artist: "Taylor Swift",
            album: "Midnights",
            image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop",
            preview_url: null,
            spotify_url: "https://open.spotify.com/track/0V3wN9qRzrjKAp4YrA6R3g",
            duration: 200690,
            year: "2022",
            genre: "pop",
            category: "pop"
        }
    ],
    hip_hop: [
        {
            id: "fallback-hiphop-1",
            title: "SICKO MODE",
            artist: "Travis Scott",
            album: "ASTROWORLD",
            image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&h=300&fit=crop",
            preview_url: null,
            spotify_url: "https://open.spotify.com/track/2EEeDO81Zt618v6Zg5zrR7",
            duration: 312820,
            year: "2018",
            genre: "hip_hop",
            category: "hip_hop"
        },
        {
            id: "fallback-hiphop-2",
            title: "HUMBLE.",
            artist: "Kendrick Lamar",
            album: "DAMN.",
            image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop",
            preview_url: null,
            spotify_url: "https://open.spotify.com/track/7KXj2qV7w8n545Br5t2g8k",
            duration: 177000,
            year: "2017",
            genre: "hip_hop",
            category: "hip_hop"
        },
        {
            id: "fallback-hiphop-3",
            title: "God's Plan",
            artist: "Drake",
            album: "Scorpion",
            image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop",
            preview_url: null,
            spotify_url: "https://open.spotify.com/track/6DCZie21yWPFH6J60w01UI",
            duration: 198973,
            year: "2018",
            genre: "hip_hop",
            category: "hip_hop"
        },
        {
            id: "fallback-hiphop-4",
            title: "Starboy",
            artist: "The Weeknd, Daft Punk",
            album: "Starboy",
            image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop",
            preview_url: null,
            spotify_url: "https://open.spotify.com/track/7mxKG0V1YIwN56CcgvxPkz",
            duration: 230453,
            year: "2016",
            genre: "hip_hop",
            category: "hip_hop"
        }
    ],
    most_liked: [
        {
            id: "fallback-liked-1",
            title: "Someone You Loved",
            artist: "Lewis Capaldi",
            album: "Divinely Uninspired to a Hellish Extent",
            image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop",
            preview_url: null,
            spotify_url: "https://open.spotify.com/track/7qEHYZzo2g2Q418W2e48y0",
            duration: 182160,
            year: "2018",
            genre: "most_liked",
            category: "most_liked"
        },
        {
            id: "fallback-liked-2",
            title: "Perfect",
            artist: "Ed Sheeran",
            album: "÷ (Deluxe)",
            image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
            preview_url: null,
            spotify_url: "https://open.spotify.com/track/0tgGo55zsyu7t7f9q67N03",
            duration: 263400,
            year: "2017",
            genre: "most_liked",
            category: "most_liked"
        }
    ],
    viral: [
        {
            id: "fallback-viral-1",
            title: "Espresso",
            artist: "Sabrina Carpenter",
            album: "Short n' Sweet",
            image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&h=300&fit=crop",
            preview_url: null,
            spotify_url: "https://open.spotify.com/track/24I6435b6c38b259T8b8c8",
            duration: 175450,
            year: "2024",
            genre: "viral",
            category: "viral"
        },
        {
            id: "fallback-viral-2",
            title: "Gata Only",
            artist: "FloyyMenor, Cris Mj",
            album: "Gata Only",
            image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&h=300&fit=crop",
            preview_url: null,
            spotify_url: "https://open.spotify.com/track/6XjDF6nd4ycRz9i8T6b8c8",
            duration: 222000,
            year: "2024",
            genre: "viral",
            category: "viral"
        }
    ],
    new_releases: [
        {
            id: "fallback-new-1",
            title: "Fortnight",
            artist: "Taylor Swift, Post Malone",
            album: "THE TORTURED POETS DEPARTMENT",
            image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop",
            preview_url: null,
            spotify_url: "https://open.spotify.com/track/2OIcr2wGvl2RPjLgSTZ4uR",
            duration: 228940,
            year: "2024",
            genre: "new_releases",
            category: "new_releases"
        },
        {
            id: "fallback-new-2",
            title: "LUNCH",
            artist: "Billie Eilish",
            album: "HIT ME HARD AND SOFT",
            image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop",
            preview_url: null,
            spotify_url: "https://open.spotify.com/track/6D3wN9qRzrjKAp4YrA6R3g",
            duration: 180000,
            year: "2024",
            genre: "new_releases",
            category: "new_releases"
        }
    ]
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
        let tracks: Track[] = []
        let summary = ""

        if (query) {
            tracks = await searchSpotifyTracks(query, token)
            if (tracks.length > 0) {
                const topArtists = tracks.slice(0, 3).map(t => t.artist).join(", ")
                summary = `Found ${tracks.length} tracks for "${query}" featuring ${topArtists} and more.`
            } else {
                // Try searching in fallback tracks
                const allTracks = Object.values(FALLBACK_TRACKS).flat()
                const queryLower = query.toLowerCase()
                tracks = allTracks.filter(t => 
                    t.title.toLowerCase().includes(queryLower) || 
                    t.artist.toLowerCase().includes(queryLower) ||
                    t.album.toLowerCase().includes(queryLower)
                ).filter((track, index, self) =>
                    self.findIndex(t => t.id === track.id) === index
                )
                
                if (tracks.length > 0) {
                    summary = `Found ${tracks.length} tracks for "${query}" from offline catalog.`
                } else {
                    summary = `No tracks found for "${query}". Try a different search.`
                }
            }
        } else {
            const playlistId = CATEGORY_PLAYLISTS[category] || CATEGORY_PLAYLISTS.trending
            tracks = await fetchSpotifyPlaylist(playlistId, category, token)
            if (tracks.length === 0) {
                // Fallback category load
                tracks = FALLBACK_TRACKS[category] || FALLBACK_TRACKS.trending
                const topArtists = tracks.slice(0, 3).map(t => t.artist).join(", ")
                summary = `Discover popular ${category.replace('_', ' ')} music featuring ${topArtists} and more (Loaded from offline catalog).`
            } else {
                const topArtists = tracks.slice(0, 3).map(t => t.artist).join(", ")
                summary = `Discover the hottest ${category} music featuring ${topArtists} and more. These tracks are trending worldwide on Spotify.`
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
        // Fallback on token/connection error
        const fallback = FALLBACK_TRACKS[category] || FALLBACK_TRACKS.trending
        const topArtists = fallback.slice(0, 3).map(t => t.artist).join(", ")
        return NextResponse.json({
            tracks: fallback,
            summary: `Discover popular ${category.replace('_', ' ')} music featuring ${topArtists} and more (Loaded from offline catalog).`,
            category,
            total: fallback.length
        })
    }
}
