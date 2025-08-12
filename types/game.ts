export interface Team {
  id: number
  name: {
    default: string
  }
  abbrev: string
  score?: number
  logo: string
}

export interface Game {
  id: number
  gameDate: string
  gameState: string
  gameType: number
  awayTeam: Team
  homeTeam: Team
  period?: number
  periodDescriptor?: {
    number: number
    periodType: string
  }
  clock?: {
    timeRemaining: string
    running: boolean
  }
  venue: {
    default: string
  }
}
