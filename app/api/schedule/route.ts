import { NextResponse } from "next/server"

const NHL_API_BASE = "https://api-web.nhle.com/v1"
const LEAFS_TEAM_ID = 10

interface ScheduleGame {
  id: number
  gameDate: string
  gameState: string
  gameType: number
  awayTeam: {
    id: number
    name: { default: string }
    abbrev: string
    logo: string
  }
  homeTeam: {
    id: number
    name: { default: string }
    abbrev: string
    logo: string
  }
  venue: {
    default: string
  }
  tvBroadcasts: {
    canada: string[]
    usa: string[]
    streaming: string[]
  }
  ticketLink?: string
}

interface ScheduleData {
  games: ScheduleGame[]
  totalGames: number
  homeGames: number
  awayGames: number
  lastUpdated: string
}

async function fetchLeafsSchedule(): Promise<ScheduleGame[]> {
  try {
    const now = new Date()
    const currentSeason = now.getMonth() >= 9 ? now.getFullYear() : now.getFullYear() - 1
    const seasonId = `${currentSeason}${currentSeason + 1}`

    const response = await fetch(`${NHL_API_BASE}/club-schedule-season/${LEAFS_TEAM_ID}/${seasonId}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error("Failed to fetch schedule")
    }

    const data = await response.json()
    const games = data.games || []

    // Enhance games with TV/streaming data (mock data for demonstration)
    return games.map((game: any) => ({
      ...game,
      tvBroadcasts: generateTVBroadcasts(game),
      ticketLink: generateTicketLink(game),
    }))
  } catch (error) {
    console.error("Error fetching schedule:", error)
    return []
  }
}

function generateTVBroadcasts(game: any) {
  const isLeafsHome = game.homeTeam.id === LEAFS_TEAM_ID
  const gameDate = new Date(game.gameDate)
  const isWeekend = gameDate.getDay() === 0 || gameDate.getDay() === 6
  const isPrimeTime = gameDate.getHours() >= 19

  // Mock TV broadcast data based on game characteristics
  const broadcasts = {
    canada: [] as string[],
    usa: [] as string[],
    streaming: [] as string[],
  }

  // Canadian broadcasts
  if (isLeafsHome || isPrimeTime) {
    broadcasts.canada.push("Sportsnet Ontario")
  }
  if (isWeekend) {
    broadcasts.canada.push("Hockey Night in Canada")
  }
  if (game.gameType === 3) {
    // Playoffs
    broadcasts.canada.push("CBC", "Sportsnet")
  }

  // US broadcasts
  if (isPrimeTime) {
    broadcasts.usa.push("ESPN+")
  }
  if (isWeekend && isPrimeTime) {
    broadcasts.usa.push("TNT")
  }
  if (game.gameType === 3) {
    broadcasts.usa.push("ESPN", "TNT")
  }

  // Streaming options
  broadcasts.streaming.push("NHL.TV", "ESPN+")
  if (broadcasts.canada.length > 0) {
    broadcasts.streaming.push("Sportsnet NOW")
  }

  return broadcasts
}

function generateTicketLink(game: any) {
  const isLeafsHome = game.homeTeam.id === LEAFS_TEAM_ID
  if (isLeafsHome) {
    return `https://www.ticketmaster.ca/toronto-maple-leafs-tickets/artist/806034?game=${game.id}`
  }
  return undefined
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter") // 'home', 'away', or null for all
    const month = searchParams.get("month") // '2024-01' format or null for all

    const allGames = await fetchLeafsSchedule()

    let filteredGames = allGames

    // Apply home/away filter
    if (filter === "home") {
      filteredGames = filteredGames.filter((game) => game.homeTeam.id === LEAFS_TEAM_ID)
    } else if (filter === "away") {
      filteredGames = filteredGames.filter((game) => game.awayTeam.id === LEAFS_TEAM_ID)
    }

    // Apply month filter
    if (month) {
      filteredGames = filteredGames.filter((game) => {
        const gameMonth = new Date(game.gameDate).toISOString().slice(0, 7)
        return gameMonth === month
      })
    }

    // Sort by date
    filteredGames.sort((a, b) => new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime())

    const scheduleData: ScheduleData = {
      games: filteredGames,
      totalGames: allGames.length,
      homeGames: allGames.filter((game) => game.homeTeam.id === LEAFS_TEAM_ID).length,
      awayGames: allGames.filter((game) => game.awayTeam.id === LEAFS_TEAM_ID).length,
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json(scheduleData)
  } catch (error) {
    console.error("Error in schedule API:", error)
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 })
  }
}
