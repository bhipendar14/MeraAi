import { NextRequest, NextResponse } from 'next/server'

// This endpoint provides accurate movie data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const query = searchParams.get('q') || 'popular'
    
    // Mock accurate movie data
    const movies = [
      {
        id: 1,
        title: "The Shawshank Redemption",
        year: 1994,
        rating: 9.3,
        genre: "Drama",
        director: "Frank Darabont",
        plot: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency."
      },
      {
        id: 2,
        title: "The Godfather",
        year: 1972,
        rating: 9.2,
        genre: "Crime, Drama",
        director: "Francis Ford Coppola",
        plot: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son."
      },
      {
        id: 3,
        title: "The Dark Knight",
        year: 2008,
        rating: 9.0,
        genre: "Action, Crime, Drama",
        director: "Christopher Nolan",
        plot: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests."
      }
    ]
    
    return NextResponse.json({ movies })
  } catch (error) {
    console.error('Error in movies-accurate API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}