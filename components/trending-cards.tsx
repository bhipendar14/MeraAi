"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import Link from "next/link"

type CardItem = {
  id: string
  title: string
  subtitle: string
  href: string
  accentVar: string
  content: React.ReactNode
}

const initial: CardItem[] = [
  {
    id: "movie",
    title: "Top Movie",
    subtitle: "Sci-Fi Thriller",
    href: "/entertainment",
    accentVar: "var(--color-accent-pink)",
    content: (
      <div className="space-y-2">
        <img
          src="https://static.vecteezy.com/system/resources/thumbnails/039/578/593/small/ai-generated-cinema-blank-wide-screen-in-the-cinema-hall-photo.jpg"
          alt="Cinema hall with blank screen"
          className="w-full h-20 object-cover rounded-md"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const fallback = target.nextElementSibling as HTMLElement
            if (fallback) fallback.style.display = 'flex'
          }}
        />
        <div className="w-full h-20 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-md items-center justify-center border border-pink-500/30 hidden">
          <span className="text-2xl">🎬</span>
        </div>
        <p className="text-xs text-muted-foreground">Epic space adventure awaits</p>
      </div>
    ),
  },
  {
    id: "news",
    title: "Hot News",
    subtitle: "Markets rally",
    href: "/news",
    accentVar: "var(--color-accent-amber)",
    content: (
      <div className="space-y-2">
        <img
          src="https://img.freepik.com/premium-vector/blue-breaking-news-dark-blue-background-illustration-vector-news-concept_194782-1404.jpg"
          alt="Breaking news background"
          className="w-full h-20 object-cover rounded-md"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const fallback = target.nextElementSibling as HTMLElement
            if (fallback) fallback.style.display = 'flex'
          }}
        />
        <div className="w-full h-20 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-md items-center justify-center border border-amber-500/30 hidden">
          <span className="text-2xl">📰</span>
        </div>
        <p className="text-xs text-muted-foreground">AI boom lifts tech sector globally</p>
      </div>
    ),
  },
  {
    id: "stocks",
    title: "Stock Movers",
    subtitle: "Today",
    href: "/stocks",
    accentVar: "var(--color-accent-cyan)",
    content: (
      <div className="space-y-2">
        <img
          src="https://cdn.mos.cms.futurecdn.net/WkTrh7CpZuwNv9UhTGJVA4.jpg"
          alt="Stock market charts"
          className="w-full h-20 object-cover rounded-md"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const fallback = target.nextElementSibling as HTMLElement
            if (fallback) fallback.style.display = 'flex'
          }}
        />
        <div className="w-full h-20 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-md items-center justify-center border border-cyan-500/30 hidden">
          <span className="text-2xl">📈</span>
        </div>
        <div className="text-xs">
          <span className="text-emerald-400">+2.4%</span> NVDA · <span className="text-red-400">-1.1%</span> AAPL
        </div>
      </div>
    ),
  },
  {
    id: "sports",
    title: "Sports Highlight",
    subtitle: "Global",
    href: "/news",
    accentVar: "var(--color-accent-green)",
    content: (
      <div className="space-y-2">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoVLfhgPQjEXEpKCb-r5UMtJqolicfNXoe1A&s"
          alt="Sports action"
          className="w-full h-20 object-cover rounded-md"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const fallback = target.nextElementSibling as HTMLElement
            if (fallback) fallback.style.display = 'flex'
          }}
        />
        <div className="w-full h-20 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-md items-center justify-center border border-green-500/30 hidden">
          <span className="text-2xl">⚽</span>
        </div>
        <p className="text-xs text-muted-foreground">Grand slam upset in the final set</p>
      </div>
    ),
  },
  {
    id: "travel",
    title: "Travel Deals",
    subtitle: "Hot Destinations",
    href: "/travel",
    accentVar: "var(--color-accent-purple)",
    content: (
      <div className="space-y-2">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZPUD8Ba4ywt7xN2e9nlOjgNvN1f-yS64yqg&s"
          alt="Travel destination"
          className="w-full h-20 object-cover rounded-md"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const fallback = target.nextElementSibling as HTMLElement
            if (fallback) fallback.style.display = 'flex'
          }}
        />
        <div className="w-full h-20 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-md items-center justify-center border border-purple-500/30 hidden">
          <span className="text-2xl">✈️</span>
        </div>
        <p className="text-xs text-muted-foreground">Goa beaches from ₹15,000</p>
      </div>
    ),
  },
  {
    id: "tech",
    title: "Code Tools",
    subtitle: "AI Powered",
    href: "/tech",
    accentVar: "var(--color-accent-blue)",
    content: (
      <div className="space-y-2">
        <img
          src="https://images.stockcake.com/public/5/0/3/5032a397-e2fb-49a3-8f63-8c18e27dc092_large/coding-command-center-stockcake.jpg"
          alt="Coding command center"
          className="w-full h-20 object-cover rounded-md"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const fallback = target.nextElementSibling as HTMLElement
            if (fallback) fallback.style.display = 'flex'
          }}
        />
        <div className="w-full h-20 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-md items-center justify-center border border-blue-500/30 hidden">
          <span className="text-2xl">💻</span>
        </div>
        <p className="text-xs text-muted-foreground">AI code generation & debugging</p>
      </div>
    ),
  },
  {
    id: "games",
    title: "Mini Games",
    subtitle: "Play Now",
    href: "/games",
    accentVar: "var(--color-accent-pink)",
    content: (
      <div className="space-y-2">
        <img
          src="https://tr.rbxcdn.com/180DAY-1403c3731218b77c774d9b36b442a132/420/420/Image/Webp/noFilter"
          alt="Gaming interface"
          className="w-full h-20 object-cover rounded-md"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const fallback = target.nextElementSibling as HTMLElement
            if (fallback) fallback.style.display = 'flex'
          }}
        />
        <div className="w-full h-20 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-md items-center justify-center border border-pink-500/30 hidden">
          <span className="text-2xl">🎮</span>
        </div>
        <p className="text-xs text-muted-foreground">Tic-tac-toe, Snake & more</p>
      </div>
    ),
  },
  {
    id: "research",
    title: "AI Research",
    subtitle: "Powered by Gemini",
    href: "/research",
    accentVar: "var(--color-accent-cyan)",
    content: (
      <div className="space-y-2">
        <img
          src="https://news.yale.edu/sites/default/files/styles/full/public/ynews-risks-ai-research.jpg?itok=JlO4dGlz"
          alt="AI research visualization"
          className="w-full h-20 object-cover rounded-md"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const fallback = target.nextElementSibling as HTMLElement
            if (fallback) fallback.style.display = 'flex'
          }}
        />
        <div className="w-full h-20 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-md items-center justify-center border border-cyan-500/30 hidden">
          <span className="text-2xl">🔬</span>
        </div>
        <p className="text-xs text-muted-foreground">Advanced AI research assistant</p>
      </div>
    ),
  },
]

export function TrendingCards() {
  const [cards, setCards] = useState<CardItem[]>(initial)

  const close = (id: string) => setCards((prev) => prev.filter((c) => c.id !== id))

  if (!cards.length) return null

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card
          key={c.id}
          className="relative border-border/60 bg-card/60 backdrop-blur transition-all hover:shadow-[0_0_16px_var(--neon)]"
          style={{ ["--neon" as any]: c.accentVar }}
        >
          <button
            aria-label="Dismiss"
            onClick={() => close(c.id)}
            className="absolute right-2 top-2 p-1 rounded-md hover:bg-muted/40"
          >
            <X className="size-4" />
          </button>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>{c.title}</span>
              <span className="text-xs font-normal text-muted-foreground">{c.subtitle}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {c.content}
            <Link href={c.href}>
              <Button size="sm" className="w-full transition-all hover:shadow-[0_0_12px_var(--neon)]">
                Open
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}