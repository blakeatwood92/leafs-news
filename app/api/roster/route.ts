import { NextResponse } from "next/server"

const LEAFS_TEAM_ID = 10 // Toronto Maple Leafs team ID
const NHL_API_BASE = "https://api-web.nhle.com/v1"

interface Player {
  id: number
  headshot: string
  firstName: {
    default: string
  }
  lastName: {
    default: string
  }
  sweaterNumber: number
  positionCode: string
  shootsCatches: string
  heightInInches: number
  weightInPounds: number
  birthDate: string
  birthCity: {
    default: string
  }
  birthCountry: string
  birthStateProvince?: {
    default: string
  }
}

interface RosterData {
  forwards: Player[]
  defensemen: Player[]
  goalies: Player[]
}

async function fetchRoster(): Promise<RosterData> {
  try {
    const response = await fetch(`${NHL_API_BASE}/roster/${LEAFS_TEAM_ID}/current`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error("Failed to fetch roster")
    }

    const data = await response.json()
    const players = data.forwards.concat(data.defensemen).concat(data.goalies)

    // Organize players by position
    const forwards = players.filter((p: Player) => ["C", "L", "R", "LW", "RW"].includes(p.positionCode))
    const defensemen = players.filter((p: Player) => p.positionCode === "D")
    const goalies = players.filter((p: Player) => p.positionCode === "G")

    return {
      forwards: forwards.sort((a: Player, b: Player) => a.sweaterNumber - b.sweaterNumber),
      defensemen: defensemen.sort((a: Player, b: Player) => a.sweaterNumber - b.sweaterNumber),
      goalies: goalies.sort((a: Player, b: Player) => a.sweaterNumber - b.sweaterNumber),
    }
  } catch (error) {
    console.error("Error fetching roster:", error)
    // Return mock data if API fails
    return {
      forwards: [
        {
          id: 8477934,
          headshot: "https://assets.nhle.com/mugs/nhl/20232024/TOR/8477934.png",
          firstName: { default: "Auston" },
          lastName: { default: "Matthews" },
          sweaterNumber: 34,
          positionCode: "C",
          shootsCatches: "L",
          heightInInches: 75,
          weightInPounds: 220,
          birthDate: "1997-09-17",
          birthCity: { default: "San Ramon" },
          birthCountry: "USA",
          birthStateProvince: { default: "California" },
        },
        {
          id: 8478483,
          headshot: "https://assets.nhle.com/mugs/nhl/20232024/TOR/8478483.png",
          firstName: { default: "Mitch" },
          lastName: { default: "Marner" },
          sweaterNumber: 16,
          positionCode: "RW",
          shootsCatches: "R",
          heightInInches: 72,
          weightInPounds: 175,
          birthDate: "1997-05-05",
          birthCity: { default: "Markham" },
          birthCountry: "CAN",
          birthStateProvince: { default: "Ontario" },
        },
        {
          id: 8476454,
          headshot: "https://assets.nhle.com/mugs/nhl/20232024/TOR/8476454.png",
          firstName: { default: "William" },
          lastName: { default: "Nylander" },
          sweaterNumber: 88,
          positionCode: "RW",
          shootsCatches: "R",
          heightInInches: 72,
          weightInPounds: 196,
          birthDate: "1996-05-01",
          birthCity: { default: "Calgary" },
          birthCountry: "CAN",
          birthStateProvince: { default: "Alberta" },
        },
      ],
      defensemen: [
        {
          id: 8471887,
          headshot: "https://assets.nhle.com/mugs/nhl/20232024/TOR/8471887.png",
          firstName: { default: "Morgan" },
          lastName: { default: "Rielly" },
          sweaterNumber: 44,
          positionCode: "D",
          shootsCatches: "L",
          heightInInches: 73,
          weightInPounds: 220,
          birthDate: "1994-03-09",
          birthCity: { default: "North Vancouver" },
          birthCountry: "CAN",
          birthStateProvince: { default: "British Columbia" },
        },
        {
          id: 8480800,
          headshot: "https://assets.nhle.com/mugs/nhl/20232024/TOR/8480800.png",
          firstName: { default: "Jake" },
          lastName: { default: "McCabe" },
          sweaterNumber: 22,
          positionCode: "D",
          shootsCatches: "L",
          heightInInches: 73,
          weightInPounds: 208,
          birthDate: "1993-10-12",
          birthCity: { default: "Eau Claire" },
          birthCountry: "USA",
          birthStateProvince: { default: "Wisconsin" },
        },
      ],
      goalies: [
        {
          id: 8480313,
          headshot: "https://assets.nhle.com/mugs/nhl/20232024/TOR/8480313.png",
          firstName: { default: "Joseph" },
          lastName: { default: "Woll" },
          sweaterNumber: 60,
          positionCode: "G",
          shootsCatches: "L",
          heightInInches: 75,
          weightInPounds: 203,
          birthDate: "1998-07-12",
          birthCity: { default: "Dardenne Prairie" },
          birthCountry: "USA",
          birthStateProvince: { default: "Missouri" },
        },
        {
          id: 8476899,
          headshot: "https://assets.nhle.com/mugs/nhl/20232024/TOR/8476899.png",
          firstName: { default: "Anthony" },
          lastName: { default: "Stolarz" },
          sweaterNumber: 41,
          positionCode: "G",
          shootsCatches: "L",
          heightInInches: 78,
          weightInPounds: 243,
          birthDate: "1994-01-20",
          birthCity: { default: "Edison" },
          birthCountry: "USA",
          birthStateProvince: { default: "New Jersey" },
        },
      ],
    }
  }
}

export async function GET() {
  try {
    const roster = await fetchRoster()

    return NextResponse.json({
      ...roster,
      totalPlayers: roster.forwards.length + roster.defensemen.length + roster.goalies.length,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in roster API:", error)
    return NextResponse.json({ error: "Failed to fetch roster" }, { status: 500 })
  }
}
