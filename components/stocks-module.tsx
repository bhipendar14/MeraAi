"use client"

import type React from "react"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, CartesianGrid } from "recharts"
import { TrendingUp, DollarSign, Search } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())
const USD_TO_INR = 83.5 // Approximate conversion rate

export function StocksModule() {
  const [symbol, setSymbol] = useState("NVDA")
  const [inputValue, setInputValue] = useState("NVDA")
  const [currency, setCurrency] = useState<"USD" | "INR">("USD")

  const { data, error, isLoading } = useSWR(`/api/stocks?symbol=${symbol}`, fetcher, {
    refreshInterval: 300000,
    revalidateOnFocus: false,
  })

  const prices = data?.prices || []
  const list = data?.list || []
  const summary = data?.summary || "Loading stock analysis..."

  const convertPrice = (price: number) => {
    return currency === "INR" ? price * USD_TO_INR : price
  }

  const convertedPrices = prices.map((p: any) => ({
    ...p,
    v: convertPrice(p.v),
  }))

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      setSymbol(inputValue.toUpperCase())
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-col sm:flex-row">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Enter stock symbol (e.g., AAPL, MSFT, GOOGL)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-chart-2"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-chart-2 text-white font-medium hover:opacity-90 transition-opacity"
          >
            Search
          </button>
        </form>
        <div className="flex gap-2 bg-muted rounded-lg p-1">
          <button
            onClick={() => setCurrency("USD")}
            className={`px-3 py-1 rounded transition-colors ${
              currency === "USD" ? "bg-chart-2 text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            USD
          </button>
          <button
            onClick={() => setCurrency("INR")}
            className={`px-3 py-1 rounded transition-colors ${
              currency === "INR" ? "bg-chart-2 text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            INR
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/60 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur lg:col-span-2 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-chart-2" />
              Last 30 Days Performance - {symbol} ({currency})
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chart-2" />
                  <div className="text-sm text-muted-foreground">Loading chart data...</div>
                </div>
              </div>
            )}
            {error && (
              <div className="flex items-center justify-center h-full text-red-400">Error loading chart data</div>
            )}
            {!isLoading && !error && convertedPrices.length === 0 && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No chart data available
              </div>
            )}
            {!isLoading && !error && convertedPrices.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={convertedPrices}>
                  <defs>
                    <linearGradient id="stockGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                  <XAxis dataKey="d" tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    tickFormatter={(value) => `${currency === "INR" ? "₹" : "$"}${value.toFixed(0)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value: any) => [`${currency === "INR" ? "₹" : "$"}${value.toFixed(2)}`, "Price"]}
                  />
                  <Area type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} fill="url(#stockGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-chart-3" />
              AI Market Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-3 bg-muted/50 rounded animate-pulse" />
                <div className="h-3 bg-muted/50 rounded animate-pulse w-5/6" />
                <div className="h-3 bg-muted/50 rounded animate-pulse w-4/6" />
              </div>
            ) : (
              <p className="text-foreground">{summary}</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Live Prices</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {isLoading && <div className="text-center py-8 text-muted-foreground">Loading stock prices...</div>}
            {!isLoading && list.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No stock data available</div>
            )}
            {!isLoading && list.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Price ({currency})</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((r: any) => (
                    <TableRow key={r.symbol}>
                      <TableCell>{r.symbol}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.name}</TableCell>
                      <TableCell className="text-right">
                        {currency === "INR" ? "₹" : "$"}
                        {convertPrice(r.price).toFixed(2)}
                      </TableCell>
                      <TableCell className={r.change >= 0 ? "text-right text-emerald-400" : "text-right text-red-400"}>
                        {r.change >= 0 ? "+" : ""}
                        {r.change.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
