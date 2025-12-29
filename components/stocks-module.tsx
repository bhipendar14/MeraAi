"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, CartesianGrid, Bar, BarChart, ComposedChart } from "recharts"
import { TrendingUp, TrendingDown, Search, ChevronDown, Activity } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { saveActivity } from "@/lib/history-utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// Country code mapping for flags API
const COUNTRY_CODES: Record<string, string> = {
  USD: "US",
  INR: "IN",
  JPY: "JP",
  GBP: "GB",
  EUR: "FR", // Using France for EUR
  CNY: "CN"
}

// Country/Currency options with flag API
const CURRENCIES = [
  { code: "USD", name: "United States", symbol: "$" },
  { code: "INR", name: "India", symbol: "₹" },
  { code: "JPY", name: "Japan", symbol: "¥" },
  { code: "GBP", name: "United Kingdom", symbol: "£" },
  { code: "EUR", name: "European Union", symbol: "€" },
  { code: "CNY", name: "China", symbol: "¥" }
]

const TIMEFRAMES = [
  { label: "1D", value: "1d" },
  { label: "1W", value: "5d" },
  { label: "1M", value: "1mo" },
  { label: "3M", value: "3mo" },
  { label: "1Y", value: "1y" }
]

export function StocksModule() {
  const { token } = useAuth()
  const [symbol, setSymbol] = useState("NVDA")
  const [inputValue, setInputValue] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [timeframe, setTimeframe] = useState("1mo")
  const searchRef = useRef<HTMLDivElement>(null)

  const selectedCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0]
  const flagUrl = `https://flagsapi.com/${COUNTRY_CODES[currency]}/flat/64.png`

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Main stock data
  const { data, error, isLoading } = useSWR(
    `/api/stocks?symbol=${symbol}&currency=${currency}&range=${timeframe}`,
    fetcher,
    { refreshInterval: 30000, revalidateOnFocus: false }
  )

  // Ticker tape data
  const { data: tickerData } = useSWR(
    `/api/stocks?action=ticker&currency=${currency}`,
    fetcher,
    { refreshInterval: 30000 }
  )

  // Market movers
  const { data: gainersData } = useSWR(
    `/api/stocks?action=gainers&currency=${currency}`,
    fetcher,
    { refreshInterval: 60000 }
  )

  const { data: losersData } = useSWR(
    `/api/stocks?action=losers&currency=${currency}`,
    fetcher,
    { refreshInterval: 60000 }
  )

  const { data: activeData } = useSWR(
    `/api/stocks?action=active&currency=${currency}`,
    fetcher,
    { refreshInterval: 60000 }
  )

  // Search autocomplete - only when typing
  const { data: searchData } = useSWR(
    inputValue.length >= 2 && showSearchResults ? `/api/stocks?action=search&q=${inputValue}` : null,
    fetcher
  )

  const prices = data?.prices || []
  const volumeData = data?.volumeData || []
  const summary = data?.summary || "Loading stock analysis..."
  const currentStock = data?.currentStock || {}
  const ticker = tickerData?.ticker || []
  const gainers = gainersData?.gainers || []
  const losers = losersData?.losers || []
  const active = activeData?.active || []

  const handleSearch = async (e?: React.FormEvent, selectedSymbol?: string) => {
    if (e) e.preventDefault()
    const searchSymbol = selectedSymbol || inputValue
    if (searchSymbol.trim()) {
      setSymbol(searchSymbol.toUpperCase())
      setInputValue("")
      setShowSearchResults(false)

      // Save to history - don't save price/change as they're stale
      if (token) {
        await saveActivity(token, 'stocks', 'search', {
          symbol: searchSymbol.toUpperCase(),
          name: ''
        })
      }
    }
  }

  const handleStockClick = async (stockSymbol: string) => {
    setSymbol(stockSymbol)
    setInputValue("")
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // Save to history
    if (token) {
      await saveActivity(token, 'stocks', 'view', {
        symbol: stockSymbol,
        name: '',
        price: undefined,
        change: undefined
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Bar and Currency Selector */}
      <div className="flex gap-3 flex-col sm:flex-row">
        {/* Search */}
        <div className="relative flex-1" ref={searchRef}>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <input
                type="text"
                placeholder="Search any stock globally (e.g., AAPL, TCS, RELIANCE)..."
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  setShowSearchResults(true)
                }}
                onFocus={() => setShowSearchResults(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(e as any)
                  }
                }}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
            >
              Search
            </button>
          </form>

          {/* Search Results Dropdown */}
          {showSearchResults && searchData?.results && searchData.results.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-2xl z-50 max-h-80 overflow-y-auto">
              {searchData.results.map((result: any) => (
                <button
                  key={result.symbol}
                  onClick={() => handleSearch(undefined, result.symbol)}
                  className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center justify-between group"
                >
                  <div className="flex-1">
                    <div className="font-bold text-foreground group-hover:text-blue-500 transition-colors">
                      {result.symbol}
                    </div>
                    <div className="text-sm text-muted-foreground">{result.name}</div>
                    {result.region && (
                      <div className="text-xs text-muted-foreground/70">{result.region}</div>
                    )}
                  </div>
                  <Search className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Currency Selector with Real Flags */}
        <div className="relative">
          <button
            onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-background hover:bg-accent transition-colors min-w-[200px]"
          >
            <Image
              src={flagUrl}
              alt={selectedCurrency.name}
              width={32}
              height={24}
              className="rounded"
            />
            <div className="flex-1 text-left">
              <div className="font-medium">{selectedCurrency.code}</div>
              <div className="text-xs text-muted-foreground">{selectedCurrency.name}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>

          {showCurrencyDropdown && (
            <div className="absolute top-full mt-2 right-0 bg-card border border-border rounded-lg shadow-2xl z-50 min-w-[240px]">
              {CURRENCIES.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => {
                    setCurrency(curr.code)
                    setShowCurrencyDropdown(false)
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-3 ${curr.code === currency ? 'bg-accent' : ''
                    }`}
                >
                  <Image
                    src={`https://flagsapi.com/${COUNTRY_CODES[curr.code]}/flat/64.png`}
                    alt={curr.name}
                    width={32}
                    height={24}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{curr.code}</div>
                    <div className="text-xs text-muted-foreground">{curr.name}</div>
                  </div>
                  {curr.code === currency && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Stock Display */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart with Volume */}
        <Card className="border-border/60 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur lg:col-span-2 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  {currentStock.symbol || symbol}
                  <span className="text-sm font-normal text-muted-foreground">
                    {currentStock.name}
                  </span>
                </CardTitle>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-3xl font-bold">
                    {selectedCurrency.symbol}{currentStock.price?.toFixed(2) || '0.00'}
                  </span>
                  <span className={`text-lg font-semibold flex items-center gap-1 ${(currentStock.change || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                    {(currentStock.change || 0) >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    {(currentStock.change || 0) >= 0 ? '+' : ''}{currentStock.change?.toFixed(2) || '0.00'}%
                  </span>
                </div>
              </div>
            </div>

            {/* Timeframe Selector */}
            <div className="flex gap-2 mt-4">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setTimeframe(tf.value)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${timeframe === tf.value
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                    }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Price Chart */}
            <div className="h-64">
              {isLoading && (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                    <div className="text-sm text-muted-foreground">Loading chart...</div>
                  </div>
                </div>
              )}
              {!isLoading && prices.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={prices}>
                    <defs>
                      <linearGradient id="stockGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis
                      dataKey="d"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#9ca3af", fontSize: 12 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#9ca3af", fontSize: 12 }}
                      tickFormatter={(value) => `${selectedCurrency.symbol}${value.toFixed(0)}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                      formatter={(value: any) => [`${selectedCurrency.symbol}${value.toFixed(2)}`, "Price"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#stockGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Volume Chart */}
            {!isLoading && volumeData.length > 0 && (
              <div className="h-32">
                <div className="text-xs text-muted-foreground mb-2 font-medium">Volume</div>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                    <XAxis
                      dataKey="d"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#9ca3af", fontSize: 10 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#9ca3af", fontSize: 10 }}
                      tickFormatter={(value) => {
                        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
                        return value.toString()
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                      formatter={(value: any) => [value.toLocaleString(), "Volume"]}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      itemStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Bar
                      dataKey="vol"
                      radius={[4, 4, 0, 0]}
                      fill="#10b981"
                      shape={(props: any) => {
                        const { x, y, width, height, index } = props
                        // Determine color based on price change
                        let fillColor = "#10b981" // green default
                        if (index > 0 && prices[index] && prices[index - 1]) {
                          const currentPrice = prices[index].v
                          const previousPrice = prices[index - 1].v
                          fillColor = currentPrice >= previousPrice ? "#10b981" : "#ef4444" // green if up, red if down
                        }
                        return (
                          <rect
                            x={x}
                            y={y}
                            width={width}
                            height={height}
                            fill={fillColor}
                            rx={4}
                            ry={4}
                          />
                        )
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Info & AI Summary */}
        <div className="space-y-6">
          {/* Key Metrics */}
          <Card className="border-border/60 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-400" />
                Key Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Open</span>
                <span className="font-semibold">{selectedCurrency.symbol}{currentStock.open?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">High</span>
                <span className="font-semibold text-emerald-400">{selectedCurrency.symbol}{currentStock.high?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Low</span>
                <span className="font-semibold text-red-400">{selectedCurrency.symbol}{currentStock.low?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Volume</span>
                <span className="font-semibold">{(currentStock.volume || 0).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* AI Summary */}
          <Card className="border-border/60 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-400" />
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
        </div>
      </div>

      {/* Market Movers */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Top Gainers */}
        <MarketMoverCard
          title="Top Gainers"
          icon={<TrendingUp className="w-4 h-4" />}
          stocks={gainers}
          currencySymbol={selectedCurrency.symbol}
          onStockClick={handleStockClick}
          type="gainers"
        />

        {/* Top Losers */}
        <MarketMoverCard
          title="Top Losers"
          icon={<TrendingDown className="w-4 h-4" />}
          stocks={losers}
          currencySymbol={selectedCurrency.symbol}
          onStockClick={handleStockClick}
          type="losers"
        />

        {/* Most Active */}
        <MarketMoverCard
          title="Most Active"
          icon={<Activity className="w-4 h-4" />}
          stocks={active}
          currencySymbol={selectedCurrency.symbol}
          onStockClick={handleStockClick}
          type="active"
        />
      </div>

      <style jsx global>{`
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-ticker {
          animation: ticker 30s linear infinite;
        }

        .ticker-wrapper:hover .animate-ticker {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}

interface MarketMoverCardProps {
  title: string
  icon: React.ReactNode
  stocks: any[]
  currencySymbol: string
  onStockClick: (symbol: string) => void
  type: 'gainers' | 'losers' | 'active'
}

function MarketMoverCard({ title, icon, stocks, currencySymbol, onStockClick, type }: MarketMoverCardProps) {
  const iconColor = type === 'gainers' ? 'text-emerald-400' : type === 'losers' ? 'text-red-400' : 'text-cyan-400'
  const borderColor = type === 'gainers' ? 'border-emerald-500/20' : type === 'losers' ? 'border-red-500/20' : 'border-cyan-500/20'

  return (
    <Card className={`border-border/60 bg-card/60 backdrop-blur ${borderColor}`}>
      <CardHeader className="pb-3">
        <CardTitle className={`text-base flex items-center gap-2 ${iconColor}`}>
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {stocks.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Loading...
          </div>
        ) : (
          stocks.slice(0, 5).map((stock: any) => (
            <button
              key={stock.symbol}
              onClick={() => onStockClick(stock.symbol)}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors group"
            >
              <div className="flex-1 text-left">
                <div className="font-semibold text-sm group-hover:text-blue-500 transition-colors">
                  {stock.symbol}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {stock.name}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {currencySymbol}{stock.price?.toFixed(2)}
                </div>
                <div className={`text-xs font-semibold ${stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                  {stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)}%
                </div>
              </div>
            </button>
          ))
        )}
      </CardContent>
    </Card>
  )
}
