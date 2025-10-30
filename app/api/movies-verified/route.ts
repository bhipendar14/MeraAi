import { NextRequest, NextResponse } from "next/server"
import { gemini } from "@/lib/ai-gemini"

const OMDB_API_KEY = "a820102"

// Verified, accurate movie lists for each category (updated October 2024)
const VERIFIED_MOVIE_LISTS = {
  // Current trending movies (2024 releases that are actually popular)
  trending: [
    'Deadpool & Wolverine', 'Inside Out 2', 'Beetlejuice Beetlejuice', 'Alien: Romulus', 'It Ends with Us',
    'Twisters', 'Bad Boys: Ride or Die', 'A Quiet Place: Day One', 'Longlegs', 'Trap',
    'Blink Twice', 'The Substance', 'Smile 2', 'Terrifier 3', 'Venom: The Last Dance'
  ],
  
  // All-time popular movies (verified classics and modern hits)
  popular: [
    'The Dark Knight', 'Inception', 'The Matrix', 'Pulp Fiction', 'The Godfather',
    'Forrest Gump', 'The Shawshank Redemption', 'Fight Club', 'Goodfellas', 'Titanic',
    'Avatar', 'The Avengers', 'Star Wars', 'Jurassic Park', 'The Lord of the Rings'
  ],
  
  // Highest rated movies of all time (IMDb top rated)
  top_rated: [
    'The Shawshank Redemption', 'The Godfather', 'The Dark Knight', 'The Godfather Part II', 'Pulp Fiction',
    'Schindler\'s List', 'The Lord of the Rings: The Return of the King', '12 Angry Men', 'The Good, the Bad and the Ugly',
    'Forrest Gump', 'Fight Club', 'Inception', 'The Lord of the Rings: The Fellowship of the Ring', 'Star Wars: Episode V',
    'Goodfellas'
  ],
  
  // Actually upcoming movies (2025 releases)
  upcoming: [
    'Captain America: Brave New World', 'Thunderbolts', 'Fantastic Four: First Steps', 'Blade', 'Avatar: Fire and Ash',
    'Superman', 'The Batman Part II', 'Mickey 17', 'Ballerina', 'Mission: Impossible 8',
    'Wicked: Part Two', 'Zootopia 2', 'Toy Story 5', 'The Incredibles 3', 'Frozen III'
  ],
  
  // Currently in theaters (October 2024)
  now_playing: [
    'Venom: The Last Dance', 'Smile 2', 'The Wild Robot', 'Terrifier 3', 'Beetlejuice Beetlejuice',
    'Transformers One', 'The Substance', 'Piece by Piece', 'Saturday Night', 'Anora',
    'We Live in Time', 'Conclave', 'Here', 'A Real Pain', 'The Apprentice'
  ],
  
  // Action movies (mix of classic and recent)
  action: [
    'John Wick', 'Mad Max: Fury Road', 'Die Hard', 'The Matrix', 'Mission: Impossible',
    'Terminator 2', 'The Dark Knight', 'Gladiator', 'Heat', 'Casino Royale',
    'The Bourne Identity', 'Speed', 'Face/Off', 'Con Air', 'The Rock'
  ],
  
  // Comedy movies
  comedy: [
    'Superbad', 'The Hangover', 'Anchorman', 'Dumb and Dumber', 'Ghostbusters',
    'Coming to America', 'Meet the Parents', 'Zoolander', 'Dodgeball', 'Wedding Crashers',
    'Step Brothers', 'Tropic Thunder', 'Pineapple Express', 'This Is the End', 'Knocked Up'
  ],
  
  // Horror movies
  horror: [
    'The Exorcist', 'Halloween', 'A Nightmare on Elm Street', 'The Shining', 'Scream',
    'It', 'Hereditary', 'Get Out', 'The Conjuring', 'Insidious',
    'Paranormal Activity', 'The Ring', 'Friday the 13th', 'Child\'s Play', 'Poltergeist'
  ],
  
  // Romance movies
  romance: [
    'Titanic', 'The Notebook', 'Casablanca', 'When Harry Met Sally', 'Pretty Woman',
    'Ghost', 'Dirty Dancing', 'The Princess Bride', 'Roman Holiday', 'Sleepless in Seattle',
    'You\'ve Got Mail', 'Love Actually', 'The Holiday', 'Notting Hill', 'Four Weddings and a Funeral'
  ],
  
  // Sci-Fi movies
  sci_fi: [
    'Star Wars', 'Blade Runner', 'The Matrix', 'Inception', 'Interstellar',
    'Alien', 'Back to the Future', 'E.T.', 'Close Encounters of the Third Kind', 'The Terminator',
    'Dune', 'Avatar', 'Minority Report', 'Total Recall', 'The Fifth Element'
  ]
}

