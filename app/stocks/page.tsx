"use client"

import { StocksModule } from "@/components/stocks-module"

export default function StocksPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Stocks</h2>
        <p className="text-muted-foreground">Live prices, a chart, and an AI summary.</p>
      </header>
      <StocksModule />
    </div>
  )
}
