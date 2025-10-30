"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Play, Eye, ThumbsUp, Calendar, ExternalLink } from "lucide-react"

interface YouTubeVideo {
    id: string
    title: string
    channel: string
    thumbnail: string
    views: string
    likes: string
    publishedAt: string
    description: string
    category: string
}

interface YouTubeResponse {
    items: YouTubeVideo[]
    summary: string
    category: string
    total: number
    source: string
    error?: string
}

const categories = [
    { id: "trending", name: "Trending", icon: "🔥" },
    { id: "gaming", name: "Gaming", icon: "🎮" },
    { id: "music", name: "Music", icon: "🎵" },
    { id: "tech", name: "Tech", icon: "💻" },
    { id: "comedy", name: "Comedy", icon: "😂" },
    { id: "education", name: "Education", icon: "📚" },
    { id: "sports", name: "Sports", icon: "⚽" },
    { id: "news", name: "News", icon: "📰" },
    { id: "entertainment", name: "Entertainment", icon: "🎬" },
    { id: "lifestyle", name: "Lifestyle", icon: "✨" },
]

export default function YouTubeVideos() {
    const [videos, setVideos] = useState<YouTubeVideo[]>([])
    const [summary, setSummary] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("trending")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchVideos = async (category: string) => {
        setLoading(true)
        setError("")

        try {
            const response = await fetch(`/api/youtube-categories?category=${category}`)
            const data: YouTubeResponse = await response.json()

            if (response.ok) {
                setVideos(data.items)
                setSummary(data.summary)
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

            {/* AI Summary */}
            {summary && !loading && (
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <span className="text-blue-600">🤖</span>
                            AI Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700 leading-relaxed">{summary}</p>
                    </CardContent>
                </Card>
            )}

            {/* Error State */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-red-600">❌ {error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Loading State */}
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                <Skeleton className="w-full h-48 mb-4" />
                                <Skeleton className="h-4 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2 mb-2" />
                                <Skeleton className="h-4 w-1/4" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Videos Grid */}
            {!loading && videos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video) => (
                        <Card key={video.id} className="group hover:shadow-lg transition-shadow">
                            <CardContent className="p-0">
                                {/* Thumbnail */}
                                <div className="relative">
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="w-full h-48 object-cover rounded-t-lg"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                                        <Play className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-12 h-12" />
                                    </div>
                                    <Badge className="absolute top-2 right-2 bg-black bg-opacity-70 text-white">
                                        {categories.find(c => c.id === selectedCategory)?.icon} {categories.find(c => c.id === selectedCategory)?.name}
                                    </Badge>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                                        {video.title}
                                    </h3>

                                    <p className="text-gray-600 text-sm mb-3">{video.channel}</p>

                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                        <div className="flex items-center gap-1">
                                            <Eye className="w-3 h-3" />
                                            {formatViews(video.views)} views
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <ThumbsUp className="w-3 h-3" />
                                            {formatViews(video.likes)}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(video.publishedAt)}
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => window.open(`https://youtube.com/watch?v=${video.id}`, '_blank')}
                                            className="text-xs"
                                        >
                                            <ExternalLink className="w-3 h-3 mr-1" />
                                            Watch
                                        </Button>
                                    </div>

                                    {video.description && (
                                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                                            {video.description}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && videos.length === 0 && !error && (
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-gray-500">No videos found for this category.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}