async function getVerifiedMovies(category: string) {
  const movieTitles = VERIFIED_MOVIE_LISTS[category as keyof typeof VERIFIED_MOVIE_LISTS] || VERIFIED_MOVIE_LISTS.popular
  const movies: any[] = []
  
  console.log(`[Verified Movies API] Fetching ${movieTitles.length} verified movies for ${category}`)
  
  // Fetch real data for each verified movie
  for (let i = 0; i < Math.min(movieTitles.length, 15); i++) {
    try {
      const title = movieTitles[i]
      const url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}&plot=short`
      
      console.log(`[Verified Movies API] [${i+1}/15] Fetching: ${title}`)
      
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.Response === 'True' && data.Type === 'movie') {
          const movie = {
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
            original_language: data.Language?.split(',')[0] || 'en',
            category: category,
            director: data.Director || 'Unknown',
            actors: data.Actors || 'Unknown',
            runtime: data.Runtime || 'Unknown',
            rated: data.Rated || 'Not Rated',
            awards: data.Awards || 'N/A',
            boxOffice: data.BoxOffice || 'N/A'
          }
          
          movies.push(movie)
          console.log(`[Verified Movies API] ✅ Added: ${data.Title} (${data.Year}) - Rating: ${data.imdbRating}`)
        } else {
          console.log(`[Verified Movies API] ❌ Not found: ${title}`)
        }
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 150))

    } catch (error) {
      console.error(`[Verified Movies API] Error with ${movieTitles[i]}:`, error)
    }
  }
  
  return movies
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category") || "trending"

  console.log(`[Verified Movies API] Fetching verified ${category} movies...`)

  try {
    const movies = await getVerifiedMovies(category)
    console.log(`[Verified Movies API] Successfully fetched ${movies.length} movies for ${category}`)

    // Generate AI summary with verified movie data
    let summary = `Discover the best ${category.replace('_', ' ')} movies right now!`
    
    if (movies.length > 0) {
      try {
        const summaryPrompt = `Summarize these ${category.replace('_', ' ')} movies in 2-3 engaging sentences. Focus on what makes these movies special and popular.

Movies:
${movies.slice(0, 5).map((m: any) => `- "${m.title}" (${m.release_date}) - Rating: ${m.vote_average}/10 - ${m.overview.substring(0, 100)}...`).join('\n')}`

        console.log(`[Verified Movies API] Generating AI summary for ${category}...`)
        summary = await gemini(summaryPrompt, true)
        console.log(`[Verified Movies API] AI summary generated successfully`)
      } catch (e) {
        console.error("[Verified Movies API] Failed to generate AI summary:", e)
        const topMovies = movies.slice(0, 3).map((m: any) => m.title).join(", ")
        summary = `The ${category.replace('_', ' ')} collection features incredible films like ${topMovies} and many more. These movies represent the pinnacle of cinema with their compelling stories, outstanding performances, and lasting impact on audiences worldwide.`
      }
    }

    return NextResponse.json({
      items: movies,
      summary,
      category,
      total: movies.length,
      source: "Verified curated lists + OMDb data",
      last_updated: "October 2024"
    })

  } catch (error: any) {
    console.error('[Verified Movies API] Error:', error)
    return NextResponse.json({
      items: [],
      summary: `Unable to load ${category} movies at the moment. Please try again later.`,
      error: error.message,
      category,
      total: 0
    }, { status: 500 })
  }
}