"use client"

import { NewsFeed } from "@/components/news-feed"
import { Newspaper, Globe, Video, Sparkles, TrendingUp } from "lucide-react"

export default function NewsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/20 to-blue-500/20">
            <Newspaper className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-500 via-blue-500 to-green-500 bg-clip-text text-transparent">
            Live News — Global Coverage
          </h2>
        </div>
        <p className="text-muted-foreground text-lg">
          Real-time news from around the world with AI-powered summaries and video coverage
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <Globe className="w-4 h-4 text-blue-500" />
            <span>50+ Countries</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span>Live Updates</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Video className="w-4 h-4 text-red-500" />
            <span>News Videos</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>AI Summaries</span>
          </div>
        </div>
      </header>

      <NewsFeed />
    </div>
  )
}
