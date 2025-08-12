import { NextResponse } from "next/server"

interface Player {
  id: number
  name: string
  position: string
  number: number
  confirmed: boolean
}

interface LineupChange {
  id: string
  timestamp: string
  type: "swap" | "confirm" | "update"
  description: string
  situation: "even-strength" | "power-play" | "penalty-kill"
  details: {
    playersInvolved?: string[]
    previousPosition?: string
    newPosition?: string
  }
}

interface DepthChart {
  evenStrength: {
    forwards: {
      line1: { left: Player; center: Player; right: Player }
      line2: { left: Player; center: Player; right: Player }
      line3: { left: Player; center: Player; right: Player }
      line4: { left: Player; center: Player; right: Player }
    }
    defense: {
      pair1: { left: Player; right: Player }
      pair2: { left: Player; right: Player }
      pair3: { left: Player; right: Player }
    }
    goalies: {
      starter: Player
      backup: Player
    }
  }
  powerPlay: {
    unit1: {
      forwards: Player[]
      defense: Player[]
    }
    unit2: {
      forwards: Player[]
      defense: Player[]
    }
  }
  penaltyKill: {
    unit1: {
      forwards: Player[]
      defense: Player[]
    }
    unit2: {
      forwards: Player[]
      defense: Player[]
    }
  }
}

interface LineupData {
  depthChart: DepthChart
  changeLog: LineupChange[]
  lastUpdated: string
}

// Mock data for demonstration
const mockLineupData: LineupData = {
  depthChart: {
    evenStrength: {
      forwards: {
        line1: {
          left: { id: 1, name: "Matthew Knies", position: "LW", number: 23, confirmed: true },
          center: { id: 2, name: "Auston Matthews", position: "C", number: 34, confirmed: true },
          right: { id: 3, name: "Mitch Marner", position: "RW", number: 16, confirmed: true },
        },
        line2: {
          left: { id: 4, name: "Max Domi", position: "LW", number: 11, confirmed: true },
          center: { id: 5, name: "John Tavares", position: "C", number: 91, confirmed: true },
          right: { id: 6, name: "William Nylander", position: "RW", number: 88, confirmed: true },
        },
        line3: {
          left: { id: 7, name: "Bobby McMann", position: "LW", number: 74, confirmed: false },
          center: { id: 8, name: "Max Pacioretty", position: "C", number: 67, confirmed: false },
          right: { id: 9, name: "Nicholas Robertson", position: "RW", number: 89, confirmed: false },
        },
        line4: {
          left: { id: 10, name: "Steven Lorentz", position: "LW", number: 18, confirmed: true },
          center: { id: 11, name: "David Kampf", position: "C", number: 64, confirmed: true },
          right: { id: 12, name: "Connor Dewar", position: "RW", number: 21, confirmed: true },
        },
      },
      defense: {
        pair1: {
          left: { id: 13, name: "Morgan Rielly", position: "D", number: 44, confirmed: true },
          right: { id: 14, name: "Chris Tanev", position: "D", number: 8, confirmed: true },
        },
        pair2: {
          left: { id: 15, name: "Jake McCabe", position: "D", number: 22, confirmed: true },
          right: { id: 16, name: "Oliver Ekman-Larsson", position: "D", number: 23, confirmed: true },
        },
        pair3: {
          left: { id: 17, name: "Simon Benoit", position: "D", number: 2, confirmed: false },
          right: { id: 18, name: "Conor Timmins", position: "D", number: 25, confirmed: false },
        },
      },
      goalies: {
        starter: { id: 19, name: "Joseph Woll", position: "G", number: 60, confirmed: true },
        backup: { id: 20, name: "Anthony Stolarz", position: "G", number: 41, confirmed: true },
      },
    },
    powerPlay: {
      unit1: {
        forwards: [
          { id: 2, name: "Auston Matthews", position: "C", number: 34, confirmed: true },
          { id: 3, name: "Mitch Marner", position: "RW", number: 16, confirmed: true },
          { id: 6, name: "William Nylander", position: "RW", number: 88, confirmed: true },
        ],
        defense: [
          { id: 13, name: "Morgan Rielly", position: "D", number: 44, confirmed: true },
          { id: 5, name: "John Tavares", position: "C", number: 91, confirmed: true },
        ],
      },
      unit2: {
        forwards: [
          { id: 4, name: "Max Domi", position: "LW", number: 11, confirmed: true },
          { id: 8, name: "Max Pacioretty", position: "C", number: 67, confirmed: false },
          { id: 1, name: "Matthew Knies", position: "LW", number: 23, confirmed: true },
        ],
        defense: [
          { id: 16, name: "Oliver Ekman-Larsson", position: "D", number: 23, confirmed: true },
          { id: 15, name: "Jake McCabe", position: "D", number: 22, confirmed: true },
        ],
      },
    },
    penaltyKill: {
      unit1: {
        forwards: [
          { id: 11, name: "David Kampf", position: "C", number: 64, confirmed: true },
          { id: 10, name: "Steven Lorentz", position: "LW", number: 18, confirmed: true },
        ],
        defense: [
          { id: 15, name: "Jake McCabe", position: "D", number: 22, confirmed: true },
          { id: 14, name: "Chris Tanev", position: "D", number: 8, confirmed: true },
        ],
      },
      unit2: {
        forwards: [
          { id: 12, name: "Connor Dewar", position: "RW", number: 21, confirmed: true },
          { id: 4, name: "Max Domi", position: "LW", number: 11, confirmed: true },
        ],
        defense: [
          { id: 16, name: "Oliver Ekman-Larsson", position: "D", number: 23, confirmed: true },
          { id: 17, name: "Simon Benoit", position: "D", number: 2, confirmed: false },
        ],
      },
    },
  },
  changeLog: [
    {
      id: "1",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      type: "confirm",
      description: "Confirmed Joseph Woll as starting goalie",
      situation: "even-strength",
      details: {
        playersInvolved: ["Joseph Woll"],
      },
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      type: "swap",
      description: "Swapped Max Pacioretty and Nicholas Robertson on Line 3",
      situation: "even-strength",
      details: {
        playersInvolved: ["Max Pacioretty", "Nicholas Robertson"],
        previousPosition: "Line 3 RW",
        newPosition: "Line 3 C",
      },
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      type: "update",
      description: "Updated Power Play Unit 2 with Max Pacioretty",
      situation: "power-play",
      details: {
        playersInvolved: ["Max Pacioretty"],
      },
    },
  ],
  lastUpdated: new Date().toISOString(),
}

export async function GET() {
  try {
    // In a real implementation, this would fetch from a database
    return NextResponse.json(mockLineupData)
  } catch (error) {
    console.error("Error fetching lineup data:", error)
    return NextResponse.json({ error: "Failed to fetch lineup data" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, situation, details } = body

    // In a real implementation, this would update the database
    const newChange: LineupChange = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: action,
      description: details.description || `${action} action performed`,
      situation,
      details,
    }

    // Add to change log
    mockLineupData.changeLog.unshift(newChange)
    mockLineupData.lastUpdated = new Date().toISOString()

    return NextResponse.json({ success: true, change: newChange })
  } catch (error) {
    console.error("Error updating lineup:", error)
    return NextResponse.json({ error: "Failed to update lineup" }, { status: 500 })
  }
}
