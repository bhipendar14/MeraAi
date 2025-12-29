"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Play, Music2, Film, Youtube, Search, X,
  TrendingUp, Heart, Flame, Star, Clock, Eye, Sparkles, ExternalLink
} from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { saveActivity } from "@/lib/history-utils"

// Types
interface Track {
  id: string
  title: string
  artist: string
  album: string
  image: string
  preview_url: string | null
  spotify_url: string
  duration: number
  popularity?: number
  category: string
}

interface Movie {
  id: number
  title: string
  overview: string
  poster: string
  release_date: string
  vote_average: number
  vote_count: number
  category: string
}

interface Video {
  id: string
  title: string
  channel: string
  thumbnail: string
  views: string
  category?: string
}

// Music Categories
const musicCategories = [
  { id: "trending", name: "Trending", icon: TrendingUp },
  { id: "most_liked", name: "Most Liked", icon: Heart },
  { id: "viral", name: "Viral", icon: Flame },
  { id: "new_releases", name: "New Releases", icon: Star },
  { id: "hip_hop", name: "Hip Hop", icon: Music2 },
  { id: "pop", name: "Pop", icon: Music2 },
]

// Movie Categories
const movieCategories = [
  { id: "trending", name: "Trending", icon: TrendingUp },
  { id: "popular", name: "Popular", icon: Flame },
  { id: "top_rated", name: "Top Rated", icon: Star },
  { id: "upcoming", name: "Upcoming", icon: Clock },
  { id: "action", name: "Action", icon: Film },
  { id: "comedy", name: "Comedy", icon: Film },
  { id: "horror", name: "Horror", icon: Film },
  { id: "romance", name: "Romance", icon: Heart },
]

// YouTube Categories (Education removed)
const youtubeCategories = [
  { id: "trending", name: "Trending", icon: TrendingUp },
  { id: "gaming", name: "Gaming", icon: Youtube },
  { id: "music", name: "Music", icon: Music2 },
  { id: "tech", name: "Tech", icon: Youtube },
  { id: "comedy", name: "Comedy", icon: Youtube },
  { id: "sports", name: "Sports", icon: Youtube },
  { id: "news", name: "News", icon: Youtube },
]

