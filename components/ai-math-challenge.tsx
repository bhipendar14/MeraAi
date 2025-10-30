"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator } from "lucide-react"
import { generateText } from "ai"

interface MathChallengeProps {
  onClose?: () => void
}

export function AIMathChallenge({ onClose }: MathChallengeProps) {
  const [gameState, setGameState] = useState<"setup" | "playing" | "result">("setup")
  const [problem, setProblem] = useState("")
  const [correctAnswer, setCorrectAnswer] = useState("")
  const [userAnswer, setUserAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [problemType, setProblemType] = useState<"algebra" | "geometry" | "calculus">("algebra")

  const generateProblem = async () => {
    setIsLoading(true)
    try {
      const difficultyDesc = {
        easy: "simple",
        medium: "moderate",
        hard: "challenging",
      }

      const { text } = await generateText({
        model: "openai/gpt-5-mini",
        prompt: `Generate a ${difficultyDesc[difficulty]} ${problemType} problem. Format: PROBLEM: [problem] ANSWER: [numerical answer only]`,
        maxOutputTokens: 200,
      })

      const match = text.match(/PROBLEM:\s*(.+?)\s*ANSWER:\s*(.+?)(?:\n|$)/s)
      if (match) {
        setProblem(match[1].trim())
        setCorrectAnswer(match[2].trim())
        setGameState("playing")
        setUserAnswer("")
        setFeedback("")
      }
    } catch (error) {
      setFeedback("Failed to generate problem. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const checkAnswer = () => {
    if (!userAnswer.trim()) {
      setFeedback("Please enter an answer!")
      return
    }

    const userNum = Number.parseFloat(userAnswer)
    const correctNum = Number.parseFloat(correctAnswer)

    if (Math.abs(userNum - correctNum) < 0.01) {
      setScore(score + 10)
      setFeedback("Correct! Great job!")
      setGameState("result")
    } else {
      setFeedback(`Incorrect. The answer was ${correctAnswer}`)
      setGameState("result")
    }
  }

  const nextProblem = () => {
    setUserAnswer("")
    generateProblem()
  }

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          AI Math Challenge
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {gameState === "setup" ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Solve AI-generated math problems!</p>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Type:</label>
              <div className="grid grid-cols-3 gap-2">
                {(["algebra", "geometry", "calculus"] as const).map((type) => (
                  <Button
                    key={type}
                    variant={problemType === type ? "default" : "outline"}
                    onClick={() => setProblemType(type)}
                    className="capitalize text-xs"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Difficulty:</label>
              <div className="grid grid-cols-3 gap-2">
                {(["easy", "medium", "hard"] as const).map((level) => (
                  <Button
                    key={level}
                    variant={difficulty === level ? "default" : "outline"}
                    onClick={() => setDifficulty(level)}
                    className="capitalize text-xs"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>

            <Button onClick={generateProblem} disabled={isLoading} className="w-full">
              {isLoading ? "Generating..." : "Start Challenge"}
            </Button>
            {score > 0 && <p className="text-sm font-semibold text-center">Score: {score}</p>}
          </div>
        ) : gameState === "playing" ? (
          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-md border border-border/60">
              <p className="text-sm font-semibold mb-2">Problem:</p>
              <p className="text-base">{problem}</p>
            </div>

            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && checkAnswer()}
              placeholder="Enter your answer..."
              className="w-full rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm outline-none"
              autoFocus
            />

            <Button onClick={checkAnswer} disabled={isLoading} className="w-full">
              Submit Answer
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-md border text-center ${feedback.includes("Correct") ? "bg-green-500/20 border-green-500/30" : "bg-red-500/20 border-red-500/30"}`}
            >
              <p className="text-sm font-semibold mb-2">{feedback}</p>
              <p className="text-lg font-bold">Score: {score}</p>
            </div>

            <Button onClick={nextProblem} className="w-full">
              Next Problem
            </Button>
            <Button onClick={() => setGameState("setup")} variant="outline" className="w-full">
              Change Settings
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
