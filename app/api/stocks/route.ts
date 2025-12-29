import { NextRequest, NextResponse } from "next/server"
import { gemini } from "@/lib/ai-gemini"

// Expanded global stock list (50+ popular stocks)
const GLOBAL_STOCKS = {
  // US Tech Giants
  "AAPL": "Apple Inc.",
  "MSFT": "Microsoft Corp.",
  "GOOGL": "Alphabet Inc.",
  "AMZN": "Amazon.com Inc.",
  "META": "Meta Platforms Inc.",
  "TSLA": "Tesla Inc.",
  "NVDA": "NVIDIA Corp.",
  "NFLX": "Netflix Inc.",
  "AMD": "Advanced Micro Devices",
  "INTC": "Intel Corp.",

  // US Finance & Others
  "JPM": "JPMorgan Chase",
  "BAC": "Bank of America",
  "WMT": "Walmart Inc.",
  "V": "Visa Inc.",
  "MA": "Mastercard Inc.",
  "DIS": "Walt Disney Co.",
  "PYPL": "PayPal Holdings",
  "ADBE": "Adobe Inc.",
  "CRM": "Salesforce Inc.",
  "ORCL": "Oracle Corp.",

  // Indian Stocks (NSE)
  "RELIANCE.NS": "Reliance Industries",
  "TCS.NS": "Tata Consultancy Services",
  "HDFCBANK.NS": "HDFC Bank",
  "INFY.NS": "Infosys Ltd",
  "ICICIBANK.NS": "ICICI Bank",
  "HINDUNILVR.NS": "Hindustan Unilever",
  "ITC.NS": "ITC Ltd",
  "SBIN.NS": "State Bank of India",
  "BHARTIARTL.NS": "Bharti Airtel",
  "WIPRO.NS": "Wipro Ltd",

  // Chinese Stocks
  "BABA": "Alibaba Group",
  "BIDU": "Baidu Inc.",
  "JD": "JD.com Inc.",
  "PDD": "Pinduoduo Inc.",

  // European Stocks
  "SAP": "SAP SE",
  "ASML": "ASML Holding",

  // Japanese Stocks
  "SONY": "Sony Group Corp.",
  "TM": "Toyota Motor Corp.",

  // Crypto-related
  "COIN": "Coinbase Global",
  "MSTR": "MicroStrategy Inc.",

  // ETFs & Indices
  "SPY": "S&P 500 ETF",
  "QQQ": "Nasdaq 100 ETF",
  "DIA": "Dow Jones ETF"
}

const TICKER_STOCKS = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "NFLX", "JPM", "V"]

// Currency symbols and country codes for flags
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  INR: "₹",
  JPY: "¥",
  GBP: "£",
  EUR: "€",
  CNY: "¥"
}

// Cache for exchange rates (updates daily)
let exchangeRatesCache: any = null
let lastFetchTime = 0

// Cache for market movers (updates every 5 minutes)
let marketMoversCache: any = null
let marketMoversLastFetch = 0

async function getExchangeRates() {
  const now = Date.now()
  const ONE_HOUR = 3600000 // Cache for 1 hour

  if (exchangeRatesCache && (now - lastFetchTime) < ONE_HOUR) {
    return exchangeRatesCache
  }

  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    const data = await response.json()
    exchangeRatesCache = data.rates
    lastFetchTime = now
    return data.rates
  } catch (error) {
    console.error('[Stocks API] Failed to fetch exchange rates:', error)
    // Fallback rates
    return {
      USD: 1,
      INR: 83.5,
      JPY: 149.5,
      GBP: 0.79,
      EUR: 0.92,
      CNY: 7.24
    }
  }
}

