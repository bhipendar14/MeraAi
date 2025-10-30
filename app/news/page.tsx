"use client"

import { NewsFeed } from "@/components/news-feed"

export default function NewsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Live News</h2>
        <p className="text-muted-foreground">AI summaries of top stories.</p>
      </header>
      <NewsFeed />
    </div>
  )
}