export function EntertainmentGrid() {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState<"music" | "movies" | "youtube">("music")

  // Music state
  const [musicCategory, setMusicCategory] = useState("trending")
  const [musicSearch, setMusicSearch] = useState("")
  const [tracks, setTracks] = useState<Track[]>([])
  const [musicLoading, setMusicLoading] = useState(false)
  const [musicSummary, setMusicSummary] = useState("")

  // Movies state
  const [movieCategory, setMovieCategory] = useState("trending")
  const [movieSearch, setMovieSearch] = useState("")
  const [movies, setMovies] = useState<Movie[]>([])
  const [moviesLoading, setMoviesLoading] = useState(false)
  const [moviesSummary, setMoviesSummary] = useState("")
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)

  // YouTube state
  const [youtubeCategory, setYoutubeCategory] = useState("trending")
  const [youtubeSearch, setYoutubeSearch] = useState("")
  const [videos, setVideos] = useState<Video[]>([])
  const [youtubeLoading, setYoutubeLoading] = useState(false)
  const [youtubeSummary, setYoutubeSummary] = useState("")
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  // Load music
  useEffect(() => {
    if (activeTab === "music") {
      loadMusic()
    }
  }, [musicCategory, activeTab])

  // Load movies
  useEffect(() => {
    if (activeTab === "movies") {
      loadMovies()
    }
  }, [movieCategory, activeTab])

  // Load YouTube
  useEffect(() => {
    if (activeTab === "youtube") {
      loadYouTube()
    }
  }, [youtubeCategory, activeTab])

  const loadMusic = async () => {
    setMusicLoading(true)
    setMusicSearch("")
    try {
      const res = await fetch(`/api/entertainment?type=music&category=${musicCategory}`)
      const data = await res.json()
      setTracks(data.items || [])
      setMusicSummary(data.summary || "")
    } catch (error) {
      console.error("Error loading music:", error)
    } finally {
      setMusicLoading(false)
    }
  }

  const loadMovies = async () => {
    setMoviesLoading(true)
    setMovieSearch("")
    try {
      const res = await fetch(`/api/entertainment?type=movies&category=${movieCategory}`)
      const data = await res.json()
      setMovies(data.items || [])
      setMoviesSummary(data.summary || "")
    } catch (error) {
      console.error("Error loading movies:", error)
    } finally {
      setMoviesLoading(false)
    }
  }

  const loadYouTube = async () => {
    setYoutubeLoading(true)
    setYoutubeSearch("")
    try {
      const res = await fetch(`/api/youtube-categories?category=${youtubeCategory}`)
      const data = await res.json()
      setVideos(data.items || [])
      setYoutubeSummary(data.summary || "")
    } catch (error) {
      console.error("Error loading YouTube:", error)
    } finally {
      setYoutubeLoading(false)
    }
  }

  const searchMusic = async () => {
    if (!musicSearch.trim()) return
    setMusicLoading(true)
    try {
      const res = await fetch(`/api/entertainment?type=music&q=${encodeURIComponent(musicSearch)}`)
      const data = await res.json()
      setTracks(data.items || [])
      setMusicSummary(data.summary || "")
    } catch (error) {
      console.error("Error searching music:", error)
    } finally {
      setMusicLoading(false)
    }
  }

  const searchMovies = async () => {
    if (!movieSearch.trim()) return
    setMoviesLoading(true)
    try {
      const res = await fetch(`/api/movies-tmdb?q=${encodeURIComponent(movieSearch)}`)
      const data = await res.json()
      setMovies(data.movies || [])
      setMoviesSummary(`Search results for "${movieSearch}" - ${data.movies?.length || 0} movies found`)
    } catch (error) {
      console.error("Error searching movies:", error)
    } finally {
      setMoviesLoading(false)
    }
  }

  const searchYouTube = async () => {
    if (!youtubeSearch.trim()) return
    setYoutubeLoading(true)
    try {
      const res = await fetch(`/api/youtube-categories?category=${youtubeCategory}&q=${encodeURIComponent(youtubeSearch)}`)
      const data = await res.json()
      setVideos(data.items || [])
      setYoutubeSummary(`Search results for "${youtubeSearch}" - ${data.items?.length || 0} videos found`)
    } catch (error) {
      console.error("Error searching YouTube:", error)
    } finally {
      setYoutubeLoading(false)
    }
  }

  const formatViews = (views: string) => {
    const num = parseInt(views)
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return views
  }

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex gap-2">
          <Button
            variant={activeTab === "music" ? "default" : "outline"}
            onClick={() => setActiveTab("music")}
            className={`flex items-center gap-2 ${activeTab === "music"
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "hover:bg-green-600/10 hover:text-green-600"
              }`}
          >
            <Music2 className="w-4 h-4" />
            Music
          </Button>
          <Button
            variant={activeTab === "movies" ? "default" : "outline"}
            onClick={() => setActiveTab("movies")}
            className={`flex items-center gap-2 ${activeTab === "movies"
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "hover:bg-red-600/10 hover:text-red-600"
              }`}
          >
            <Film className="w-4 h-4" />
            Movies
          </Button>
          <Button
            variant={activeTab === "youtube" ? "default" : "outline"}
            onClick={() => setActiveTab("youtube")}
            className={`flex items-center gap-2 ${activeTab === "youtube"
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "hover:bg-red-600/10 hover:text-red-600"
              }`}
          >
            <Youtube className="w-4 h-4" />
            YouTube
          </Button>
        </div>
      </div>

      {/* Music Section */}
      {activeTab === "music" && (
        <div className="space-y-6">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {musicCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setMusicCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${musicCategory === cat.id
                  ? "bg-green-600 text-white shadow-lg shadow-green-600/30"
                  : "bg-card border border-border hover:border-green-600/50 hover:bg-green-600/10"
                  }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search music (e.g., 'blackpink', 'hip hop')..."
              value={musicSearch}
              onChange={(e) => setMusicSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  searchMusic()
                }
              }}
              className="pl-10 pr-20 bg-card/60 border-border/60"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            {musicSearch && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setMusicSearch("")
                  loadMusic()
                }}
                className="absolute right-12 top-1/2 -translate-y-1/2 h-7 px-2"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="sm"
              onClick={searchMusic}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 bg-green-600 hover:bg-green-700"
            >
              Search
            </Button>
          </div>

          {/* AI Summary */}
          {musicSummary && (
            <Card className="bg-gradient-to-r from-green-600/10 to-green-600/5 border-green-600/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-green-600">AI Insights</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{musicSummary}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tracks Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {musicLoading ? (
              Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-accent/20 rounded-lg mb-2" />
                  <div className="h-4 bg-accent/20 rounded mb-1" />
                  <div className="h-3 bg-accent/20 rounded w-2/3" />
                </div>
              ))
            ) : tracks.length > 0 ? (
              tracks.map((track) => (
                <Card
                  key={track.id}
                  className="group cursor-pointer overflow-hidden border-border/60 bg-card/60 backdrop-blur hover:border-green-600/50 transition-all"
                  onClick={async () => {
                    // Save to history
                    if (token) {
                      await saveActivity(token, 'entertainment', 'music', {
                        title: track.title,
                        artist: track.artist,
                        thumbnail: track.image,
                        id: track.id,
                        url: track.spotify_url
                      })
                    }
                    // Open directly in Spotify
                    if (track.spotify_url) {
                      window.open(track.spotify_url, '_blank')
                    }
                  }}
                >
                  <div className="relative aspect-square">
                    <Image
                      src={track.image}
                      alt={track.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white fill-current" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-semibold text-sm line-clamp-1 mb-1">{track.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">{track.artist}</p>
                    {track.popularity && (
                      <p className="text-xs text-muted-foreground mt-1">Popularity: {track.popularity}%</p>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No music found. Try a different search or category.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Movies Section */}
      {activeTab === "movies" && (
        <div className="space-y-6">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {movieCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setMovieCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${movieCategory === cat.id
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                  : "bg-card border border-border hover:border-red-600/50 hover:bg-red-600/10"
                  }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.name}
              </button>
            ))}
          </div>

          {/* Movies Search Bar */}
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search movies (e.g., 'Avengers', 'Inception')..."
              value={movieSearch}
              onChange={(e) => setMovieSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchMovies()}
              className="flex-1"
            />
            <Button onClick={searchMovies} className="bg-red-600 hover:bg-red-700">
              <Search className="w-4 h-4" />
            </Button>
            {movieSearch && (
              <Button onClick={() => { setMovieSearch(""); loadMovies() }} variant="ghost">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* AI Summary */}
          {moviesSummary && (
            <Card className="bg-gradient-to-r from-red-600/10 to-red-600/5 border-red-600/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-red-600">AI Insights</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{moviesSummary}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Movies Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {moviesLoading ? (
              Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[2/3] bg-accent/20 rounded-lg mb-2" />
                  <div className="h-4 bg-accent/20 rounded mb-1" />
                  <div className="h-3 bg-accent/20 rounded w-2/3" />
                </div>
              ))
            ) : movies.length > 0 ? (
              movies.map((movie) => (
                <Card
                  key={movie.id}
                  className="group cursor-pointer overflow-hidden border-border/60 bg-card/60 backdrop-blur hover:border-red-600/50 transition-all"
                  onClick={async () => {
                    // Save to history
                    if (token) {
                      await saveActivity(token, 'entertainment', 'movie', {
                        title: movie.title,
                        thumbnail: movie.poster,
                        id: movie.id.toString()
                      })
                    }
                    setSelectedMovie(movie)
                  }}
                >
                  <div className="relative aspect-[2/3]">
                    <Image
                      src={movie.poster}
                      alt={movie.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      unoptimized
                    />
                    <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs font-semibold">{movie.vote_average.toFixed(1)}</span>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-semibold text-sm line-clamp-1 mb-1">{movie.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {new Date(movie.release_date).getFullYear()}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No movies found. Try a different search or category.
              </div>
            )}
          </div>
        </div>
      )}

      {/* YouTube Section */}
      {activeTab === "youtube" && (
        <div className="space-y-6">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {youtubeCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setYoutubeCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${youtubeCategory === cat.id
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                  : "bg-card border border-border hover:border-red-600/50 hover:bg-red-600/10"
                  }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.name}
              </button>
            ))}
          </div>

          {/* YouTube Search Bar */}
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search videos (e.g., 'dance', 'cooking')..."
              value={youtubeSearch}
              onChange={(e) => setYoutubeSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchYouTube()}
              className="flex-1"
            />
            <Button onClick={searchYouTube} className="bg-red-600 hover:bg-red-700">
              <Search className="w-4 h-4" />
            </Button>
            {youtubeSearch && (
              <Button onClick={() => { setYoutubeSearch(""); loadYouTube() }} variant="ghost">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* AI Summary */}
          {youtubeSummary && (
            <Card className="bg-gradient-to-r from-red-600/10 to-red-600/5 border-red-600/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-red-600">AI Insights</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{youtubeSummary}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {youtubeLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-accent/20 rounded-lg mb-2" />
                  <div className="h-4 bg-accent/20 rounded mb-1" />
                  <div className="h-3 bg-accent/20 rounded w-2/3" />
                </div>
              ))
            ) : videos.length > 0 ? (
              videos.map((video) => (
                <Card
                  key={video.id}
                  className="group cursor-pointer overflow-hidden border-border/60 bg-card/60 backdrop-blur hover:border-red-600/50 transition-all"
                  onClick={async () => {
                    // Save to history
                    if (token) {
                      await saveActivity(token, 'entertainment', 'youtube', {
                        title: video.title,
                        thumbnail: video.thumbnail,
                        id: video.id
                      })
                    }
                    setSelectedVideo(video)
                  }}
                >
                  <div className="relative aspect-video">
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center">
                        <Play className="w-8 h-8 text-white fill-current ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/90 px-2 py-0.5 rounded text-xs font-semibold">
                      {formatViews(video.views)} views
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-semibold text-sm line-clamp-2 mb-1">{video.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">{video.channel}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No videos found. Try a different search or category.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Movie Modal */}
      {selectedMovie && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMovie(null)}
        >
          <Card
            className="max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video">
              <Image
                src={selectedMovie.poster}
                alt={selectedMovie.title}
                fill
                className="object-cover"
                unoptimized
              />
              <Button
                className="absolute top-4 right-4"
                size="icon"
                variant="ghost"
                onClick={() => setSelectedMovie(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-2">{selectedMovie.title}</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span>{new Date(selectedMovie.release_date).getFullYear()}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span>{selectedMovie.vote_average.toFixed(1)}/10</span>
                </div>
                <span>{selectedMovie.vote_count.toLocaleString()} votes</span>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">{selectedMovie.overview}</p>
              <Button
                onClick={() => window.open(`https://www.themoviedb.org/movie/${selectedMovie.id}`, '_blank')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Read More on TMDB
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* YouTube Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div className="max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <Button
                className="absolute -top-12 right-0 bg-white/90 hover:bg-white text-black"
                size="icon"
                onClick={() => setSelectedVideo(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="mt-4 bg-card rounded-lg p-4">
              <h3 className="text-xl font-bold mb-2">{selectedVideo.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{selectedVideo.channel}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {formatViews(selectedVideo.views)} views
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}