async function getMarketMovers() {
  const now = Date.now()
  const FIVE_MINUTES = 300000 // Cache for 5 minutes

  if (marketMoversCache && (now - marketMoversLastFetch) < FIVE_MINUTES) {
    console.log('[Stocks API] Returning cached market movers data')
    return marketMoversCache
  }

  const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY || ""

  if (!ALPHA_VANTAGE_KEY) {
    console.warn('[Stocks API] No Alpha Vantage API key found for market movers')
    return { top_gainers: [], top_losers: [], most_actively_traded: [] }
  }

  try {
    console.log('[Stocks API] Fetching fresh market movers data from Alpha Vantage...')
    const url = `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${ALPHA_VANTAGE_KEY}`
    const response = await fetch(url, { cache: "no-store" })
    const data = await response.json()

    console.log('[Stocks API] Alpha Vantage response keys:', Object.keys(data))

    // Check if we got rate limited or error
    if (data.Note || data['Error Message']) {
      console.error('[Stocks API] Alpha Vantage error:', data.Note || data['Error Message'])
      return marketMoversCache || { top_gainers: [], top_losers: [], most_actively_traded: [] }
    }

    // Validate data structure
    if (!data.top_gainers && !data.top_losers && !data.most_actively_traded) {
      console.error('[Stocks API] Invalid data structure from Alpha Vantage')
      return marketMoversCache || { top_gainers: [], top_losers: [], most_actively_traded: [] }
    }

    marketMoversCache = data
    marketMoversLastFetch = now
    console.log('[Stocks API] Market movers data cached successfully')
    return data
  } catch (error) {
    console.error('[Stocks API] Market movers fetch failed:', error)
    return marketMoversCache || { top_gainers: [], top_losers: [], most_actively_traded: [] }
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get("action") || "quote"
  let symbol = (searchParams.get("symbol") || "NVDA").toUpperCase()
  const currency = searchParams.get("currency") || "USD"
  const searchQuery = searchParams.get("q") || ""
  const range = searchParams.get("range") || "1mo"

  // Map common Indian stock symbols to their NSE equivalents
  const indianStockMap: Record<string, string> = {
    "TCS": "TCS.NS",
    "RELIANCE": "RELIANCE.NS",
    "INFY": "INFY.NS",
    "INFOSYS": "INFY.NS",
    "HDFCBANK": "HDFCBANK.NS",
    "HDFC": "HDFCBANK.NS",
    "ICICIBANK": "ICICIBANK.NS",
    "ICICI": "ICICIBANK.NS",
    "WIPRO": "WIPRO.NS",
    "SBIN": "SBIN.NS",
    "ITC": "ITC.NS",
    "BHARTIARTL": "BHARTIARTL.NS",
    "AIRTEL": "BHARTIARTL.NS",
    "HINDUNILVR": "HINDUNILVR.NS",
    "HUL": "HINDUNILVR.NS"
  }

  // Auto-map Indian stocks if not already suffixed
  if (indianStockMap[symbol] && !symbol.includes('.')) {
    symbol = indianStockMap[symbol]
    console.log(`[Stocks API] Mapped ${searchParams.get("symbol")} to ${symbol}`)
  }

  console.log(`[Stocks API] Action: ${action}, Symbol: ${symbol}, Currency: ${currency}`)

  try {
    // Get exchange rates
    const rates = await getExchangeRates()
    const exchangeRate = rates[currency] || 1

    // Handle different actions
    if (action === "search") {
      // Global stock search using Alpha Vantage
      const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY || ""

      if (!ALPHA_VANTAGE_KEY) {
        console.warn('[Stocks API] No Alpha Vantage API key found')
        return NextResponse.json({ results: [] })
      }

      try {
        const searchUrl = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(searchQuery)}&apikey=${ALPHA_VANTAGE_KEY}`
        const response = await fetch(searchUrl)
        const data = await response.json()

        const results = (data.bestMatches || []).slice(0, 10).map((match: any) => ({
          symbol: match['1. symbol'],
          name: match['2. name'],
          region: match['4. region']
        }))

        return NextResponse.json({ results })
      } catch (error) {
        console.error('[Stocks API] Search failed:', error)
        return NextResponse.json({ results: [] })
      }
    }

    if (action === "ticker") {
      // Fetch ticker tape stocks
      const tickerData = await fetchMultipleStocks(TICKER_STOCKS, exchangeRate, currency)
      return NextResponse.json({ ticker: tickerData, currency, exchangeRate })
    }

    if (action === "gainers" || action === "losers" || action === "active") {
      // Fetch market movers using cached data
      try {
        const data = await getMarketMovers()

        let stocks = []
        if (action === "gainers" && data.top_gainers) {
          stocks = data.top_gainers.slice(0, 5).map((stock: any) => ({
            symbol: stock.ticker,
            name: stock.ticker,
            price: parseFloat(stock.price) * exchangeRate,
            change: parseFloat(stock.change_percentage.replace('%', '')),
            volume: parseInt(stock.volume)
          }))
        } else if (action === "losers" && data.top_losers) {
          stocks = data.top_losers.slice(0, 5).map((stock: any) => ({
            symbol: stock.ticker,
            name: stock.ticker,
            price: parseFloat(stock.price) * exchangeRate,
            change: parseFloat(stock.change_percentage.replace('%', '')),
            volume: parseInt(stock.volume)
          }))
        } else if (action === "active" && data.most_actively_traded) {
          stocks = data.most_actively_traded.slice(0, 5).map((stock: any) => ({
            symbol: stock.ticker,
            name: stock.ticker,
            price: parseFloat(stock.price) * exchangeRate,
            change: parseFloat(stock.change_percentage.replace('%', '')),
            volume: parseInt(stock.volume)
          }))
        }

        return NextResponse.json({ [action]: stocks, currency, exchangeRate })
      } catch (error) {
        console.error(`[Stocks API] ${action} fetch failed:`, error)
        return NextResponse.json({ [action]: [], currency, exchangeRate })
      }
    }

    // Default: Fetch single stock quote
    const quoteUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
    const quoteResponse = await fetch(quoteUrl, { cache: "no-store" })
    const quoteData = await quoteResponse.json()

    if (!quoteData?.chart?.result?.[0]) {
      return NextResponse.json({
        error: "Stock not found",
        summary: `Unable to fetch data for "${symbol}". Please check if the symbol is correct.`
      }, { status: 404 })
    }

    const result = quoteData.chart.result[0]
    const meta = result.meta
    const quote = result.indicators.quote[0]

    // Fetch historical data for chart with volume
    let chartData: any[] = []
    let volumeData: any[] = []
    try {
      const historicalUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=${range}`
      const historicalResponse = await fetch(historicalUrl, { cache: "no-store" })
      const historicalDataRaw = await historicalResponse.json()

      if (historicalDataRaw?.chart?.result?.[0]) {
        const histResult = historicalDataRaw.chart.result[0]
        const timestamps = histResult.timestamp
        const closes = histResult.indicators.quote[0].close
        const volumes = histResult.indicators.quote[0].volume

        if (timestamps && closes) {
          chartData = timestamps.map((timestamp: number, index: number) => ({
            d: new Date(timestamp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            v: closes[index] ? closes[index] * exchangeRate : null,
            vol: volumes[index] || 0
          })).filter((item: any) => item.v !== null)

          volumeData = chartData.map((item: any) => ({
            d: item.d,
            vol: item.vol
          }))
        }
      }
    } catch (e) {
      console.error("[Stocks API] Historical data fetch failed:", e)
    }

    // Extract stock data
    const currentPrice = (meta.regularMarketPrice || 0) * exchangeRate
    const previousClose = (meta.chartPreviousClose || meta.previousClose || 0) * exchangeRate
    const change = currentPrice - previousClose
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0
    const volume = meta.regularMarketVolume || 0
    const high = (quote.high?.[quote.high.length - 1] || meta.regularMarketDayHigh || 0) * exchangeRate
    const low = (quote.low?.[quote.low.length - 1] || meta.regularMarketDayLow || 0) * exchangeRate
    const open = (quote.open?.[0] || meta.regularMarketOpen || 0) * exchangeRate
    const marketCap = meta.marketCap || 0

    // Generate AI summary
    let summary = `${symbol} is currently trading at ${CURRENCY_SYMBOLS[currency]}${currentPrice.toFixed(2)}.`

    try {
      const summaryPrompt = `Provide a brief 2-3 sentence analysis of ${symbol} stock based on this data:
      Current Price: ${CURRENCY_SYMBOLS[currency]}${currentPrice.toFixed(2)}
      Change: ${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%
      Volume: ${volume.toLocaleString()}

      Focus on the price movement and what it might indicate for investors.`

      summary = await gemini(summaryPrompt, true)
    } catch (error) {
      const trend = changePercent >= 0 ? "gaining" : "declining"
      const trendEmoji = changePercent >= 0 ? "📈" : "📉"
      summary = `${trendEmoji} ${symbol} is currently ${trend} ${Math.abs(changePercent).toFixed(2)}% today, trading at ${CURRENCY_SYMBOLS[currency]}${currentPrice.toFixed(2)}.`
    }

    return NextResponse.json({
      prices: chartData,
      volumeData: volumeData,
      summary,
      currentStock: {
        symbol: symbol,
        name: GLOBAL_STOCKS[symbol] || symbol,
        price: currentPrice,
        change: changePercent,
        volume: volume,
        high: high,
        low: low,
        open: open,
        marketCap: marketCap
      },
      currency,
      exchangeRate,
      currencySymbol: CURRENCY_SYMBOLS[currency]
    })

  } catch (error: any) {
    console.error('[Stocks API] Error:', error)
    return NextResponse.json({
      error: error.message,
      summary: `Unable to load stock data. Please try again later.`
    }, { status: 500 })
  }
}

async function fetchMultipleStocks(symbols: string[], exchangeRate: number, currency: string) {
  const stocks = []

  try {
    // Batch fetch using Yahoo Finance
    const symbolsStr = symbols.join(',')
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolsStr}`
    const response = await fetch(url, { cache: "no-store" })
    const data = await response.json()

    if (data?.quoteResponse?.result) {
      for (const stock of data.quoteResponse.result) {
        const price = (stock.regularMarketPrice || 0) * exchangeRate
        const prevClose = (stock.regularMarketPreviousClose || 1) * exchangeRate
        const changePercent = ((price - prevClose) / prevClose) * 100

        stocks.push({
          symbol: stock.symbol,
          name: stock.longName || stock.shortName || GLOBAL_STOCKS[stock.symbol] || stock.symbol,
          price: price,
          change: changePercent,
          volume: stock.regularMarketVolume || 0
        })
      }
    }
  } catch (error) {
    console.error('[Stocks API] Batch fetch failed:', error)
  }

  return stocks
}