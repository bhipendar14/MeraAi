"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Type } from "lucide-react"
import { generateText } from "ai"

interface WordGameProps {
  onClose?: () => void
}

export function AIWordGame({ onClose }: WordGameProps) {
  const [gameState, setGameState] = useState<"setup" | "playing" | "result">("setup")
  const [word, setWord] = useState("")
  const [definition, setDefinition] = useState("")
  const [options, setOptions] = useState<string[]>([])
  const [userChoice, setUserChoice] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [gameMode, setGameMode] = useState<"definition" | "synonym">("definition")

  const generateQuestion = async () => {
    setIsLoading(true)
    try {
      const prompt =
        gameMode === "definition"
          ? `Generate a ${difficulty} vocabulary word with its definition and 3 wrong definitions. Format: WORD: [word] DEFINITION: [correct def] WRONG1: [wrong] WRONG2: [wrong] WRONG3: [wrong]`
          : `Generate a ${difficulty} word with 3 synonyms and 1 wrong word. Format: WORD: [word] SYNONYM1: [syn] SYNONYM2: [syn] SYNONYM3: [syn] WRONG: [wrong]`

      const { text } = await generateText({
        model: "openai/gpt-5-mini",
        prompt,
        maxOutputTokens: 200,
      })

      if (gameMode === "definition") {
        const match = text.match(
          /WORD:\s*(.+?)\s*DEFINITION:\s*(.+?)\s*WRONG1:\s*(.+?)\s*WRONG2:\s*(.+?)\s*WRONG3:\s*(.+?)(?:\n|$)/s,
        )
        if (match) {
          const correctDef = match[2].trim()
          const wrongDefs = [match[3].trim(), match[4].trim(), match[5].trim()]
          const shuffled = [correctDef, ...wrongDefs].sort(() => Math.random() - 0.5)

          setWord(match[1].trim())
          setDefinition(correctDef)
          setOptions(shuffled)
          setGameState("playing")
          setUserChoice("")
          setFeedback("")
        }
      } else {
        const match = text.match(
          /WORD:\s*(.+?)\s*SYNONYM1:\s*(.+?)\s*SYNONYM2:\s*(.+?)\s*SYNONYM3:\s*(.+?)\s*WRONG:\s*(.+?)(?:\n|$)/s,
        )
        if (match) {
          const synonyms = [match[2].trim(), match[3].trim(), match[4].trim()]
          const shuffled = [...synonyms, match[5].trim()].sort(() => Math.random() - 0.5)

          setWord(match[1].trim())
          setDefinition("Find a synonym for this word")
          setOptions(shuffled)
          setGameState("playing")
          setUserChoice("")
          setFeedback("")
        }
      }
    } catch (error) {
      setFeedback("Failed to generate question. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const checkAnswer = () => {
    if (!userChoice) {
      setFeedback("Please select an answer!")
      return
    }

    if (userChoice === definition) {
      setScore(score + 10)
      setFeedback("Correct!")
      setGameState("result")
    } else {
      setFeedback(`Incorrect. The correct answer was: ${definition}`)
      setGameState("result")
    }
  }

  const nextQuestion = () => {
    setUserChoice("")
    generateQuestion()
  }

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Type className="w-5 h-5" />
          AI Word Game
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {gameState === "setup" ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Test your vocabulary with AI-generated questions!</p>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Game Mode:</label>
              <div className="grid grid-cols-2 gap-2">
                {(["definition", "synonym"] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={gameMode === mode ? "default" : "outline"}
                    onClick={() => setGameMode(mode)}
                    className="capitalize text-xs"
                  >
                    {mode}
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

            <Button onClick={generateQuestion} disabled={isLoading} className="w-full">
              {isLoading ? "Generating..." : "Start Game"}
            </Button>
            {score > 0 && <p className="text-sm font-semibold text-center">Score: {score}</p>}
          </div>
        ) : gameState === "playing" ? (
          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-md border border-border/60 text-center">
              <p className="text-sm font-semibold mb-2">Word:</p>
              <p className="text-2xl font-bold">{word}</p>
            </div>

            <p className="text-sm text-muted-foreground text-center">{definition}</p>

            <div className="space-y-2">
              {options.map((option, idx) => (
                <Button
                  key={idx}
                  variant={userChoice === option ? "default" : "outline"}
                  onClick={() => setUserChoice(option)}
                  className="w-full justify-start text-left"
                >
                  {option}
                </Button>
              ))}
            </div>

            <Button onClick={checkAnswer} disabled={!userChoice} className="w-full">
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

            <Button onClick={nextQuestion} className="w-full">
              Next Question
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
