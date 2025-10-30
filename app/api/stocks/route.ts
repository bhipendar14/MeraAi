import { NextRequest, NextResponse } from "next/server"
import { gemini } from "@/lib/ai-gemini"

const ALPHA_VANTAGE_API_KEY = "KKDZ5X4KB5MD0BHT"

// Popular stocks to show when no specific symbol is requested
const POPULAR_STOCKS = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "NFLX", "AMD", "INTC"
]

async function fetchStockData(symbol: string) {
  try {
    // Get current quote
    const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    const quoteResponse = await fetch(quoteUrl)
    const quoteData = await quoteResponse.json()

    if (quoteData["Error Message"] || quoteData["Note"]) {
      throw new Error(quoteData["Error Message"] || "API limit reached")
    }

    const quote = quoteData["Global Quote"]
    if (!quote) {
      throw new Error("No data found for symbol")
    }

    return {
      symbol: quote["01. symbol"],
      price: parseFloat(quote["05. price"]),
      change: parseFloat(quote["09. change"]),
      changePercent: parseFloat(quote["10. change percent"].replace("%", "")),
      volume: parseInt(quote["06. volume"]),
      previousClose: parseFloat(quote["08. previous close"]),
      open: parseFloat(quote["02. open"]),
      high: parseFloat(quote["03. high"]),
      low: parseFloat(quote["04. low"])
    }
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error)
    return null
  }
}

async function fetchHistoricalData(symbol: string) {
  try {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    const response = await fetch(url)
    const data = await response.json()

    if (data["Error Message"] || data["Note"]) {
      return []
    }

    const timeSeries = data["Time Series (Daily)"]
    if (!timeSeries) {
      return []
    }

    // Get last 30 days of data
    const dates = Object.keys(timeSeries).slice(0, 30).reverse()
    return dates.map(date => ({
      d: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      v: parseFloat(timeSeries[date]["4. close"])
    }))
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error)
    return []
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get("symbol") || "AAPL"

  console.log(`[Stocks API] Fetching data for ${symbol}`)

  try {
    // Fetch current stock data
    const stockData = await fetchStockData(symbol)
    
    if (!stockData) {
      return NextResponse.json({
        prices: [],
        list: [],
        summary: `Unable to fetch data for ${symbol}. Please check if the symbol is correct.`,
        error: "Stock not found"
      }, { status: 404 })
    }

    // Fetch historical data for chart
    const historicalData = await fetchHistoricalData(symbol)

    // Fetch popular stocks for the table
    const popularStocksData = []
    for (const stock of POPULAR_STOCKS.slice(0, 8)) { // Limit to 8 to avoid API limits
      const data = await fetchStockData(stock)
      if (data) {
        popularStocksData.push({
          symbol: data.symbol,
          name: getCompanyName(data.symbol),
          price: data.price,
          change: data.changePercent
        })
      }
      // Add delay to avoid hitting API limits
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    // Generate AI summary
    let summary = `${symbol} is currently trading at $${stockData.price.toFixed(2)}.`
    
    try {
      const summaryPrompt = `Provide a brief 2-3 sentence analysis of ${symbol} stock based on this data:
      Current Price: $${stockData.price}
      Change: ${stockData.changePercent.toFixed(2)}%
      Volume: ${stockData.volume.toLocaleString()}
      High: $${stockData.high}
      Low: $${stockData.low}
      
      Focus on the price movement and what it might indicate for investors.`

      summary = await gemini(summaryPrompt, true)
    } catch (error) {
      console.error("Failed to generate AI summary:", error)
      const trend = stockData.changePercent >= 0 ? "gaining" : "declining"
      const trendEmoji = stockData.changePercent >= 0 ? "📈" : "📉"
      summary = `${trendEmoji} ${symbol} is currently ${trend} ${Math.abs(stockData.changePercent).toFixed(2)}% today, trading at $${stockData.price.toFixed(2)}. The stock has a daily range of $${stockData.low.toFixed(2)} - $${stockData.high.toFixed(2)} with volume of ${stockData.volume.toLocaleString()} shares.`
    }

    return NextResponse.json({
      prices: historicalData,
      list: popularStocksData,
      summary,
      currentStock: {
        symbol: stockData.symbol,
        price: stockData.price,
        change: stockData.changePercent,
        volume: stockData.volume,
        high: stockData.high,
        low: stockData.low,
        open: stockData.open
      }
    })

  } catch (error: any) {
    console.error('[Stocks API] Error:', error)
    return NextResponse.json({
      prices: [],
      list: [],
      summary: `Unable to load stock data at the moment. This might be due to API limits or network issues. Please try again later.`,
      error: error.message
    }, { status: 500 })
  }
}

function getCompanyName(symbol: string): string {
  const companies: { [key: string]: string } = {
    "AAPL": "Apple Inc.",
    "MSFT": "Microsoft Corporation",
    "GOOGL": "Alphabet Inc.",
    "AMZN": "Amazon.com Inc.",
    "TSLA": "Tesla Inc.",
    "NVDA": "NVIDIA Corporation",
    "META": "Meta Platforms Inc.",
    "NFLX": "Netflix Inc.",
    "AMD": "Advanced Micro Devices",
    "INTC": "Intel Corporation",
    "ORCL": "Oracle Corporation",
    "CRM": "Salesforce Inc.",
    "ADBE": "Adobe Inc.",
    "PYPL": "PayPal Holdings",
    "UBER": "Uber Technologies",
    "SPOT": "Spotify Technology"
  }
  return companies[symbol] || symbol
}