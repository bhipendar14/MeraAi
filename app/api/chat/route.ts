import { type NextRequest, NextResponse } from "next/server"
import { gemini, geminiVision } from "@/lib/ai-gemini"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    console.log("[Chat] Request received")

    // Optional authentication
    const token = getTokenFromRequest(req)
    let user = null
    if (token) {
      user = verifyToken(token)
    }

    const body = await req.json()
    const { mode, messages } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("No messages provided")
    }

    const lastMessage = messages[messages.length - 1]
    const hasFile = lastMessage?.file

    // Get user's prompt
    const userPrompt =
      messages
        ?.filter((m: any) => m.role === "user")
        .map((m: any) => m.content)
        .join("\n\n") || ""

    console.log("[Chat] Mode:", mode, "Prompt length:", userPrompt.length, "Has file:", !!hasFile)

    if (!userPrompt.trim()) {
      throw new Error("Empty prompt")
    }

    // System prompts for different modes
    const systemPrompts = {
      debug: "You are a senior developer. Find bugs and propose concise fixes. Keep responses brief and actionable.",
      summarize: "You are a precise summarizer. Return 2-4 bullet points, crisp and factual.",
      explain: "You are a patient teacher. Explain complex topics in simple steps. Keep it concise - 2-3 paragraphs maximum.",
      research: "You are an expert research assistant. Provide clear, concise answers. Keep responses brief but informative - aim for 2-3 paragraphs maximum.",
    }

    const sys = systemPrompts[mode as keyof typeof systemPrompts] || systemPrompts.research

    let reply: string

    if (hasFile) {
      const file = lastMessage.file
      if (file.type.startsWith("image/")) {
        // Use vision API for images
        reply = await geminiVision(`${sys}\n\nUser:\n${userPrompt}`, file.data)
      } else {
        reply = "Sorry, I can only process image files (JPEG, PNG, GIF, WebP)."
      }
    } else {
      // Text-only chat
      const fullPrompt = `${sys}\n\nUser: ${userPrompt.trim()}`
      reply = await gemini(fullPrompt)
    }

    console.log("[Chat] Success! Reply length:", reply.length)
    return NextResponse.json({ reply })
  } catch (e: any) {
    console.error("[Chat] Error:", e.message)
    return NextResponse.json(
      { reply: `Error: ${e.message}. Please check the console for details.` },
      { status: 200 },
    )
  }
}
