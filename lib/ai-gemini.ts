const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAeQZ8GOxlratY70LSztfCuo2gUkULLZ4s"

/**
 * Simple Gemini API integration
 */
export async function gemini(prompt: string) {
  const model = "gemini-2.5-flash-lite"
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`

  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is missing")
  }

  console.log(`[Gemini] Calling ${model}...`)

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error?.message || response.statusText
      console.error(`[Gemini] Error:`, errorMessage)
      throw new Error(`Gemini API error: ${errorMessage}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    console.log(`[Gemini] Success! Received ${text.length} characters`)
    return text
  } catch (e: any) {
    console.error("[Gemini] Error:", e.message)
    throw e
  }
}

/**
 * Gemini Vision API for images
 */
export async function geminiVision(prompt: string, base64Data: string) {
  const model = "gemini-2.5-flash-lite"
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`

  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is missing")
  }

  // Extract mime type and base64 data
  const matches = base64Data.match(/data:([^;]+);base64,(.+)/)
  if (!matches) {
    throw new Error("Invalid base64 data format")
  }

  const mimeType = matches[1]
  const base64 = matches[2]

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
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
    throw new Error(`Gemini Vision API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
  return text
}
