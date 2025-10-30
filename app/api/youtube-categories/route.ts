import { NextRequest, NextResponse } from "next/server"
import { gemini } from "@/lib/ai-gemini"

const YOUTUBE_API_KEY = "AIzaSyAQpx6o0nJHtoVJe5XCEUQE06nkw_A6Dzo"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category") || "trending"

  console.log(`[YouTube Categories API] Fetching ${category} videos...`)

  try {
    let url = ""
    let videos: any[] = []

    // Map categories to YouTube API endpoints and parameters
    switch (category) {
      case "trending":
        url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=US&maxResults=20&key=${YOUTUBE_API_KEY}`
        break
      case "gaming":
        url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=US&videoCategoryId=20&maxResults=20&key=${YOUTUBE_API_KEY}`
        break
      case "music":
        url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=US&videoCategoryId=10&maxResults=20&key=${YOUTUBE_API_KEY}`
        break
      case "tech":
        url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=US&videoCategoryId=28&maxResults=20&key=${YOUTUBE_API_KEY}`
        break
      case "comedy":
        url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=US&videoCategoryId=23&maxResults=20&key=${YOUTUBE_API_KEY}`
        break
      case "education":
        url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=US&videoCategoryId=27&maxResults=20&key=${YOUTUBE_API_KEY}`
        break
      case "sports":
        url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=US&videoCategoryId=17&maxResults=20&key=${YOUTUBE_API_KEY}`
        break
      case "news":
        url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=US&videoCategoryId=25&maxResults=20&key=${YOUTUBE_API_KEY}`
        break
      case "entertainment":
        url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=US&videoCategoryId=24&maxResults=20&key=${YOUTUBE_API_KEY}`
        break
      case "lifestyle":
        url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=US&videoCategoryId=22&maxResults=20&key=${YOUTUBE_API_KEY}`
        break
      default:
        url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=US&maxResults=20&key=${YOUTUBE_API_KEY}`
    }

    console.log(`[YouTube Categories API] Fetching from: ${url}`)

    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MeraAI-Entertainment-App/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[YouTube Categories API] YouTube returned ${data.items?.length || 0} videos`)

    if (data.items && Array.isArray(data.items)) {
      videos = data.items.map((video: any) => {
        // Try multiple thumbnail resolutions in order of preference
        const thumbnailUrl = video.snippet?.thumbnails?.maxres?.url ||
                            video.snippet?.thumbnails?.high?.url || 
                            video.snippet?.thumbnails?.medium?.url ||
                            video.snippet?.thumbnails?.standard?.url ||
                            video.snippet?.thumbnails?.default?.url ||
                            `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`
        
        console.log(`[YouTube] Video ${video.id} thumbnail: ${thumbnailUrl}`)
        
        return {
          id: video.id,
          title: video.snippet?.title || "",
          channel: video.snippet?.channelTitle || "",
          thumbnail: thumbnailUrl,
          views: video.statistics?.viewCount || "0",
          likes: video.statistics?.likeCount || "0",
          publishedAt: video.snippet?.publishedAt || "",
          description: video.snippet?.description?.substring(0, 200) || "",
          duration: video.contentDetails?.duration || "",
          category: category
        }
      })
    }

    console.log(`[YouTube Categories API] Processed ${videos.length} videos for ${category}`)

    // Generate AI summary for YouTube category
    let summary = `Discover the hottest ${category} videos on YouTube right now!`

    if (videos.length > 0) {
      try {
        const summaryPrompt = `Summarize these trending ${category} YouTube videos in 2-3 engaging sentences. Focus on what's popular and viral in this category right now.

Videos:
${videos.slice(0, 5).map((v: any) => `- "${v.title}" by ${v.channel} (${Number(v.views).toLocaleString()} views)`).join('\n')}`

        console.log(`[YouTube Categories API] Generating AI summary for ${category}...`)
        summary = await gemini(summaryPrompt, true)
        console.log(`[YouTube Categories API] AI summary generated successfully`)
      } catch (e) {
        console.error("[YouTube Categories API] Failed to generate AI summary:", e)
        const topChannels = videos.slice(0, 3).map((v: any) => v.channel).join(", ")
        summary = `The ${category} scene on YouTube is buzzing with incredible content from creators like ${topChannels} and many others. These trending videos are capturing millions of views with their engaging, entertaining, and high-quality content that's defining what's popular in ${category} right now.`
      }
    }

    return NextResponse.json({
      items: videos,
      summary,
      category,
      total: videos.length,
      source: "YouTube Data API v3"
    })

  } catch (error: any) {
    console.error('[YouTube Categories API] Error:', error)
    return NextResponse.json({
      items: [],
      summary: `Unable to load ${category} YouTube videos at the moment. Please try again later.`,
      error: error.message,
      category,
      total: 0
    }, { status: 500 })
  }
}