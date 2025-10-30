"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"
import { generateText } from "ai"

interface StoryBuilderProps {
  onClose?: () => void
}

export function AIStoryBuilder({ onClose }: StoryBuilderProps) {
  const [gameState, setGameState] = useState<"setup" | "playing" | "reading">("setup")
  const [prompt, setPrompt] = useState("")
  const [story, setStory] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [genre, setGenre] = useState<"fantasy" | "scifi" | "mystery" | "adventure">("fantasy")
  const [storyLength, setStoryLength] = useState<"short" | "medium" | "long">("medium")

  const generateStory = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    try {
      const lengthGuide = {
        short: "2-3 paragraphs",
        medium: "4-5 paragraphs",
        long: "6-8 paragraphs",
      }

      const { text } = await generateText({
        model: "openai/gpt-5-mini",
        prompt: `Write a ${genre} story (${lengthGuide[storyLength]}) starting with: "${prompt}". Make it engaging and creative.`,
        maxOutputTokens: storyLength === "short" ? 300 : storyLength === "medium" ? 600 : 1000,
      })

      setStory(text)
      setGameState("reading")
    } catch (error) {
      console.error("Failed to generate story:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const continueStory = async () => {
    setIsLoading(true)
    try {
      const { text } = await generateText({
        model: "openai/gpt-5-mini",
        prompt: `Continue this ${genre} story with 2-3 more paragraphs:\n\n${story}\n\nContinue the story:`,
        maxOutputTokens: 400,
      })

      setStory(story + "\n\n" + text)
    } catch (error) {
      console.error("Failed to continue story:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const startNew = () => {
    setGameState("setup")
    setPrompt("")
    setStory("")
  }

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          AI Story Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {gameState === "setup" ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Create an AI-generated story with your own prompt!</p>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Genre:</label>
              <div className="grid grid-cols-2 gap-2">
                {(["fantasy", "scifi", "mystery", "adventure"] as const).map((g) => (
                  <Button
                    key={g}
                    variant={genre === g ? "default" : "outline"}
                    onClick={() => setGenre(g)}
                    className="capitalize text-xs"
                  >
                    {g}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Length:</label>
              <div className="grid grid-cols-3 gap-2">
                {(["short", "medium", "long"] as const).map((len) => (
                  <Button
                    key={len}
                    variant={storyLength === len ? "default" : "outline"}
                    onClick={() => setStoryLength(len)}
                    className="capitalize text-xs"
                  >
                    {len}
                  </Button>
                ))}
              </div>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Start your story... (e.g., 'A mysterious door appeared in the forest')"
              className="w-full rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm outline-none min-h-24 resize-none"
            />

            <Button onClick={generateStory} disabled={isLoading || !prompt.trim()} className="w-full">
              {isLoading ? "Creating Story..." : "Generate Story"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-md border border-border/60 max-h-64 overflow-y-auto">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{story}</p>
            </div>

            <div className="flex gap-2">
              <Button onClick={continueStory} disabled={isLoading} className="flex-1">
                {isLoading ? "Continuing..." : "Continue Story"}
              </Button>
              <Button onClick={startNew} variant="outline" className="flex-1 bg-transparent">
                New Story
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
