"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface SnakeGameProps {
  mode?: "solo" | "duo" | "4player" | null
  players?: Array<{ name: string; team: string }>
  onClose: () => void
}

export function SnakeGame({ mode = "solo", players = [], onClose }: SnakeGameProps) {
  const [score, setScore] = useState(0)
  const [gameActive, setGameActive] = useState(true)

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Snake Game - Score: {score}</CardTitle>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/30 p-4 rounded-md border border-border/60">
          <p className="text-sm text-muted-foreground mb-3">Game Area</p>
          <div className="w-full h-64 bg-black rounded border-2 border-border/60 flex items-center justify-center">
            <p className="text-muted-foreground">Snake Game Canvas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setGameActive(!gameActive)} className="flex-1">
            {gameActive ? "Pause" : "Resume"}
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
            Close Game
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
