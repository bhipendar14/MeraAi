"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Play, Music, ExternalLink, Clock, TrendingUp, Heart, Eye, Sparkles, Mic, Radio, Film, Star, Calendar, Users, Zap, Award, Flame, Smile, Ghost, HeartHandshake, Rocket, Gamepad2, Headphones, Monitor, Newspaper, Trophy, GraduationCap, Tv, ThumbsUp } from "lucide-react"

type Video = {
  id: string
  title: string
  channel: string
  thumbnail: string
  views: string
  likes?: string
  publishedAt?: string
  description?: string
  duration?: string
  category?: string
}

type Track = {
  id: string
  title: string
  artist: string
  album: string
  image: string
  preview_url: string | null
  spotify_url: string
  duration: number
  popularity: number
  category: string
}

type Movie = {
  id: string | number
  title: string
  overview: string
  poster: string
  backdrop: string
  release_date: string
  vote_average: number
  vote_count: number
  popularity: number
  genre_ids: string[] | number[]
  adult: boolean
  original_language: string
  category: string
  director?: string
  actors?: string
  runtime?: string
  rated?: string
  awards?: string
  boxOffice?: string
  country?: string
  network?: string
  status?: string
}

type MusicCategory = {
  id: string
  name: string
  icon: any
  description: string
}

const musicCategories: MusicCategory[] = [
  { id: 'trending', name: 'Trending', icon: TrendingUp, description: 'Global Top 50 - Most popular tracks worldwide' },
  { id: 'most_liked', name: 'Most Liked', icon: Heart, description: "Today's Top Hits - Most loved songs" },
  { id: 'most_viewed', name: 'Viral', icon: Eye, description: 'Viral 50 - Most shared and viral tracks' },
  { id: 'new_releases', name: 'New Releases', icon: Sparkles, description: 'Latest releases from top artists' },
  { id: 'hip_hop', name: 'Hip Hop', icon: Mic, description: 'RapCaviar - Best hip hop and rap tracks' },
  { id: 'pop', name: 'Pop', icon: Radio, description: 'Pop Rising - Hottest pop music' }
]

type MovieCategory = {
  id: string
  name: string
  icon: any
  description: string
}

const movieCategories: MovieCategory[] = [
  { id: 'trending', name: 'Trending', icon: TrendingUp, description: 'Most popular movies this week' },
  { id: 'popular', name: 'Popular', icon: Flame, description: 'Most popular movies right now' },
  { id: 'top_rated', name: 'Top Rated', icon: Award, description: 'Highest rated movies of all time' },
  { id: 'upcoming', name: 'Upcoming', icon: Calendar, description: 'Coming soon to theaters' },
  { id: 'now_playing', name: 'In Theaters', icon: Film, description: 'Currently playing in theaters' },
  { id: 'action', name: 'Action', icon: Zap, description: 'High-octane action movies' },
  { id: 'comedy', name: 'Comedy', icon: Smile, description: 'Laugh-out-loud comedies' },
  { id: 'horror', name: 'Horror', icon: Ghost, description: 'Spine-chilling horror films' },
  { id: 'romance', name: 'Romance', icon: HeartHandshake, description: 'Romantic movies and love stories' },
  { id: 'sci_fi', name: 'Sci-Fi', icon: Rocket, description: 'Science fiction and futuristic films' }
]

