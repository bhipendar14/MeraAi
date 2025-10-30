"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain } from "lucide-react"
import { generateText } from "ai"

interface TwentyQuestionsProps {
  onClose?: () => void
}

export function AITwentyQuestions({ onClose }: TwentyQuestionsProps) {
  const [gameState, setGameState] = useState<"setup" | "playing" | "ended">("setup")
  const [secret, setSecret] = useState("")
  const [questions, setQuestions] = useState<Array<{ q: string; a: string }>>([])
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [guesses, setGuesses] = useState<string[]>([])
  const [currentGuess, setCurrentGuess] = useState("")
  const [gameResult, setGameResult] = useState<"won" | "lost" | null>(null)
  const [category, setCategory] = useState<"person" | "object" | "animal">("object")

  const startGame = async () => {
    setIsLoading(true)
    try {
      const { text } = await generateText({
        model: "openai/gpt-5-mini",
        prompt: `Think of a ${category}. Just respond with the name of the ${category} you're thinking of. Be specific but not too obscure.`,
        maxOutputTokens: 50,
      })

      setSecret(text.trim())
      setGameState("playing")
      setQuestions([])
      setGuesses([])
      setCurrentQuestion("")
      setGameResult(null)
    } catch (error) {
      console.error("Failed to start game:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const askQuestion = async () => {
    if (!currentQuestion.trim() || questions.length >= 20) return

    setIsLoading(true)
    try {
      const { text } = await generateText({
        model: "openai/gpt-5-mini",
        prompt: `You are thinking of: ${secret}. The user asks: "${currentQuestion}". Answer with only "Yes", "No", or "Sort of" based on whether their question applies to ${secret}.`,
        maxOutputTokens: 10,
      })

      const answer = text.trim()
      setQuestions([...questions, { q: currentQuestion, a: answer }])
      setCurrentQuestion("")
    } catch (error) {
      console.error("Failed to get answer:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const makeGuess = async () => {
    if (!currentGuess.trim()) return

    const newGuesses = [...guesses, currentGuess]
    setGuesses(newGuesses)

    if (currentGuess.toLowerCase() === secret.toLowerCase()) {
      setGameResult("won")
      setGameState("ended")
    } else if (newGuesses.length >= 3) {
      setGameResult("lost")
      setGameState("ended")
    }

    setCurrentGuess("")
  }

  const resetGame = () => {
    setGameState("setup")
    setSecret("")
    setQuestions([])
    setGuesses([])
    setCurrentQuestion("")
    setGameResult(null)
  }

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="w-5 h-5" />
          20 Questions with AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {gameState === "setup" ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Ask up to 20 yes/no questions to guess what I'm thinking!</p>
            <div className="grid grid-cols-3 gap-2">
              {(["person", "object", "animal"] as const).map((cat) => (
                <Button
                  key={cat}
                  variant={category === cat ? "default" : "outline"}
                  onClick={() => setCategory(cat)}
                  className="capitalize"
                >
                  {cat}
                </Button>
              ))}
            </div>
            <Button onClick={startGame} disabled={isLoading} className="w-full">
              {isLoading ? "Starting..." : "Start Game"}
            </Button>
          </div>
        ) : gameState === "playing" ? (
          <div className="space-y-4">
            <div className="text-sm">
              <p className="font-semibold mb-2">Questions Asked: {questions.length}/20</p>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {questions.map((item, idx) => (
                  <div key={idx} className="bg-muted/30 p-2 rounded text-xs border border-border/60">
                    <p className="font-semibold">Q: {item.q}</p>
                    <p className="text-muted-foreground">A: {item.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {questions.length < 20 && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && askQuestion()}
                  placeholder="Ask a yes/no question..."
                  className="w-full rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm outline-none"
                  autoFocus
                />
                <Button onClick={askQuestion} disabled={isLoading || !currentQuestion.trim()} className="w-full">
                  Ask Question
                </Button>
              </div>
            )}

            {questions.length > 0 && (
              <div className="space-y-2 border-t border-border/60 pt-4">
                <p className="text-sm font-semibold">Make a Guess ({guesses.length}/3):</p>
                <input
                  type="text"
                  value={currentGuess}
                  onChange={(e) => setCurrentGuess(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && makeGuess()}
                  placeholder="What am I thinking of?"
                  className="w-full rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm outline-none"
                />
                <Button onClick={makeGuess} disabled={!currentGuess.trim()} className="w-full">
                  Guess
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-md border text-center ${gameResult === "won" ? "bg-green-500/20 border-green-500/30" : "bg-red-500/20 border-red-500/30"}`}
            >
              <p className="text-sm font-semibold mb-2">{gameResult === "won" ? "You Won!" : "Game Over!"}</p>
              <p className="text-lg font-bold mb-2">I was thinking of: {secret}</p>
              {gameResult === "won" && <p className="text-sm">You guessed it in {guesses.length} tries!</p>}
            </div>
            <Button onClick={resetGame} className="w-full">
              Play Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
