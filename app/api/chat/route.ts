import { type NextRequest, NextResponse } from "next/server"
import { gemini, geminiVision } from "@/lib/ai-gemini"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    console.log("[v0] Chat API route called")

    // Optional authentication - chat works for both authenticated and non-authenticated users
    const token = getTokenFromRequest(req)
    let user = null
    if (token) {
      user = verifyToken(token)
    }

    const body = await req.json()
    console.log("[v0] Request body:", JSON.stringify(body, null, 2))

    const { mode, messages } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("No messages provided")
    }

    const lastMessage = messages[messages.length - 1]
    const hasFile = lastMessage?.file

    const userPrompt =
      messages
        ?.filter((m: any) => m.role === "user")
        .map((m: any) => m.content)
        .join("\n\n") || ""

    console.log("[v0] Mode:", mode, "Prompt length:", userPrompt.length, "Has file:", !!hasFile)
    console.log("[v0] User prompt:", userPrompt)

    if (!userPrompt.trim()) {
      throw new Error("Empty prompt provided")
    }

    const sys =
      mode === "debug"
        ? "You are a senior developer. Find bugs and propose concise fixes in code."
        : mode === "summarize"
          ? "You are a precise summarizer. Return 2-4 bullet points, crisp and factual."
          : mode === "explain"
            ? "You are a patient teacher. Explain complex topics in simple steps."
            : "You are an expert research assistant. Cite sources when reasonable."

    let text: string

    if (hasFile) {
      const file = lastMessage.file
      if (file.type.startsWith("image/")) {
        // Use vision API for images
        text = await geminiVision(`${sys}\n\nUser:\n${userPrompt}`, file.data)
      } else if (file.type === "application/pdf") {
        // For PDFs, we'll use vision API with the base64 data
        // Gemini can handle PDF files directly
        text = await geminiVision(`${sys}\n\nUser:\n${userPrompt}\n\nAnalyze this PDF document.`, file.data)
      } else {
        text = "Sorry, I can only process images (JPEG, PNG, GIF, WebP) and PDF files."
      }
    } else {
      // Create a simple, clean prompt
      const cleanPrompt = `${sys}\n\nUser: ${userPrompt.trim()}`
      console.log("[v0] Final prompt being sent:", cleanPrompt)

      // Use gemini-2.0-flash directly since you have Pro subscription
      text = await gemini(cleanPrompt, false)
    }

    console.log("[v0] Gemini response received")
    return NextResponse.json({ reply: text })
  } catch (e: any) {
    console.error("[v0] Error in chat route:", e.message)
    console.error("[v0] Full error:", e)

    // Return more specific error message for debugging
    const errorMessage = e.message || "Unknown error occurred"
    return NextResponse.json(
      { reply: `Error: ${errorMessage}. Please check the console for details.` },
      { status: 200 },
    )
  }
}
