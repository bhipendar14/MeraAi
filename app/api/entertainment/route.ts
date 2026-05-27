import { type NextRequest, NextResponse } from "next/server"
import { gemini, extractJson } from "@/lib/ai-gemini"

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY_ID
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const OMDB_API_KEY = process.env.OMDB_API_KEY


// Spotify API functions
async function getSpotifyAccessToken(): Promise<string> {
  console.log('[Entertainment API] Getting Spotify access token...')

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
    },
    body: 'grant_type=client_credentials'
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[Entertainment API] Spotify auth error:', errorText)
    throw new Error(`Spotify auth failed: ${response.status}`)
  }

  const data = await response.json()
  console.log('[Entertainment API] Spotify auth successful')
  return data.access_token
}

async function getSpotifyMusicByCategory(category: string) {
  try {
    const token = await getSpotifyAccessToken()
    let tracks: any[] = []

    console.log(`[Entertainment API] Fetching ${category} with token: ${token.substring(0, 20)}...`)

    // Use search API instead of playlists since client credentials don't have access to browse endpoints
    const searchQueries = {
      'trending': 'year:2024 genre:pop',
      'most_liked': 'year:2024 genre:pop,rock',
      'most_viewed': 'year:2024 genre:hip-hop,rap',
      'new_releases': 'year:2024',
      'hip_hop': 'genre:hip-hop,rap',
      'pop': 'genre:pop'
    }

    const query = searchQueries[category as keyof typeof searchQueries] || 'year:2024'

    // Search for tracks
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=50&market=US`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    console.log(`[Entertainment API] ${category} search response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Entertainment API] ${category} search API error: ${response.status} - ${errorText}`)
      throw new Error(`Spotify search API failed: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[Entertainment API] ${category} search found: ${data.tracks?.items?.length || 0} tracks`)

    tracks = data.tracks?.items?.filter((track: any) => track && track.id).map((track: any) => ({
      id: track.id,
      title: track.name,
      artist: track.artists.map((a: any) => a.name).join(', '),
      album: track.album.name,
      image: track.album.images[0]?.url || '',
      preview_url: track.preview_url,
      spotify_url: track.external_urls.spotify,
      duration: track.duration_ms,
      popularity: track.popularity,
      category: category
    })) || []

    // If search doesn't return enough results, try a broader search
    if (tracks.length < 20) {
      console.log(`[Entertainment API] ${category} had few results, trying broader search...`)

      const broadQuery = category === 'new_releases' ? 'year:2024' : 'year:2023,2024'
      const broadResponse = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(broadQuery)}&type=track&limit=50&market=US`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (broadResponse.ok) {
        const broadData = await broadResponse.json()
        const additionalTracks = broadData.tracks?.items?.filter((track: any) => track && track.id).map((track: any) => ({
          id: track.id,
          title: track.name,
          artist: track.artists.map((a: any) => a.name).join(', '),
          album: track.album.name,
          image: track.album.images[0]?.url || '',
          preview_url: track.preview_url,
          spotify_url: track.external_urls.spotify,
          duration: track.duration_ms,
          popularity: track.popularity,
          category: category
        })) || []

        tracks = [...tracks, ...additionalTracks]
      }
    }

    // Filter out invalid tracks and remove duplicates
    const validTracks = tracks.filter((track, index, self) =>
      track.id &&
      track.title &&
      track.artist &&
      self.findIndex(t => t.id === track.id) === index
    ).slice(0, 50) // Limit to 50 tracks

    console.log(`[Entertainment API] Found ${validTracks.length} valid tracks for category: ${category}`)
    return validTracks

  } catch (error) {
    console.error(`[Entertainment API] Error fetching ${category}:`, error)
    // Return empty array instead of fallback data - real data only
    return []
  }
}

