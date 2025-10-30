"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface TicTacToeGameProps {
  mode?: "solo" | "duo" | "4player" | null
  players?: Array<{ name: string; team: string }>
  onClose: () => void
}

export function TicTacToeGame({ mode = "duo", players = [], onClose }: TicTacToeGameProps) {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)

  const handleClick = (index: number) => {
    if (board[index]) return
    const newBoard = [...board]
    newBoard[index] = isXNext ? "X" : "O"
    setBoard(newBoard)
    setIsXNext(!isXNext)
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setIsXNext(true)
  }

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Tic-Tac-Toe</CardTitle>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2 w-fit mx-auto">
          {board.map((cell, i) => (
            <button
              key={i}
              onClick={() => handleClick(i)}
              className="w-16 h-16 bg-muted/30 border-2 border-border/60 rounded text-2xl font-bold hover:bg-muted/50 transition"
            >
              {cell}
            </button>
          ))}
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Current: {isXNext ? "X" : "O"}</p>
        </div>
        <Button onClick={resetGame} className="w-full">
          New Game
        </Button>
        <Button onClick={onClose} variant="outline" className="w-full bg-transparent">
          Close Game
        </Button>
      </CardContent>
    </Card>
  )
}
