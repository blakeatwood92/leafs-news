import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Clock } from "lucide-react"
import type { Game } from "@/types/game"

export default function ScoresPage() {
  // Dummy data for demonstration purposes
  const games: Game[] = [
    {
      id: 1,
      homeTeam: { id: 10, abbrev: "TOR", score: 3 },
      awayTeam: { id: 20, abbrev: "NYR", score: 2 },
      gameDate: new Date().toISOString(),
      gameState: "LIVE",
      clock: { period: 2, timeRemaining: "10:00" },
      venue: { default: "Rogers Centre" },
    },
    {
      id: 2,
      homeTeam: { id: 10, abbrev: "TOR", score: 4 },
      awayTeam: { id: 30, abbrev: "FLA", score: 1 },
      gameDate: new Date().toISOString(),
      gameState: "FINAL",
      clock: null,
      venue: { default: "Rogers Centre" },
    },
    {
      id: 3,
      homeTeam: { id: 40, abbrev: "ANA", score: 0 },
      awayTeam: { id: 10, abbrev: "TOR", score: 0 },
      gameDate: new Date().toISOString(),
      gameState: "UPCOMING",
      clock: null,
      venue: { default: "Honda Center" },
    },
  ]

  return (
    <div className="p-4">
      {games.map((game) => (
        <GameCard key={game.id} game={game} type="current" />
      ))}
    </div>
  )
}

function GameCard({ game, type }: { game: Game; type: "current" | "recent" | "upcoming" }) {
  const isLeafsHome = game.homeTeam.id === 10
  const isLeafsAway = game.awayTeam.id === 10
  const leafsTeam = isLeafsHome ? game.homeTeam : game.awayTeam
  const opponentTeam = isLeafsHome ? game.awayTeam : game.homeTeam

  const gameDate = new Date(game.gameDate)
  const isLive = game.gameState === "LIVE" || game.gameState === "CRIT"

  return (
    <Card className={`${isLive ? "border-red-500 bg-red-50 dark:bg-red-950/20" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isLive && (
              <Badge variant="destructive" className="animate-pulse">
                LIVE
              </Badge>
            )}
            {type === "recent" && <Badge variant="secondary">FINAL</Badge>}
            {type === "upcoming" && (
              <Badge variant="outline">
                {gameDate.toLocaleDateString()} at{" "}
                {gameDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">{game.venue.default}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {/* Away Team */}
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-sm font-medium">{game.awayTeam.abbrev}</div>
              <div className="text-xs text-muted-foreground">{isLeafsAway ? "TOR" : "VS"}</div>
            </div>
            {(type === "current" || type === "recent") && (
              <div className="text-2xl font-bold">{game.awayTeam.score ?? 0}</div>
            )}
          </div>

          {/* Game Status */}
          <div className="text-center">
            {isLive && game.clock && (
              <div className="text-sm font-medium">
                P{game.clock.period} - {game.clock.timeRemaining}
              </div>
            )}
            {type === "upcoming" && (
              <div className="text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mx-auto mb-1" />
                {gameDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            )}
            {type === "recent" && <div className="text-sm text-muted-foreground">Final</div>}
          </div>

          {/* Home Team */}
          <div className="flex items-center gap-3">
            {(type === "current" || type === "recent") && (
              <div className="text-2xl font-bold">{game.homeTeam.score ?? 0}</div>
            )}
            <div className="text-center">
              <div className="text-sm font-medium">{game.homeTeam.abbrev}</div>
              <div className="text-xs text-muted-foreground">{isLeafsHome ? "TOR" : "VS"}</div>
            </div>
          </div>
        </div>

        {/* Added action buttons for different game states */}
        <div className="mt-4 pt-3 border-t">
          {type === "upcoming" && (
            <Button variant="outline" size="sm" asChild className="w-full bg-transparent">
              <Link href={`/preview/${game.id}`}>View Game Preview</Link>
            </Button>
          )}
          {type === "recent" && (
            <Button variant="outline" size="sm" asChild className="w-full bg-transparent">
              <Link href={`/recaps/${game.id}`}>Read Game Recap</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
