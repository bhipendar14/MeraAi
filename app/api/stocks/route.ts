import { NextRequest, NextResponse } from 'next/server'
import { gemini } from '@/lib/ai-gemini'

// Mock stock data for demonstration
const MOCK_STOCKS = {
  NVDA: {
    name: "NVIDIA Corporation",
    price: 875.50,
    change: 2.45,
    prices: Array.from({ length: 30 }, (_, i) => ({
      d: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      v: 850 + Math.random() * 50 + i * 2
    }))
  },
  AAPL: {
    name: "Apple Inc.",
    price: 189.25,
    change: -0.85,
    prices: Array.from({ length: 30 }, (_, i) => ({
      d: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      v: 180 + Math.random() * 20 + i * 0.5
    }))
  },
  MSFT: {
    name: "Microsoft Corporation",
    price: 415.75,
    change: 1.25,
    prices: Array.from({ length: 30 }, (_, i) => ({
      d: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      v: 400 + Math.random() * 30 + i * 1
    }))
  },
  GOOGL: {
    name: "Alphabet Inc.",
    price: 142.50,
    change: 0.75,
    prices: Array.from({ length: 30 }, (_, i) => ({
      d: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      v: 135 + Math.random() * 15 + i * 0.3
    }))
  },
  TSLA: {
    name: "Tesla, Inc.",
    price: 248.75,
    change: -1.85,
    prices: Array.from({ length: 30 }, (_, i) => ({
      d: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      v: 240 + Math.random() * 20 + i * 0.8
    }))
  }
}

const DEFAULT_STOCKS = ['NVDA', 'AAPL', 'MSFT', 'GOOGL', 'TSLA']

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const symbol = searchParams.get('symbol')?.toUpperCase() || 'NVDA'

    // Get stock data (mock data for now)
    const stockData = MOCK_STOCKS[symbol as keyof typeof MOCK_STOCKS] || MOCK_STOCKS.NVDA
    
    // Generate list of stocks
    const list = DEFAULT_STOCKS.map(sym => {
      const stock = MOCK_STOCKS[sym as keyof typeof MOCK_STOCKS]
      return {
        symbol: sym,
        name: stock.name,
        price: stock.price,
        change: stock.change
      }
    })

    // Generate AI summary
    let summary = ''
    try {
      summary = await gemini(
        `Provide a brief market analysis for ${symbol} (${stockData.name}). Current price is $${stockData.price} with a ${stockData.change > 0 ? 'gain' : 'loss'} of ${Math.abs(stockData.change)}%. Keep it under 100 words and focus on key factors affecting the stock.`,
        true
      )
    } catch (error) {
      console.error('Error generating AI summary:', error)
      summary = `${stockData.name} is currently trading at $${stockData.price}, showing a ${stockData.change > 0 ? 'positive' : 'negative'} movement of ${stockData.change}%. Market conditions and company fundamentals continue to influence trading patterns.`
    }

    return NextResponse.json({
      prices: stockData.prices,
      list,
      summary
    })
  } catch (error) {
    console.error('Error in stocks API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}