// Real Movie API Integration using OMDb only (no TV shows mixed in)
async function getRealMoviesByCategory(category: string) {
  console.log(`[Entertainment API] Fetching REAL movies for category: ${category}`)

  const movies: any[] = []

  // Comprehensive movie lists for each category (20+ movies each)
  const categoryMovies = {
    trending: [
      'Oppenheimer', 'Barbie', 'Top Gun: Maverick', 'Avatar: The Way of Water', 'Black Panther: Wakanda Forever',
      'Spider-Man: No Way Home', 'Jurassic World Dominion', 'Doctor Strange in the Multiverse of Madness',
      'Minions: The Rise of Gru', 'Thor: Love and Thunder', 'The Batman', 'Sonic the Hedgehog 2',
      'John Wick: Chapter 4', 'Scream VI', 'Creed III', 'Fast X', 'Guardians of the Galaxy Vol. 3',
      'The Flash', 'Transformers: Rise of the Beasts', 'Spider-Man: Across the Spider-Verse'
    ],
    popular: [
      'The Dark Knight', 'Inception', 'The Matrix', 'Pulp Fiction', 'The Godfather',
      'Forrest Gump', 'The Shawshank Redemption', 'Fight Club', 'Goodfellas', 'The Lord of the Rings',
      'Star Wars', 'Jurassic Park', 'Titanic', 'Avatar', 'The Avengers', 'Iron Man', 'Spider-Man',
      'Batman Begins', 'Gladiator', 'The Departed'
    ],
    top_rated: [
      'The Shawshank Redemption', 'The Godfather', 'The Dark Knight', 'Pulp Fiction', 'Forrest Gump',
      'Inception', 'The Matrix', 'Goodfellas', 'The Silence of the Lambs', 'Saving Private Ryan',
      'Schindler\'s List', 'The Departed', 'Fight Club', 'The Lord of the Rings', 'Star Wars: A New Hope',
      'Casablanca', 'Citizen Kane', 'Vertigo', 'Psycho', 'Sunset Boulevard'
    ],
    upcoming: [
      'Dune: Part Two', 'Guardians of the Galaxy Vol. 3', 'Fast X', 'The Flash',
      'Transformers: Rise of the Beasts', 'Spider-Man: Across the Spider-Verse', 'John Wick: Chapter 4',
      'Scream VI', 'Ant-Man and the Wasp: Quantumania', 'The Little Mermaid', 'Elemental',
      'The Nun II', 'A Haunting in Venice', 'The Equalizer 3', 'Blue Beetle', 'Gran Turismo',
      'The Creator', 'Killers of the Flower Moon', 'Napoleon', 'Aquaman 2'
    ],
    now_playing: [
      'The Super Mario Bros. Movie', 'Scream VI', 'Creed III', 'Cocaine Bear', 'Ant-Man and the Wasp: Quantumania',
      'Avatar: The Way of Water', 'Puss in Boots: The Last Wish', 'M3GAN', 'A Man Called Otto', 'Knock at the Cabin',
      'Jesus Revolution', 'Shazam! Fury of the Gods', '65', 'Champions', 'Air', 'Renfield', 'The Pope\'s Exorcist',
      'Dungeons & Dragons: Honor Among Thieves', 'Evil Dead Rise', 'Fast X'
    ],
    action: [
      'John Wick', 'Mad Max: Fury Road', 'Die Hard', 'The Matrix', 'Mission: Impossible',
      'Terminator 2', 'The Dark Knight', 'Gladiator', 'Heat', 'Casino Royale', 'The Bourne Identity',
      'Lethal Weapon', 'Rambo', 'Predator', 'Aliens', 'Speed', 'Face/Off', 'Con Air', 'The Rock',
      'Bad Boys', 'Rush Hour'
    ],
    comedy: [
      'Superbad', 'The Hangover', 'Anchorman', 'Dumb and Dumber', 'Ghostbusters', 'Coming to America',
      'Rush Hour', 'Meet the Parents', 'Zoolander', 'Dodgeball', 'Wedding Crashers', 'Step Brothers',
      'Tropic Thunder', 'Pineapple Express', 'This Is the End', 'Knocked Up', '40-Year-Old Virgin',
      'Talladega Nights', 'Blades of Glory', 'Old School'
    ],
    horror: [
      'The Exorcist', 'Halloween', 'A Nightmare on Elm Street', 'The Shining', 'Scream', 'It',
      'Hereditary', 'Get Out', 'The Conjuring', 'Insidious', 'Paranormal Activity', 'The Ring',
      'Friday the 13th', 'Child\'s Play', 'Poltergeist', 'The Omen', 'Rosemary\'s Baby', 'The Babadook',
      'Midsommar', 'Us', 'A Quiet Place'
    ],
    romance: [
      'Titanic', 'The Notebook', 'Casablanca', 'When Harry Met Sally', 'Pretty Woman', 'Ghost',
      'Dirty Dancing', 'The Princess Bride', 'Roman Holiday', 'Sleepless in Seattle', 'You\'ve Got Mail',
      'Love Actually', 'The Holiday', 'Notting Hill', 'Four Weddings and a Funeral', 'Bridget Jones\'s Diary',
      'Jerry Maguire', 'Eternal Sunshine of the Spotless Mind', 'Before Sunrise', 'The Fault in Our Stars',
      'La La Land'
    ],
    sci_fi: [
      'Star Wars', 'Blade Runner', 'The Matrix', 'Inception', 'Interstellar', 'Alien',
      'Back to the Future', 'E.T.', 'Close Encounters of the Third Kind', 'The Terminator', 'Dune', 'Avatar',
      'Minority Report', 'Total Recall', 'The Fifth Element', 'District 9', 'Ex Machina', 'Arrival',
      'Gravity', 'The Martian', 'Star Trek'
    ]
  }

  const movieTitles = categoryMovies[category as keyof typeof categoryMovies] || categoryMovies.popular
  console.log(`[Entertainment API] Processing ${movieTitles.length} movies for ${category}`)

  // Process movies in smaller batches to avoid timeouts
  const batchSize = 5
  const maxMovies = Math.min(movieTitles.length, 20)

  for (let i = 0; i < maxMovies; i += batchSize) {
    const batch = movieTitles.slice(i, Math.min(i + batchSize, maxMovies))
    console.log(`[Entertainment API] Processing batch ${Math.floor(i / batchSize) + 1}: ${batch.join(', ')}`)

    const batchPromises = batch.map(async (title, index) => {
      try {
        const omdbUrl = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}&plot=short`

        const omdbResponse = await fetch(omdbUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'MeraAI-Entertainment-App/1.0'
          },
          signal: AbortSignal.timeout(5000) // 5 second timeout
        })

        if (omdbResponse.ok) {
          const movieData = await omdbResponse.json()

          if (movieData.Response === 'True' && movieData.Type === 'movie') {
            return {
              id: movieData.imdbID,
              title: movieData.Title,
              overview: movieData.Plot || 'No plot available',
              poster: movieData.Poster !== 'N/A' ? movieData.Poster : '',
              backdrop: movieData.Poster !== 'N/A' ? movieData.Poster : '',
              release_date: movieData.Year,
              vote_average: movieData.imdbRating !== 'N/A' ? parseFloat(movieData.imdbRating) : 0,
              vote_count: movieData.imdbVotes !== 'N/A' ? parseInt(movieData.imdbVotes.replace(/,/g, '')) : 0,
              popularity: movieData.imdbRating !== 'N/A' ? parseFloat(movieData.imdbRating) * 10 : 0,
              genre_ids: movieData.Genre ? movieData.Genre.split(', ') : [],
              adult: movieData.Rated === 'R' || movieData.Rated === 'NC-17',
              original_language: movieData.Language?.split(',')[0] || 'en',
              category: category,
              director: movieData.Director || 'Unknown',
              actors: movieData.Actors || 'Unknown',
              runtime: movieData.Runtime || 'Unknown',
              rated: movieData.Rated || 'Not Rated',
              awards: movieData.Awards || 'N/A',
              boxOffice: movieData.BoxOffice || 'N/A',
              country: movieData.Country || 'Unknown'
            }
          }
        }
        return null
      } catch (error) {
        console.error(`[Entertainment API] Error fetching ${title}:`, error)
        return null
      }
    })

    try {
      const batchResults = await Promise.allSettled(batchPromises)
      const validMovies = batchResults
        .filter(result => result.status === 'fulfilled' && result.value !== null)
        .map(result => (result as PromiseFulfilledResult<any>).value)

      movies.push(...validMovies)
      console.log(`[Entertainment API] Batch completed: ${validMovies.length} movies added`)

      // Small delay between batches
      if (i + batchSize < maxMovies) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.error(`[Entertainment API] Batch error:`, error)
    }
  }

  console.log(`[Entertainment API] 🎬 Total fetched: ${movies.length} movies for category: ${category}`)
  return movies.filter(movie => movie && movie.title && movie.overview && movie.id)
}
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") || "youtube"
  const category = searchParams.get("category") || "trending"
  const searchQuery = searchParams.get("q") // Add search query support

  console.log(`[Entertainment API] Request for type: ${type}, category: ${category}, query: ${searchQuery}`)

  try {
    if (type === "movies") {
      // MOVIES SECTION - Real OMDb Data with Categories
      console.log(`[Entertainment API] Fetching ${category} movies from OMDb...`)

      let movies: any[] = []
      let summary = `Discover the best ${category.replace('_', ' ')} movies right now!`

      try {
        console.log(`[Entertainment API] Starting movie fetch for ${category}`)
        movies = await getRealMoviesByCategory(category)
        console.log(`[Entertainment API] Movie fetch completed: ${movies.length} movies`)

        // If no movies returned, try a simple direct fetch
        if (movies.length === 0) {
          console.log(`[Entertainment API] No movies returned, trying direct fetch...`)
          const testMovies = ['Oppenheimer', 'Barbie', 'John Wick', 'The Dark Knight', 'Inception']

          for (const title of testMovies.slice(0, 3)) {
            try {
              const url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}&plot=short`
              const response = await fetch(url, {
                headers: { 'Accept': 'application/json' },
                signal: AbortSignal.timeout(3000)
              })

              if (response.ok) {
                const data = await response.json()
                if (data.Response === 'True' && data.Type === 'movie') {
                  movies.push({
                    id: data.imdbID,
                    title: data.Title,
                    overview: data.Plot || 'No plot available',
                    poster: data.Poster !== 'N/A' ? data.Poster : '',
                    backdrop: data.Poster !== 'N/A' ? data.Poster : '',
                    release_date: data.Year,
                    vote_average: data.imdbRating !== 'N/A' ? parseFloat(data.imdbRating) : 0,
                    vote_count: data.imdbVotes !== 'N/A' ? parseInt(data.imdbVotes.replace(/,/g, '')) : 0,
                    popularity: data.imdbRating !== 'N/A' ? parseFloat(data.imdbRating) * 10 : 0,
                    genre_ids: data.Genre ? data.Genre.split(', ') : [],
                    adult: data.Rated === 'R' || data.Rated === 'NC-17',
                    original_language: 'en',
                    category: category,
                    director: data.Director || 'Unknown',
                    actors: data.Actors || 'Unknown',
                    runtime: data.Runtime || 'Unknown',
                    rated: data.Rated || 'Not Rated'
                  })
                  console.log(`[Entertainment API] Direct fetch added: ${data.Title}`)
                }
              }
            } catch (error) {
              console.error(`[Entertainment API] Direct fetch error for ${title}:`, error)
            }
          }
        }

        // Generate AI summary for movies category
        if (movies.length > 0) {
          try {
            const summaryPrompt = `Summarize these ${category.replace('_', ' ')} movies in 2-3 engaging sentences. Focus on what's popular and exciting in cinema right now.
Movies:
${movies
                .slice(0, 5)
                .map((m: any) => `- "${m.title}" (${m.release_date || 'TBA'}) - Rating: ${m.vote_average}/10`)
                .join("\n")}`

            console.log(`[Entertainment API] Generating AI summary for ${category} movies...`)
            summary = await gemini(summaryPrompt, true)
          } catch (e) {
            console.error("[Entertainment API] Failed to generate movies summary:", e)
            const topMovies = movies.slice(0, 3).map((m: any) => m.title).join(", ")
            summary = `The ${category.replace('_', ' ')} movie scene is dominated by incredible films like ${topMovies} and many more. These movies are captivating audiences worldwide with their compelling stories, stunning visuals, and outstanding performances.`
          }
        }
      } catch (error) {
        console.error(`[Entertainment API] Error fetching movies:`, error)
        // Return empty array but don't throw error
        movies = []
        summary = `Unable to load ${category.replace('_', ' ')} movies at the moment. Please try again later.`
      }

      return NextResponse.json({
        items: movies,
        summary,
        category,
        total: movies.length
      })

    } else if (type === "music") {
      // MUSIC SECTION - Real Spotify Data with Categories or Search
      console.log(`[Entertainment API] Fetching music - query: ${searchQuery}, category: ${category}`)

      const FALLBACK_TRACKS: Record<string, any[]> = {
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
            popularity: 96,
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
            popularity: 88,
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
            popularity: 92,
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
            popularity: 95,
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
            popularity: 90,
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
            popularity: 89,
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
            popularity: 87,
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
            popularity: 85,
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
            popularity: 89,
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
            popularity: 91,
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
            popularity: 88,
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
            popularity: 89,
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
            popularity: 90,
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
            popularity: 92,
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
            popularity: 88,
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
            popularity: 89,
            category: "most_liked"
          }
        ],
        most_viewed: [
          {
            id: "fallback-viewed-1",
            title: "SICKO MODE",
            artist: "Travis Scott",
            album: "ASTROWORLD",
            image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&h=300&fit=crop",
            preview_url: null,
            spotify_url: "https://open.spotify.com/track/2EEeDO81Zt618v6Zg5zrR7",
            duration: 312820,
            popularity: 88,
            category: "most_viewed"
          },
          {
            id: "fallback-viewed-2",
            title: "HUMBLE.",
            artist: "Kendrick Lamar",
            album: "DAMN.",
            image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop",
            preview_url: null,
            spotify_url: "https://open.spotify.com/track/7KXj2qV7w8n545Br5t2g8k",
            duration: 177000,
            popularity: 89,
            category: "most_viewed"
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
            popularity: 97,
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
            popularity: 94,
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
            popularity: 93,
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
            popularity: 95,
            category: "new_releases"
          }
        ]
      }

      let tracks: any[] = []
      let summary = `Discover the hottest ${category.replace('_', ' ')} music right now!`

      try {
        // If search query provided, search Spotify directly
        if (searchQuery) {
          try {
            const token = await getSpotifyAccessToken()
            const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=50&market=US`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.ok) {
              const data = await response.json()
              tracks = data.tracks?.items?.filter((track: any) => track && track.id).map((track: any) => ({
                id: track.id,
                title: track.name,
                artist: track.artists.map((a: any) => a.name).join(', '),
                album: track.album.name,
                image: track.album.images[0]?.url || '',
                preview_url: track.preview_url,
                spotify_url: track.external_urls.spotify,
                duration: track.duration_ms,
                popularity: track.popularity,
                category: 'search'
              })) || []

              summary = tracks.length > 0
                ? `Found ${tracks.length} tracks for "${searchQuery}"`
                : `No tracks found for "${searchQuery}"`
            }
          } catch (searchError) {
            console.error('[Entertainment API] Spotify live search failed:', searchError)
          }

          // Fallback search in offline catalog
          if (tracks.length === 0) {
            const allTracks = Object.values(FALLBACK_TRACKS).flat()
            const queryLower = searchQuery.toLowerCase()
            tracks = allTracks.filter(t => 
              t.title.toLowerCase().includes(queryLower) || 
              t.artist.toLowerCase().includes(queryLower) ||
              t.album.toLowerCase().includes(queryLower)
            ).filter((track, index, self) =>
              self.findIndex(t => t.id === track.id) === index
            )
            summary = `Found ${tracks.length} curated tracks for "${searchQuery}" from offline catalog.`
          }
        } else {
          // Use category-based fetch
          tracks = await getSpotifyMusicByCategory(category)

          // Fallback if Spotify API fails or returns no items
          if (tracks.length === 0) {
            console.warn(`[Entertainment API] Spotify API failed for category: ${category}. Loading fallback catalog.`)
            tracks = FALLBACK_TRACKS[category] || FALLBACK_TRACKS.trending
            const topArtists = tracks.slice(0, 3).map((t: any) => t.artist).join(", ")
            summary = `Curated ${category.replace('_', ' ')} music featuring ${topArtists} and more (Loaded from offline catalog).`
          } else {
            // Generate AI summary for music category
            if (tracks.length > 0) {
              try {
                const summaryPrompt = `Summarize these ${category.replace('_', ' ')} music tracks in 2-3 engaging sentences. Focus on what's popular in this category right now.
Tracks:
${tracks
                    .slice(0, 5)
                    .map((t: any) => `- "${t.title}" by ${t.artist} (Popularity: ${t.popularity}/100)`)
                    .join("\n")}`

                console.log(`[Entertainment API] Generating AI summary for ${category} music...`)
                summary = await gemini(summaryPrompt, true)
              } catch (e) {
                console.error("[Entertainment API] Failed to generate music summary:", e)
                const topArtists = tracks.slice(0, 3).map((t: any) => t.artist).join(", ")
                summary = `The ${category.replace('_', ' ')} music scene is dominated by incredible tracks from artists like ${topArtists} and many more. These songs are capturing listeners worldwide with their innovative sounds and compelling performances.`
              }
            }
          }
        }
      } catch (error) {
        console.error(`[Entertainment API] Error fetching music:`, error)
        tracks = FALLBACK_TRACKS[category] || FALLBACK_TRACKS.trending
        const topArtists = tracks.slice(0, 3).map((t: any) => t.artist).join(", ")
        summary = `Curated ${category.replace('_', ' ')} music featuring ${topArtists} and more (Loaded from offline catalog).`
      }

      return NextResponse.json({
        items: tracks,
        summary,
        category: searchQuery ? 'search' : category,
        total: tracks.length
      })

    } else {
      // YOUTUBE SECTION
      console.log("[Entertainment API] Fetching live YouTube data...")

      let videos: any[] = []
      let summary = "Trending videos on YouTube right now."

      try {
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=US&maxResults=12&key=${YOUTUBE_API_KEY}`
        const res = await fetch(url, { cache: "no-store" })

        if (res.ok) {
          const json = await res.json()
          const videoItems = Array.isArray(json.items) ? json.items : []

          videos = videoItems.map((v: any) => ({
            id: v.id,
            title: v.snippet?.title || "",
            channel: v.snippet?.channelTitle || "",
            thumbnail: v.snippet?.thumbnails?.high?.url || v.snippet?.thumbnails?.default?.url || "",
            views: v.statistics?.viewCount || "0",
          }))

          if (videos.length > 0) {
            try {
              const summaryPrompt = `Summarize these trending YouTube videos in 2-3 engaging sentences. Focus on what's popular and viral right now.
Videos:
${videos
                  .slice(0, 5)
                  .map((v: any) => `- ${v.title} by ${v.channel} (${Number(v.views).toLocaleString()} views)`)
                  .join("\n")}`

              console.log("[Entertainment API] Generating AI summary for YouTube...")
              summary = await gemini(summaryPrompt, true)
            } catch (e) {
              console.error("[Entertainment API] Failed to generate YouTube summary:", e)
              const topChannels = videos.slice(0, 3).map((v: any) => v.channel).join(", ")
              summary = `YouTube is buzzing with viral content from creators like ${topChannels} and many others. These trending videos are capturing millions of views with their entertaining, educational, and engaging content that's defining what's popular right now.`
            }
          }
        } else {
          console.error(`[Entertainment API] YouTube API error: ${res.status}`)
          summary = "Unable to load YouTube trending videos at the moment. Please try again later."
        }
      } catch (error) {
        console.error("[Entertainment API] Error fetching YouTube data:", error)
        summary = "Unable to load YouTube trending videos at the moment. Please try again later."
      }

      return NextResponse.json({
        items: videos,
        summary,
        total: videos.length
      })
    }

  } catch (e: any) {
    console.error("[Entertainment API] Unexpected error:", e.message || e)

    return NextResponse.json({
      items: [],
      summary: `Unable to load ${type} data. Please check your internet connection and try again.`,
      error: e.message,
      total: 0
    }, { status: 500 })
  }
}