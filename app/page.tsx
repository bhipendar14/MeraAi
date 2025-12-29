"use client"

import { TrendingCards } from "@/components/trending-cards"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ResearchChat } from "@/components/research-chat"
import { WeatherDisplay } from "@/components/weather-display"
import { BreakingNewsTicker } from "@/components/breaking-news-ticker"
import { TravelDestinationsTicker } from "@/components/travel-destinations-ticker"

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="rounded-xl border border-border/60 bg-card/60 backdrop-blur p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-pretty text-2xl md:text-4xl font-semibold">Your unified AI command center</h2>
            <p className="mt-2 text-muted-foreground leading-relaxed">
              Research, entertainment, news, stocks, travel, coding tools, and games — all in one super interface. Built
              for speed, clarity, and flow.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Link href="/research">
                <Button className="w-full sm:w-auto transition-all hover:shadow-[0_0_16px_var(--color-accent-cyan)]">
                  Start Research
                </Button>
              </Link>
              <Link href="/tech">
                <Button variant="secondary" className="w-full sm:w-auto transition-all hover:shadow-[0_0_16px_var(--color-accent-pink)]">
                  Open Code Tools
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <WeatherDisplay />
          </div>
        </div>
      </section>

      {/* Breaking News Ticker */}
      <BreakingNewsTicker />

      {/* Chat on Home */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Chat with Mera AI</h3>
        <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur p-4">
          <div className="max-h-[400px] md:max-h-[450px]">
            <ResearchChat compact />
          </div>
        </div>
      </section>

      {/* Travel Destinations Ticker */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Popular Travel Destinations</h3>
        <TravelDestinationsTicker />
      </section>

      {/* Trending Now dashboard */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Trending Now</h3>
        </div>
        <TrendingCards />
      </section>
    </div>
  )
}
