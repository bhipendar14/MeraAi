"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gamepad2, ExternalLink } from "lucide-react"

const GAMES = [
  {
    id: "chess",
    name: "Chess",
    description: "Strategic board game of kings and queens",
    icon: "♟️",
    color: "from-slate-600 to-slate-800",
    link: "https://bhipendar14.github.io/meraAi-chess/",
  },
  {
    id: "ludo",
    name: "Ludo",
    description: "Classic race to the finish with dice rolls",
    icon: "🎲",
    color: "from-amber-500 to-orange-600",
    link: "https://bhipendar14.github.io/MeraAi-Ludo/",
  },
  {
    id: "tictactoe",
    name: "Tic-Tac-Toe",
    description: "Quick 3x3 grid strategy game",
    icon: "⭕",
    color: "from-blue-500 to-cyan-600",
    link: "https://bhipendar14.github.io/meraAi-tic-tak/",
  },
  {
    id: "checkers",
    name: "Checkers",
    description: "Jump and capture opponent pieces",
    icon: "🔴",
    color: "from-red-500 to-pink-600",
    link: "https://bhipendar14.github.io/meraai-creacker/",
  },
  {
    id: "snake",
    name: "Snake",
    description: "Classic arcade snake game",
    icon: "🐍",
    color: "from-green-500 to-emerald-600",
    link: "https://bhipendar14.github.io/MeraAi-snakeGame/",
  },
]

export function GamesModule() {
  const handlePlay = (link: string) => {
    window.open(link, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="space-y-8">
      {/* Games Grid */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Gamepad2 className="w-6 h-6" />
          <h3 className="text-2xl font-bold">Popular Games</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {GAMES.map((game) => (
            <Card
              key={game.id}
              className="border-border/40 bg-card/40 backdrop-blur hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col"
            >
              {/* Game Icon Background */}
              <div
                className={`h-32 bg-gradient-to-br ${game.color} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}
              >
                <span className="text-6xl">{game.icon}</span>
              </div>

              {/* Game Info */}
              <CardContent className="p-4 space-y-3 flex flex-col flex-grow">
                <div className="flex-grow">
                  <h4 className="font-bold text-lg">{game.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{game.description}</p>
                </div>

                <Button
                  onClick={() => handlePlay(game.link)}
                  className="w-full mt-auto dark:bg-white dark:text-black dark:hover:bg-gray-200 bg-black text-white hover:bg-gray-800 font-semibold flex items-center justify-center gap-2 transition-colors duration-200"
                >
                  Play Now
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