export function EntertainmentGrid() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [movies, setMovies] = useState<Movie[]>([])
  const [musicSummary, setMusicSummary] = useState("")
  const [movieSummary, setMovieSummary] = useState("")
  const [loading, setLoading] = useState(true)
  const [musicLoading, setMusicLoading] = useState(false)
  const [movieLoading, setMovieLoading] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [selectedMusicCategory, setSelectedMusicCategory] = useState('trending')
  const [selectedMovieCategory, setSelectedMovieCategory] = useState('trending')
  const [trackCount, setTrackCount] = useState(0)
  const [movieCount, setMovieCount] = useState(0)

  // Load initial data
  useEffect(() => {
    setLoading(false)
  }, [])

  // Load music data when category changes
  useEffect(() => {
    loadMusicCategory(selectedMusicCategory)
  }, [selectedMusicCategory])

  // Load movies data when category changes
  useEffect(() => {
    loadMovieCategory(selectedMovieCategory)
  }, [selectedMovieCategory])

  const loadMusicCategory = async (category: string) => {
    setMusicLoading(true)
    try {
      const response = await fetch(`/api/entertainment?type=music&category=${category}`)
      const musicData = await response.json()

      console.log(`Music data for ${category}:`, musicData)
      setTracks(musicData.items || [])
      setMusicSummary(musicData.summary || "")
      setTrackCount(musicData.total || 0)
    } catch (error) {
      console.error(`Music API error for ${category}:`, error)
      setMusicSummary(`Unable to load ${category} music data.`)
    } finally {
      setMusicLoading(false)
    }
  }

  const loadMovieCategory = async (category: string) => {
    setMovieLoading(true)
    try {
      // Use the verified movies API with curated accurate data
      const response = await fetch(`/api/movies-verified?category=${category}`)
      const movieData = await response.json()

      console.log(`Movie data for ${category}:`, movieData)
      setMovies(movieData.items || [])
      setMovieSummary(movieData.summary || "")
      setMovieCount(movieData.total || 0)
    } catch (error) {
      console.error(`Movie API error for ${category}:`, error)
      setMovieSummary(`Unable to load ${category} movie data.`)
    } finally {
      setMovieLoading(false)
    }
  }

  const playPreview = (previewUrl: string) => {
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
    }

    // Play new audio
    const audio = new Audio(previewUrl)
    audio.play().catch(e => console.error('Audio play failed:', e))
    setCurrentAudio(audio)

    // Auto-stop after 30 seconds
    setTimeout(() => {
      audio.pause()
      if (currentAudio === audio) setCurrentAudio(null)
    }, 30000)
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-muted-foreground">Loading entertainment...</div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted/30 h-48 rounded-md mb-3"></div>
              <div className="bg-muted/30 h-4 rounded mb-2"></div>
              <div className="bg-muted/30 h-3 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Tabs defaultValue="music" className="w-full">
      <TabsList className="grid w-full max-w-lg grid-cols-3">
        <TabsTrigger value="music" className="flex items-center gap-2">
          <Music className="w-4 h-4" />
          Music
        </TabsTrigger>
        <TabsTrigger value="youtube" className="flex items-center gap-2">
          <Play className="w-4 h-4" />
          YouTube
        </TabsTrigger>
        <TabsTrigger value="movies" className="flex items-center gap-2">
          <Film className="w-4 h-4" />
          Movies
        </TabsTrigger>
      </TabsList>

      <TabsContent value="movies" className="mt-6 space-y-6">
        {/* Movie Category Selector */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Movie Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3">
            {movieCategories.map((category) => {
              const IconComponent = category.icon
              return (
                <Button
                  key={category.id}
                  variant={selectedMovieCategory === category.id ? "default" : "outline"}
                  className="h-auto p-3 flex flex-col items-center gap-2"
                  onClick={() => setSelectedMovieCategory(category.id)}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="text-xs font-medium">{category.name}</span>
                </Button>
              )
            })}
          </div>

          {/* Category Description */}
          <div className="text-sm text-muted-foreground">
            {movieCategories.find(c => c.id === selectedMovieCategory)?.description}
            {movieCount > 0 && ` • ${movieCount} movies`}
          </div>
        </div>

        {/* AI Summary */}
        {movieSummary && (
          <Card className="border-border/60 bg-card/60 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Film className="w-5 h-5" />
                {movieCategories.find(c => c.id === selectedMovieCategory)?.name} Movies
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">{movieSummary}</CardContent>
          </Card>
        )}

        {/* Movie Loading State */}
        {movieLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted/30 h-64 rounded-md mb-3"></div>
                <div className="bg-muted/30 h-4 rounded mb-2"></div>
                <div className="bg-muted/30 h-3 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        )}

        {/* Movies Grid */}
        {!movieLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            {movies.map((movie) => (
              <Card
                key={movie.id}
                className="border-border/60 bg-card/60 backdrop-blur transition-all hover:shadow-[0_0_12px_var(--color-accent-purple)] group"
              >
                <CardHeader className="pb-2 p-3">
                  <CardTitle className="text-sm line-clamp-2 leading-tight">{movie.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-3 pt-0">
                  <div className="relative">
                    <img
                      src={movie.poster || "/placeholder.svg?height=240&width=160"}
                      alt={`${movie.title} poster`}
                      className="w-full h-48 object-cover rounded-md"
                    />
                    {movie.vote_average >= 8.0 && (
                      <div className="absolute top-1 right-1 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        {movie.vote_average.toFixed(1)}
                      </div>
                    )}
                    {movie.vote_average >= 7.0 && movie.vote_average < 8.0 && (
                      <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        {movie.vote_average.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {movie.release_date ? (typeof movie.release_date === 'string' && movie.release_date.includes('-') ? new Date(movie.release_date).getFullYear() : movie.release_date) : 'TBA'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {movie.vote_count ? movie.vote_count.toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    {movie.director && movie.director !== 'Unknown' && movie.director !== 'TV Series' && (
                      <div className="text-xs">
                        <span className="font-medium">Director:</span> {movie.director}
                      </div>
                    )}
                    {movie.network && (
                      <div className="text-xs">
                        <span className="font-medium">Network:</span> {movie.network}
                      </div>
                    )}
                    <div className="line-clamp-2 text-xs leading-relaxed">{movie.overview}</div>
                  </div>
                </CardContent>
                <CardFooter className="p-3 pt-0">
                  <Button
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      const url = typeof movie.id === 'string' && movie.id.startsWith('tv_')
                        ? `https://www.tvmaze.com/shows/${movie.id.replace('tv_', '')}`
                        : typeof movie.id === 'string' && movie.id.startsWith('tt')
                          ? `https://www.imdb.com/title/${movie.id}`
                          : `https://www.themoviedb.org/movie/${movie.id}`
                      window.open(url, '_blank', 'noopener,noreferrer')
                    }}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="music" className="mt-6 space-y-6">
        {/* Music Category Selector */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Music Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {musicCategories.map((category) => {
              const IconComponent = category.icon
              return (
                <Button
                  key={category.id}
                  variant={selectedMusicCategory === category.id ? "default" : "outline"}
                  className="h-auto p-3 flex flex-col items-center gap-2"
                  onClick={() => setSelectedMusicCategory(category.id)}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="text-xs font-medium">{category.name}</span>
                </Button>
              )
            })}
          </div>

          {/* Category Description */}
          <div className="text-sm text-muted-foreground">
            {musicCategories.find(c => c.id === selectedMusicCategory)?.description}
            {trackCount > 0 && ` • ${trackCount} tracks`}
          </div>
        </div>

        {/* AI Summary */}
        {musicSummary && (
          <Card className="border-border/60 bg-card/60 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Music className="w-5 h-5" />
                {musicCategories.find(c => c.id === selectedMusicCategory)?.name} Music
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">{musicSummary}</CardContent>
          </Card>
        )}

        {/* Music Loading State */}
        {musicLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted/30 h-48 rounded-md mb-3"></div>
                <div className="bg-muted/30 h-4 rounded mb-2"></div>
                <div className="bg-muted/30 h-3 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        )}

        {/* Music Grid */}
        {!musicLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            {tracks.map((track) => (
              <Card
                key={track.id}
                className="border-border/60 bg-card/60 backdrop-blur transition-all hover:shadow-[0_0_12px_var(--color-accent-pink)] group"
              >
                <CardHeader className="pb-2 p-3">
                  <CardTitle className="text-sm line-clamp-2 leading-tight">{track.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-3 pt-0">
                  <div className="relative">
                    <img
                      src={track.image || "/placeholder.svg?height=160&width=160"}
                      alt={`${track.album} cover`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    {track.popularity >= 90 && (
                      <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        🔥
                      </div>
                    )}
                    {track.popularity >= 80 && track.popularity < 90 && (
                      <div className="absolute top-1 right-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        ⭐
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="line-clamp-1 font-medium">{track.artist}</div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(track.duration)}
                      </span>
                      <span className="text-xs">
                        {track.popularity}%
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-3 pt-0 space-y-1">
                  {track.preview_url ? (
                    <Button
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => playPreview(track.preview_url!)}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Preview
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => window.open(track.spotify_url, '_blank', 'noopener,noreferrer')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Spotify
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="youtube" className="mt-6 space-y-6">
        <YouTubeSection />
      </TabsContent>
    </Tabs>
  )
}

// YouTube Section Component
function YouTubeSection() {
  const [videos, setVideos] = useState<Video[]>([])
  const [summary, setSummary] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("trending")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const categories = [
    { id: "trending", name: "Trending", icon: "🔥" },
    { id: "gaming", name: "Gaming", icon: "🎮" },
    { id: "music", name: "Music", icon: "🎵" },
    { id: "tech", name: "Tech", icon: "💻" },
    { id: "comedy", name: "Comedy", icon: "😂" },
    { id: "education", name: "Education", icon: "�" },
    { id: "sports", name: "Sports", icon: "⚽" },
    { id: "news", name: "News", icon: "📰" },
    { id: "entertainment", name: "Entertainment", icon: "🎬" },
    { id: "lifestyle", name: "Lifestyle", icon: "✨" },
  ]

  const fetchVideos = async (category: string) => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/youtube-categories?category=${category}`)
      const data = await response.json()

      if (response.ok) {
        setVideos(data.items || [])
        setSummary(data.summary || "")
      } else {
        setError(data.error || "Failed to fetch videos")
      }
    } catch (err) {
      setError("Network error occurred")
      console.error("YouTube fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos(selectedCategory)
  }, [selectedCategory])

  const formatViews = (views: string) => {
    const num = parseInt(views)
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toLocaleString()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">YouTube Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <span>{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* AI Summary */}
      {summary && !loading && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 dark:from-blue-950/20 dark:to-purple-950/20 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="text-blue-600">🤖</span>
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">❌ {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted/30 h-48 rounded-md mb-3"></div>
              <div className="bg-muted/30 h-4 rounded mb-2"></div>
              <div className="bg-muted/30 h-3 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      )}

      {/* Videos Grid */}
      {!loading && videos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <Card
              key={video.id}
              className="group hover:shadow-lg transition-shadow border-border/60 bg-card/60 backdrop-blur overflow-hidden cursor-pointer"
              onClick={() => window.open(`https://youtube.com/watch?v=${video.id}`, '_blank')}
            >
              <div className="relative">
                {/* Thumbnail with better image handling */}
                <div className="w-full h-40 relative bg-gradient-to-br from-red-500 to-red-600 rounded-t-lg overflow-hidden">
                  <img
                    src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <Play className="w-12 h-12 mx-auto mb-2 opacity-80" />
                      <div className="text-sm font-medium opacity-90">YouTube Video</div>
                      <div className="text-xs opacity-70 mt-1">Click to watch</div>
                    </div>
                  </div>
                  {/* Play button overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <div className="bg-red-600 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100">
                      <Play className="text-white w-6 h-6 fill-current" />
                    </div>
                  </div>

                  {/* Category badge */}
                  <div className="absolute top-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <span>{categories.find(c => c.id === selectedCategory)?.icon}</span>
                    <span className="hidden sm:inline">{categories.find(c => c.id === selectedCategory)?.name}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-red-600 transition-colors leading-tight">
                    {video.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 font-medium">{video.channel}</p>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{formatViews(video.views)} views</span>
                    </div>
                    {video.likes && (
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{formatViews(video.likes)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    {video.publishedAt && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(video.publishedAt)}</span>
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(`https://youtube.com/watch?v=${video.id}`, '_blank')}
                      className="text-xs hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Watch
                    </Button>
                  </div>

                  {video.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && videos.length === 0 && !error && (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-gray-500">
              <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No videos found for this category.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}