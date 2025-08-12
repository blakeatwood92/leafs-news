import { NextResponse } from "next/server"

const NHL_API_BASE = "https://api-web.nhle.com/v1"
const LEAFS_TEAM_ID = 10

interface GamePreviewData {
  game: {
    id: number
    date: string
    venue: string
    gameType: string
    opponent: {
      id: number
      name: string
      abbrev: string
      logo: string
      record: string
    }
    weather?: {
      temperature: string
      conditions: string
      wind: string
    }
  }
  probableLineups: {
    leafs: {
      forwards: Array<{
        line: number
        left: string
        center: string
        right: string
      }>
      defense: Array<{
        pair: number
        left: string
        right: string
      }>
      goalies: {
        starter: string
        backup: string
      }
    }
    opponent: {
      forwards: Array<{
        line: number
        left: string
        center: string
        right: string
      }>
      defense: Array<{
        pair: number
        left: string
        right: string
      }>
      goalies: {
        starter: string
        backup: string
      }
    }
  }
  injuries: {
    leafs: Array<{
      player: string
      injury: string
      status: string
      expectedReturn?: string
    }>
    opponent: Array<{
      player: string
      injury: string
      status: string
      expectedReturn?: string
    }>
  }
  officials: {
    referees: string[]
    linesmen: string[]
  }
  odds: {
    moneyline: {
      leafs: string
      opponent: string
    }
    total: {
      over: string
      under: string
      line: string
    }
    spread: {
      leafs: string
      opponent: string
      line: string
    }
  }
}

async function fetchGamePreview(gameId: string): Promise<GamePreviewData | null> {
  try {
    // Fetch basic game info
    const gameResponse = await fetch(`${NHL_API_BASE}/gamecenter/${gameId}/landing`, {
      next: { revalidate: 300 },
    })

    if (!gameResponse.ok) {
      throw new Error("Failed to fetch game data")
    }

    const gameData = await gameResponse.json()
    const game = gameData.game

    // Determine opponent
    const isLeafsHome = game.homeTeam.id === LEAFS_TEAM_ID
    const opponent = isLeafsHome ? game.awayTeam : game.homeTeam

    // Mock data for demonstration - in production, you'd fetch from multiple APIs
    const mockPreviewData: GamePreviewData = {
      game: {
        id: Number.parseInt(gameId),
        date: game.gameDate,
        venue: game.venue.default,
        gameType: game.gameType === 2 ? "Regular Season" : "Playoff",
        opponent: {
          id: opponent.id,
          name: opponent.name.default,
          abbrev: opponent.abbrev,
          logo: opponent.logo || `https://assets.nhle.com/logos/nhl/svg/${opponent.abbrev}_light.svg`,
          record: "25-15-3", // Would fetch actual record
        },
        // Weather only for outdoor games
        weather: game.venue.default.includes("Stadium")
          ? {
              temperature: "-2°C",
              conditions: "Clear",
              wind: "5 km/h NW",
            }
          : undefined,
      },
      probableLineups: {
        leafs: {
          forwards: [
            { line: 1, left: "Matthew Knies", center: "Auston Matthews", right: "Mitch Marner" },
            { line: 2, left: "Max Domi", center: "John Tavares", right: "William Nylander" },
            { line: 3, left: "Bobby McMann", center: "Max Pacioretty", right: "Nicholas Robertson" },
            { line: 4, left: "Steven Lorentz", center: "David Kampf", right: "Connor Dewar" },
          ],
          defense: [
            { pair: 1, left: "Morgan Rielly", right: "Chris Tanev" },
            { pair: 2, left: "Jake McCabe", right: "Oliver Ekman-Larsson" },
            { pair: 3, left: "Simon Benoit", right: "Conor Timmins" },
          ],
          goalies: {
            starter: "Joseph Woll",
            backup: "Anthony Stolarz",
          },
        },
        opponent: {
          forwards: [
            { line: 1, left: "Player A", center: "Player B", right: "Player C" },
            { line: 2, left: "Player D", center: "Player E", right: "Player F" },
            { line: 3, left: "Player G", center: "Player H", right: "Player I" },
            { line: 4, left: "Player J", center: "Player K", right: "Player L" },
          ],
          defense: [
            { pair: 1, left: "Player M", right: "Player N" },
            { pair: 2, left: "Player O", right: "Player P" },
            { pair: 3, left: "Player Q", right: "Player R" },
          ],
          goalies: {
            starter: "Opponent Goalie 1",
            backup: "Opponent Goalie 2",
          },
        },
      },
      injuries: {
        leafs: [
          { player: "Calle Jarnkrok", injury: "Lower Body", status: "Day-to-Day", expectedReturn: "Next Week" },
          { player: "Jani Hakanpaa", injury: "Knee", status: "Week-to-Week" },
        ],
        opponent: [{ player: "Opponent Player", injury: "Upper Body", status: "Day-to-Day" }],
      },
      officials: {
        referees: ["Referee 1", "Referee 2"],
        linesmen: ["Linesman 1", "Linesman 2"],
      },
      odds: {
        moneyline: {
          leafs: "-150",
          opponent: "+130",
        },
        total: {
          over: "-110",
          under: "-110",
          line: "6.5",
        },
        spread: {
          leafs: "-110",
          opponent: "-110",
          line: "-1.5",
        },
      },
    }

    return mockPreviewData
  } catch (error) {
    console.error("Error fetching game preview:", error)
    return null
  }
}

export async function GET(request: Request, { params }: { params: { gameId: string } }) {
  try {
    const gameId = params.gameId
    const previewData = await fetchGamePreview(gameId)

    if (!previewData) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    return NextResponse.json(previewData)
  } catch (error) {
    console.error("Error in game preview API:", error)
    return NextResponse.json({ error: "Failed to fetch game preview" }, { status: 500 })
  }
}
