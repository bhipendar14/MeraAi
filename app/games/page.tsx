"use client"

import { GamesModule } from "@/components/games-module"

export default function GamesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Mini Games</h2>
        <p className="text-muted-foreground">Take a quick break — fun and simple.</p>
      </header>
      <GamesModule />
    </div>
  )
}
