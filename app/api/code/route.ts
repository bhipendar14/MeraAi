import { type NextRequest, NextResponse } from "next/server"
import { gemini } from "@/lib/ai-gemini"

const GEMINI_API_KEY = "AIzaSyD0VmHLF6QGCW08-I6PzhW645Nql0iN5lA"
const PISTON_API = "https://emkc.org/api/v2/piston/execute"

const LANGUAGE_MAP: Record<string, string> = {
  javascript: "javascript",
  python: "python",
  java: "java",
  cpp: "cpp",
  c: "c",
  csharp: "csharp",
  go: "go",
  rust: "rust",
}

async function executeCodeWithPiston(code: string, language: string) {
  const runtime = LANGUAGE_MAP[language]
  if (!runtime) {
    return { error: `Language ${language} not supported` }
  }

  try {
    const response = await fetch(PISTON_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: runtime,
        version: "*",
        files: [{ name: `main.${LANGUAGE_MAP[language]}`, content: code }],
      }),
    })

    if (!response.ok) {
      return { error: `Piston API error: ${response.status}` }
    }

    const data = await response.json()
    const output = data.run?.stdout || data.run?.stderr || "No output"
    const error = data.run?.stderr ? true : false

    return { output, error }
  } catch (e: any) {
    return { error: `Execution failed: ${e.message}` }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { code, language, action } = await req.json()

    if (action === "run") {
      const result = await executeCodeWithPiston(code, language)
      return NextResponse.json(result)
    }

    if (action === "fix") {
      const fixPrompt = `You are an expert ${language} developer. Fix the bugs in this code and return ONLY the corrected code without any explanations or markdown:\n\n${code}`
      try {
        const fixedCode = await gemini(fixPrompt, true)
        return NextResponse.json({
          output: fixedCode || "Unable to fix code. Please try again.",
          fixed: !!fixedCode,
        })
      } catch (e: any) {
        return NextResponse.json({
          output: `Error: ${e.message}`,
          error: true,
        })
      }
    }

    if (action === "explain") {
      const explainPrompt = `Explain this ${language} code in a clear, beginner-friendly way. Break it down step-by-step, explain what each part does, and explain the overall purpose:\n\n${code}`
      try {
        const explanation = await gemini(explainPrompt, true)
        return NextResponse.json({
          output: explanation || "Unable to explain code. Please try again.",
          explained: !!explanation,
        })
      } catch (e: any) {
        return NextResponse.json({
          output: `Error: ${e.message}`,
          error: true,
        })
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error: any) {
    console.log("[v0] Code API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
