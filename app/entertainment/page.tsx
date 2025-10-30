"use client"

import { EntertainmentGrid } from "@/components/entertainment-grid"

export default function EntertainmentPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Entertainment</h2>
        <p className="text-muted-foreground">Discover trending movies, music, and YouTube content with beautiful design.</p>
      </header>
      <EntertainmentGrid />
    </div>
  )
}
