"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface ChessGameProps {
  mode?: "solo" | "duo" | "4player" | null
  players?: Array<{ name: string; team: string }>
  onClose: () => void
}

export function ChessGame({ mode = "duo", players = [], onClose }: ChessGameProps) {
  const [gameState, setGameState] = useState("playing")

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Chess - {mode === "solo" ? "vs AI" : "Multiplayer"}</CardTitle>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/30 p-4 rounded-md border border-border/60">
          <p className="text-sm text-muted-foreground mb-3">Chess Board</p>
          <div className="grid grid-cols-8 gap-0 border-2 border-border/60">
            {Array.from({ length: 64 }).map((_, i) => (
              <div
                key={i}
                className={`w-12 h-12 flex items-center justify-center text-xs font-semibold ${
                  (Math.floor(i / 8) + (i % 8)) % 2 === 0 ? "bg-muted/50" : "bg-muted/20"
                }`}
              >
                {i === 0 ? "♜" : i === 7 ? "♜" : ""}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold">Players:</p>
          {players.map((p, i) => (
            <p key={i} className="text-xs text-muted-foreground">
              {p.name} {p.team ? `(${p.team})` : ""}
            </p>
          ))}
        </div>
        <Button onClick={onClose} variant="outline" className="w-full bg-transparent">
          Close Game
        </Button>
      </CardContent>
    </Card>
  )
}
