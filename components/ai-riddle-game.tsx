"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb } from "lucide-react"
import { generateText } from "ai"

interface RiddleGameProps {
  onClose?: () => void
}

export function AIRiddleGame({ onClose }: RiddleGameProps) {
  const [gameState, setGameState] = useState<"setup" | "playing" | "answered">("setup")
  const [riddle, setRiddle] = useState("")
  const [answer, setAnswer] = useState("")
  const [userAnswer, setUserAnswer] = useState("")
  const [feedback, setFeedback] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)

  const generateRiddle = async () => {
    setIsLoading(true)
    try {
      const { text } = await generateText({
        model: "openai/gpt-5-mini",
        prompt: `Generate a ${difficulty} riddle with a clear, concise answer. Format: RIDDLE: [riddle text] ANSWER: [answer]`,
        maxOutputTokens: 200,
      })

      const riddleMatch = text.match(/RIDDLE:\s*(.+?)\s*ANSWER:\s*(.+?)(?:\n|$)/s)
      if (riddleMatch) {
        setRiddle(riddleMatch[1].trim())
        setAnswer(riddleMatch[2].trim().toLowerCase())
        setGameState("playing")
        setUserAnswer("")
        setFeedback("")
        setAttempts(0)
      }
    } catch (error) {
      setFeedback("Failed to generate riddle. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const checkAnswer = async () => {
    if (!userAnswer.trim()) {
      setFeedback("Please enter an answer!")
      return
    }

    setAttempts(attempts + 1)
    const isCorrect = userAnswer.toLowerCase().includes(answer) || answer.includes(userAnswer.toLowerCase())

    if (isCorrect) {
      const points = Math.max(10 - attempts * 2, 1)
      setScore(score + points)
      setFeedback(`Correct! You earned ${points} points!`)
      setGameState("answered")
    } else if (attempts >= 3) {
      setFeedback(`Game Over! The answer was: ${answer}`)
      setGameState("answered")
    } else {
      setFeedback(`Not quite! You have ${3 - attempts} attempts left.`)
    }
  }

  const playAgain = () => {
    setUserAnswer("")
    setFeedback("")
    generateRiddle()
  }

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          AI Riddle Master
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {gameState === "setup" ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Select difficulty and start solving riddles!</p>
            <div className="grid grid-cols-3 gap-2">
              {(["easy", "medium", "hard"] as const).map((level) => (
                <Button
                  key={level}
                  variant={difficulty === level ? "default" : "outline"}
                  onClick={() => setDifficulty(level)}
                  className="capitalize"
                >
                  {level}
                </Button>
              ))}
            </div>
            <Button onClick={generateRiddle} disabled={isLoading} className="w-full">
              {isLoading ? "Generating..." : "Start Game"}
            </Button>
            {score > 0 && <p className="text-sm font-semibold text-center">Score: {score}</p>}
          </div>
        ) : gameState === "playing" ? (
          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-md border border-border/60">
              <p className="text-sm font-semibold mb-2">Riddle:</p>
              <p className="text-base">{riddle}</p>
            </div>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && checkAnswer()}
              placeholder="Your answer..."
              className="w-full rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm outline-none"
              autoFocus
            />
            {feedback && (
              <div
                className={`p-3 rounded-md text-sm ${attempts >= 3 || userAnswer.toLowerCase().includes(answer) ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`}
              >
                {feedback}
              </div>
            )}
            <Button onClick={checkAnswer} disabled={isLoading} className="w-full">
              Submit Answer
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-4 rounded-md border border-purple-500/30 text-center">
              <p className="text-sm font-semibold mb-2">Round Complete!</p>
              <p className="text-lg font-bold">Score: {score}</p>
            </div>
            <Button onClick={playAgain} className="w-full">
              Next Riddle
            </Button>
            <Button onClick={() => setGameState("setup")} variant="outline" className="w-full">
              Change Difficulty
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
