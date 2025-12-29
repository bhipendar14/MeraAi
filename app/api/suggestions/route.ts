import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const { query } = await req.json()

        if (!query || query.length < 2) {
            return NextResponse.json({ suggestions: [] })
        }

        // Use Gemini to generate intelligent suggestions
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAZfcM0JLeu5Sywra-6JdbaOQlUmAUOAos"
        const model = "gemini-2.5-flash-lite"
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Based on the search query "${query}", suggest 3-4 related search queries that a user might be interested in. Return ONLY the suggestions as a simple numbered list, one per line. Be concise and relevant.`
                    }]
                }],
            }),
        })

        const data = await res.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

        // Parse suggestions from response
        const suggestions = text
            .split('\n')
            .filter((line: string) => line.trim().match(/^\d+[\.\)]/)) // Lines starting with numbers
            .map((line: string) => line.replace(/^\d+[\.\)]\s*/, '').trim()) // Remove numbering
            .filter((s: string) => s.length > 0)
            .slice(0, 4) // Max 4 suggestions

        return NextResponse.json({ suggestions })
    } catch (error: any) {
        console.error("[Suggestions API] Error:", error)
        return NextResponse.json({ suggestions: [] })
    }
}
