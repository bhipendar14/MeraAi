import { type NextRequest, NextResponse } from "next/server"
import { gemini } from "@/lib/ai-gemini"

export async function POST(req: NextRequest) {
  try {
    const { mode, messages } = await req.json()
    const userPrompt =
      messages
        ?.filter((m: any) => m.role === "user")
        .map((m: any) => m.content)
        .join("\n\n") || ""

    const system =
      mode === "code"
        ? "You are a concise senior engineer. Provide minimal, correct code with brief explanations when needed."
        : mode === "summarize"
          ? "You are an efficient summarizer. Return crisp, factual bullet points."
          : mode === "recommend"
            ? "You are a helpful recommender. Provide practical, prioritized suggestions with brief reasons."
            : "You are a thoughtful general assistant. Be accurate and helpful."

    const reply = await gemini(`${system}\n\nUser:\n${userPrompt}`)
    return NextResponse.json({ reply })
  } catch (e: any) {
    return NextResponse.json({ error: "AI error", details: e?.message || "unknown" }, { status: 500 })
  }
}
