import { type NextRequest, NextResponse } from "next/server"

const TMDB_API_KEY = "953183a685bd087ada698b41474f5791"
const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p"

// Genre IDs from TMDB
const GENRE_IDS: Record<string, number> = {
    action: 28,
    comedy: 35,
    horror: 27,
    romance: 10749,
    sci_fi: 878,
    drama: 18,
    thriller: 53,
    animation: 16,
    crime: 80,
    fantasy: 14,
}

interface Movie {
    id: number
    title: string
    overview: string
    poster: string
    backdrop: string
    release_date: string
    vote_average: number
    vote_count: number
    popularity: number
    genre_ids: number[]
    category: string
}

async function fetchMoviesByCategory(category: string): Promise<Movie[]> {
    try {
        let url: string

        switch (category) {
            case "trending":
                url = `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`
                break
            case "popular":
                url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`
                break
            case "top_rated":
                url = `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}`
                break
            case "upcoming":
                url = `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}`
                break
            case "in_theaters":
                url = `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}`
                break
            default:
                // Genre-based search
                const genreId = GENRE_IDS[category]
                if (genreId) {
                    url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`
                } else {
                    url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`
                }
        }

        const response = await fetch(url, { cache: "no-store" })

        if (!response.ok) {
            console.error(`TMDB API error: ${response.status}`)
            return []
        }

        const data = await response.json()
        const movies = data.results || []

        return movies.slice(0, 12).map((movie: any) => ({
            id: movie.id,
            title: movie.title,
            overview: movie.overview || "No description available.",
            poster: movie.poster_path
                ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}`
                : "https://images.unsplash.com/photo-1574267432644-f610a4ab6a5e?w=500&h=750&fit=crop",
            backdrop: movie.backdrop_path
                ? `${TMDB_IMAGE_BASE}/w1280${movie.backdrop_path}`
                : "https://images.unsplash.com/photo-1574267432644-f610a4ab6a5e?w=1280&h=720&fit=crop",
            release_date: movie.release_date || "Unknown",
            vote_average: movie.vote_average || 0,
            vote_count: movie.vote_count || 0,
            popularity: movie.popularity || 0,
            genre_ids: movie.genre_ids || [],
            category: category,
        }))
    } catch (error) {
        console.error(`Error fetching movies for category ${category}:`, error)
        return []
    }
}

async function searchMovies(query: string): Promise<Movie[]> {
    try {
        const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
        const response = await fetch(url, { cache: "no-store" })

        if (!response.ok) {
            return []
        }

        const data = await response.json()
        const movies = data.results || []

        return movies.slice(0, 12).map((movie: any) => ({
            id: movie.id,
            title: movie.title,
            overview: movie.overview || "No description available.",
            poster: movie.poster_path
                ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}`
                : "https://images.unsplash.com/photo-1574267432644-f610a4ab6a5e?w=500&h=750&fit=crop",
            backdrop: movie.backdrop_path
                ? `${TMDB_IMAGE_BASE}/w1280${movie.backdrop_path}`
                : "https://images.unsplash.com/photo-1574267432644-f610a4ab6a5e?w=1280&h=720&fit=crop",
            release_date: movie.release_date || "Unknown",
            vote_average: movie.vote_average || 0,
            vote_count: movie.vote_count || 0,
            popularity: movie.popularity || 0,
            genre_ids: movie.genre_ids || [],
            category: "search",
        }))
    } catch (error) {
        console.error("Error searching movies:", error)
        return []
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category") || "trending"
    const query = searchParams.get("q")

    try {
        let movies: Movie[]

        if (query) {
            movies = await searchMovies(query)
        } else {
            movies = await fetchMoviesByCategory(category)
        }

        return NextResponse.json({
            movies,
            category,
            total: movies.length,
        })
    } catch (error) {
        console.error("Movies API error:", error)
        return NextResponse.json(
            { movies: [], category, total: 0, error: "Failed to fetch movies" },
            { status: 500 }
        )
    }
}
