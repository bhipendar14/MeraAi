// YouTube API helper
export async function searchYouTube(query: string) {
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=4&type=video&key=${apiKey}`

    try {
        const res = await fetch(url)
        if (!res.ok) return []

        const data = await res.json()
        return data.items?.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.medium.url,
            channel: item.snippet.channelTitle,
        })) || []
    } catch (error) {
        console.error('YouTube API error:', error)
        return []
    }
}

// Custom Search API for web links and images
export async function searchGoogle(query: string, searchType: 'web' | 'image' = 'web') {
    const apiKey = process.env.NEXT_PUBLIC_CUSTOM_SEARCH_API_KEY
    const cx = process.env.NEXT_PUBLIC_CUSTOM_SEARCH_ENGINE_ID || "YOUR_SEARCH_ENGINE_ID" // User needs to create this

    const params = new URLSearchParams({
        key: apiKey,
        cx: cx,
        q: query,
        num: searchType === 'image' ? '6' : '5',
    })

    if (searchType === 'image') {
        params.append('searchType', 'image')
    }

    const url = `https://www.googleapis.com/customsearch/v1?${params}`

    try {
        const res = await fetch(url)
        if (!res.ok) {
            console.error('Custom Search API error:', await res.text())
            return []
        }

        const data = await res.json()

        if (searchType === 'image') {
            return data.items?.map((item: any) => ({
                link: item.link,
                title: item.title,
                thumbnail: item.image?.thumbnailLink || item.link,
                context: item.image?.contextLink,
            })) || []
        } else {
            return data.items?.map((item: any) => ({
                title: item.title,
                link: item.link,
                snippet: item.snippet,
            })) || []
        }
    } catch (error) {
        console.error('Custom Searching error:', error)
        return []
    }
}
