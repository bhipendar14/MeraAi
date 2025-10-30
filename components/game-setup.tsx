"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface GameSetupProps {
  game: { id: string; name: string }
  onStart: (mode: "solo" | "duo" | "4player", players: Array<{ name: string; team: string }>) => void
  onClose: () => void
}

export function GameSetup({ game, onStart, onClose }: GameSetupProps) {
  const [mode, setMode] = useState<"solo" | "duo" | "4player" | null>(null)
  const [players, setPlayers] = useState<Array<{ name: string; team: string }>>([])

  const handleModeSelect = (selectedMode: "solo" | "duo" | "4player") => {
    setMode(selectedMode)
    const playerCount = selectedMode === "solo" ? 1 : selectedMode === "duo" ? 2 : 4
    const newPlayers = Array.from({ length: playerCount }, (_, i) => ({
      name: selectedMode === "solo" ? "You" : `Player ${i + 1}`,
      team: selectedMode === "4player" ? (i < 2 ? "Team A" : "Team B") : "",
    }))
    setPlayers(newPlayers)
  }

  const updatePlayer = (index: number, field: "name" | "team", value: string) => {
    const updated = [...players]
    updated[index] = { ...updated[index], [field]: value }
    setPlayers(updated)
  }

  const handleStart = () => {
    if (mode) {
      onStart(mode, players)
    }
  }

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur fixed inset-0 m-auto w-full max-w-md h-fit max-h-[90vh] overflow-y-auto z-50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">{game.name} - Game Setup</CardTitle>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </CardHeader>
      <CardContent className="space-y-4">
        {!mode ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Select game mode:</p>
            <Button onClick={() => handleModeSelect("solo")} variant="outline" className="w-full">
              Solo (vs AI)
            </Button>
            <Button onClick={() => handleModeSelect("duo")} variant="outline" className="w-full">
              Duo (2 Players)
            </Button>
            {game.id !== "snake" && (
              <Button onClick={() => handleModeSelect("4player")} variant="outline" className="w-full">
                4 Players (Teams)
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-semibold">Configure Players:</p>
            {players.map((player, index) => (
              <div key={index} className="space-y-2 p-3 bg-muted/30 rounded-md border border-border/60">
                <input
                  type="text"
                  value={player.name}
                  onChange={(e) => updatePlayer(index, "name", e.target.value)}
                  placeholder={`Player ${index + 1} name`}
                  className="w-full rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm outline-none"
                />
                {mode === "4player" && (
                  <select
                    value={player.team}
                    onChange={(e) => updatePlayer(index, "team", e.target.value)}
                    className="w-full rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm outline-none"
                  >
                    <option value="Team A">Team A</option>
                    <option value="Team B">Team B</option>
                  </select>
                )}
              </div>
            ))}
            <Button onClick={handleStart} className="w-full">
              Start Game
            </Button>
            <Button onClick={() => setMode(null)} variant="outline" className="w-full">
              Back
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
