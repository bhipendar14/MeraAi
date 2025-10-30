const GEMINI_API_KEY = "AIzaSyDgfR2hyqxhABpLsVdumR5XKkJscAOAQeY"

/**
 * Calls Gemini directly via REST API with a prompt and returns text.
 * @param prompt - The prompt to send to Gemini
 * @param useFlash - If true, uses gemini-2.0-flash for speed; otherwise uses gemini-1.5-pro for accuracy
 */
export async function gemini(prompt: string, useFlash = false) {

  // Always use gemini-2.0-flash since you have Pro subscription and quota available
  const model = "gemini-2.0-flash"
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}`

  console.log("[v0] Calling Gemini API with model:", model)

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("[v0] Gemini API error:", response.status, errorText)
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
  console.log("[v0] Gemini response received, length:", text.length)
  return text
}

/**
 * Calls Gemini Vision API with a prompt and base64-encoded file
 * @param prompt - The prompt to send to Gemini
 * @param base64Data - Base64-encoded file data (with data:mime/type;base64, prefix)
 */
export async function geminiVision(prompt: string, base64Data: string) {
  const model = "gemini-2.0-flash"
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}`

  console.log("[v0] Calling Gemini Vision API with model:", model)

  // Extract mime type and base64 data
  const matches = base64Data.match(/data:([^;]+);base64,(.+)/)
  if (!matches) {
    throw new Error("Invalid base64 data format")
  }

  const mimeType = matches[1]
  const base64 = matches[2]

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64,
              },
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("[v0] Gemini Vision API error:", response.status, errorText)
    throw new Error(`Gemini Vision API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
  console.log("[v0] Gemini Vision response received, length:", text.length)
  return text
}

/**
 * Extracts the first valid JSON array/object from a model response.
 * Falls back to JSON.parse on full text if it looks like JSON.
 */
export function extractJson<T = any>(raw: string): T | null {
  try {
    const trimmed = raw.trim()
    if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
      return JSON.parse(trimmed) as T
    }
  } catch { }

  const match = raw.match(/```json\s*([\s\S]*?)```/i) || raw.match(/(\[.*\]|\{[\s\S]*\})/s)
  if (match) {
    try {
      return JSON.parse(match[1] ?? match[0]) as T
    } catch { }
  }

  return null
}