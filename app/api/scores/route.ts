import { NextResponse } from "next/server"

// NHL API endpoints
const NHL_API_BASE = "https://api-web.nhle.com/v1"
const LEAFS_TEAM_ID = 10 // Toronto Maple Leafs team ID

interface Game {
  id: number
  gameDate: string
  gameState: string
  gameType: number
  awayTeam: {
    id: number
    name: {
      default: string
    }
    abbrev: string
    score?: number
    logo: string
  }
  homeTeam: {
    id: number
    name: {
      default: string
    }
    abbrev: string
    score?: number
    logo: string
  }
  period: number
  periodDescriptor: {
    number: number
    periodType: string
  }
  clock: {
    timeRemaining: string
    running: boolean
  }
  venue: {
    default: string
  }
}

async function fetchLeafsSchedule() {
  try {
    const now = new Date()
    const currentSeason = now.getMonth() >= 9 ? now.getFullYear() : now.getFullYear() - 1
    const seasonId = `${currentSeason}${currentSeason + 1}`

    const response = await fetch(`${NHL_API_BASE}/club-schedule-season/${LEAFS_TEAM_ID}/${seasonId}`, {
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch schedule")
    }

    const data = await response.json()
    return data.games || []
  } catch (error) {
    console.error("Error fetching Leafs schedule:", error)
    return []
  }
}

async function fetchCurrentGame() {
  try {
    const response = await fetch(`${NHL_API_BASE}/score/now`, { next: { revalidate: 60 } })

    if (!response.ok) {
      throw new Error("Failed to fetch current scores")
    }

    const data = await response.json()
    const games = data.games || []

    // Find current Leafs game
    const leafsGame = games.find(
      (game: Game) => game.awayTeam.id === LEAFS_TEAM_ID || game.homeTeam.id === LEAFS_TEAM_ID,
    )

    return leafsGame || null
  } catch (error) {
    console.error("Error fetching current game:", error)
    return null
  }
}

export async function GET() {
  try {
    const [schedule, currentGame] = await Promise.all([fetchLeafsSchedule(), fetchCurrentGame()])

    const now = new Date()
    const today = now.toISOString().split("T")[0]

    // Separate games into recent, current, and upcoming
    const recentGames = schedule
      .filter((game: Game) => {
        const gameDate = new Date(game.gameDate).toISOString().split("T")[0]
        return gameDate < today && game.gameState === "OFF"
      })
      .slice(-5) // Last 5 games

    const upcomingGames = schedule
      .filter((game: Game) => {
        const gameDate = new Date(game.gameDate).toISOString().split("T")[0]
        return gameDate >= today && game.gameState !== "OFF"
      })
      .slice(0, 5) // Next 5 games

    return NextResponse.json({
      currentGame,
      recentGames,
      upcomingGames,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in scores API:", error)
    return NextResponse.json({ error: "Failed to fetch scores" }, { status: 500 })
  }
}
