"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Search, Globe, Filter, X, Play,
  Clock, TrendingUp, Sparkles, Share2, ExternalLink,
  ChevronLeft, ChevronRight, AlertCircle
} from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { saveActivity } from "@/lib/history-utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())


// Country options
const COUNTRIES = [
  { code: "us", name: "USA" },
  { code: "gb", name: "UK" },
  { code: "jp", name: "Japan" },
  { code: "in", name: "India" },
  { code: "de", name: "Germany" },
  { code: "fr", name: "France" },
  { code: "ca", name: "Canada" },
  { code: "au", name: "Australia" },
  { code: "br", name: "Brazil" },
  { code: "cn", name: "China" },
]

// Category options
const CATEGORIES = [
  { id: "", name: "All" },
  { id: "business", name: "Business" },
  { id: "technology", name: "Technology" },
  { id: "sports", name: "Sports" },
  { id: "entertainment", name: "Entertainment" },
  { id: "health", name: "Health" },
  { id: "science", name: "Science" },
]

export function NewsFeed() {
  const { token } = useAuth()
  const [country, setCountry] = useState("")
  const [category, setCategory] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [videoScrollPosition, setVideoScrollPosition] = useState(0)
  const [selectedVideo, setSelectedVideo] = useState<any>(null)

  // Build API URL with filters
  const buildNewsUrl = () => {
    const params = new URLSearchParams()
    if (country) params.set("country", country)
    if (category) params.set("category", category)
    if (searchQuery) params.set("q", searchQuery)
    return `/api/news?${params.toString()}`
  }

  const { data: newsData, isLoading: newsLoading } = useSWR(buildNewsUrl(), fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
  })

  // Build URLs for other endpoints with filters
  const buildVideosUrl = () => {
    const params = new URLSearchParams()
    params.set("endpoint", "videos")

    // Build search query combining category and search query
    let query = ""
    if (searchQuery) {
      query = searchQuery
    } else if (category) {
      query = category
    }

    if (query) params.set("q", query)
    if (category) params.set("category", category)
    if (country) params.set("country", country)
    return `/api/news?${params.toString()}`
  }

  const buildBreakingUrl = () => {
    const params = new URLSearchParams()
    params.set("endpoint", "breaking")
    if (country) params.set("country", country)
    return `/api/news?${params.toString()}`
  }

  const buildDigestUrl = () => {
    const params = new URLSearchParams()
    params.set("endpoint", "digest")
    if (country) params.set("country", country)
    return `/api/news?${params.toString()}`
  }

  const { data: videosData } = useSWR(
    buildVideosUrl(),
    fetcher,
    { refreshInterval: 600000 } // Refresh every 10 minutes
  )

  const { data: breakingData } = useSWR(buildBreakingUrl(), fetcher, {
    refreshInterval: 60000, // Refresh every minute
  })

  const { data: digestData } = useSWR(buildDigestUrl(), fetcher, {
    refreshInterval: 3600000, // Refresh every hour
  })

  const news = newsData?.items || []
  const videos = videosData?.videos || []
  const breaking = breakingData?.breaking || []
  const digest = digestData?.digest || ""

  const heroNews = news[0]
  const gridNews = news.slice(1)

  const scrollVideos = (direction: "left" | "right") => {
    const container = document.getElementById("video-carousel")
    if (container) {
      const scrollAmount = direction === "left" ? -400 : 400
      container.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <div className="space-y-6">
      {/* Breaking News Banner */}
      {breaking.length > 0 && (
        <div className="bg-red-600 text-white px-4 py-3 rounded-lg flex items-center gap-3 animate-pulse">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-4 animate-marquee">
              {breaking.map((item: any, i: number) => (
                <Link
                  key={i}
                  href={item.url}
                  target="_blank"
                  className="whitespace-nowrap hover:underline font-semibold"
                >
                  🔴 BREAKING: {item.headline}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <Card className="border-border/60 bg-card/60 backdrop-blur">
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>


            {/* Country Selector */}
            <div className="relative">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="pl-10 pr-8 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="">Global</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Clear Filters */}
            {(searchQuery || country || category) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setCountry("")
                  setCategory("")
                }}
                className="hover:bg-red-500/20"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${category === cat.id
                  ? "bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                  : "bg-accent/20 hover:bg-accent/30 text-foreground"
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hero Section - Top Story */}
      {heroNews && (
        <Card className="border-border/60 bg-card/60 backdrop-blur overflow-hidden hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative h-64 md:h-auto">
              <Image
                src={heroNews.image}
                alt={heroNews.headline}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold">
                  TOP STORY
                </span>
              </div>
            </div>
            <div className="p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span className="font-semibold text-blue-500">{heroNews.source}</span>
                <span>•</span>
                <Clock className="w-3 h-3" />
                <span>{new Date(heroNews.publishedAt).toLocaleDateString()}</span>
              </div>
              <h2 className="text-2xl font-bold mb-3 line-clamp-2">{heroNews.headline}</h2>
              <p className="text-muted-foreground mb-4 line-clamp-3">{heroNews.summary}</p>
              <div className="flex items-center gap-3">
                <Link href={heroNews.url} target="_blank">
                  <Button
                    className="hover:shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                    onClick={async () => {
                      if (token) {
                        await saveActivity(token, 'news', 'article', {
                          title: heroNews.headline,
                          source: heroNews.source,
                          url: heroNews.url,
                          thumbnail: heroNews.image
                        })
                      }
                    }}
                  >
                    Read Full Story
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* AI News Digest */}
      {digest && (
        <Card className="border-border/60 bg-gradient-to-br from-purple-950/20 to-pink-950/20 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-purple-500" />
              AI News Digest
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/90 leading-relaxed">{digest}</p>
          </CardContent>
        </Card>
      )}

      {/* News Grid */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Latest News
        </h3>
        {newsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-border/60 bg-card/60 backdrop-blur animate-pulse">
                <div className="h-48 bg-accent/20" />
                <CardContent className="pt-4 space-y-2">
                  <div className="h-4 bg-accent/20 rounded" />
                  <div className="h-4 bg-accent/20 rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : gridNews.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {gridNews.map((item: any) => (
              <Card
                key={item.id}
                className="border-border/60 bg-card/60 backdrop-blur overflow-hidden hover:shadow-[0_0_12px_rgba(59,130,246,0.3)] transition-all group"
              >
                <div className="relative h-48">
                  <Image
                    src={item.image}
                    alt={item.headline}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                  {category && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 rounded bg-blue-600 text-white text-xs font-bold uppercase">
                        {category}
                      </span>
                    </div>
                  )}
                </div>
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-blue-500">{item.source}</span>
                    <span>•</span>
                    <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold line-clamp-2 group-hover:text-blue-500 transition-colors">
                    {item.headline}
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.summary}</p>
                  <div className="flex items-center gap-2 pt-2">
                    <Link href={item.url} target="_blank" className="flex-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full hover:bg-blue-500/20"
                        onClick={async () => {
                          if (token) {
                            await saveActivity(token, 'news', 'article', {
                              title: item.headline,
                              source: item.source,
                              url: item.url,
                              thumbnail: item.image
                            })
                          }
                        }}
                      >
                        Read More
                      </Button>
                    </Link>
                    <Button size="sm" variant="ghost">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border/60 bg-card/60 backdrop-blur">
            <CardContent className="pt-6 text-center text-muted-foreground">
              No news found. Try different filters.
            </CardContent>
          </Card>
        )}
      </div>

      {/* YouTube News Videos */}
      {videos.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-red-500" />
            News Videos
          </h3>
          <div className="relative">
            <button
              onClick={() => scrollVideos("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black p-2 rounded-full"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => scrollVideos("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black p-2 rounded-full"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <div
              id="video-carousel"
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
              style={{ scrollbarWidth: "none" }}
            >
              {videos.map((video: any) => (
                <div
                  key={video.id}
                  onClick={async () => {
                    if (token) {
                      await saveActivity(token, 'news', 'video', {
                        title: video.title,
                        thumbnail: video.thumbnail,
                        url: `https://www.youtube.com/watch?v=${video.id}`
                      })
                    }
                    setSelectedVideo(video)
                  }}
                  className="flex-shrink-0 w-80 group cursor-pointer"
                >
                  <Card className="border-border/60 bg-card/60 backdrop-blur overflow-hidden hover:shadow-[0_0_12px_rgba(239,68,68,0.5)] transition-all">
                    <div className="relative h-44">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all flex items-center justify-center">
                        <div className="bg-red-600 rounded-full p-4 group-hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 fill-current" />
                        </div>
                      </div>
                    </div>
                    <CardContent className="pt-3 space-y-1">
                      <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-red-500 transition-colors">
                        {video.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">{video.channelTitle}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
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
              <p className="text-sm text-muted-foreground">{selectedVideo.channelTitle}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
