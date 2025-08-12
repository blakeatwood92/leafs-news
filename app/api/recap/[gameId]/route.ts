import { NextResponse } from "next/server"

const NHL_API_BASE = "https://api-web.nhle.com/v1"

interface BoxscoreData {
  game: {
    id: number
    gameDate: string
    venue: string
    gameState: string
    homeTeam: {
      id: number
      name: { default: string }
      abbrev: string
      score: number
    }
    awayTeam: {
      id: number
      name: { default: string }
      abbrev: string
      score: number
    }
    periodDescriptor: {
      number: number
      periodType: string
    }
  }
  playerByGameStats: {
    awayTeam: {
      forwards: Array<{
        playerId: number
        name: { default: string }
        goals: number
        assists: number
        points: number
        plusMinus: number
        shots: number
        hits: number
        timeOnIce: string
      }>
      defense: Array<{
        playerId: number
        name: { default: string }
        goals: number
        assists: number
        points: number
        plusMinus: number
        shots: number
        hits: number
        timeOnIce: string
      }>
      goalies: Array<{
        playerId: number
        name: { default: string }
        saves: number
        shotsAgainst: number
        savePercentage: number
        timeOnIce: string
      }>
    }
    homeTeam: {
      forwards: Array<{
        playerId: number
        name: { default: string }
        goals: number
        assists: number
        points: number
        plusMinus: number
        shots: number
        hits: number
        timeOnIce: string
      }>
      defense: Array<{
        playerId: number
        name: { default: string }
        goals: number
        assists: number
        points: number
        plusMinus: number
        shots: number
        hits: number
        timeOnIce: string
      }>
      goalies: Array<{
        playerId: number
        name: { default: string }
        saves: number
        shotsAgainst: number
        savePercentage: number
        timeOnIce: string
      }>
    }
  }
  summary: {
    teamGameStats: {
      awayTeam: {
        shots: number
        hits: number
        powerPlayGoals: number
        powerPlayOpportunities: number
        faceoffWinningPctg: number
      }
      homeTeam: {
        shots: number
        hits: number
        powerPlayGoals: number
        powerPlayOpportunities: number
        faceoffWinningPctg: number
      }
    }
  }
}

interface RecapData {
  game: {
    id: number
    date: string
    venue: string
    finalScore: string
    winner: string
    loser: string
    isLeafsWin: boolean
  }
  recap: {
    headline: string
    summary: string
    turningPoint: string
    topPerformers: {
      leafs: Array<{
        name: string
        stats: string
        description: string
      }>
      opponent: Array<{
        name: string
        stats: string
        description: string
      }>
    }
    keyStats: {
      shots: string
      powerPlay: string
      faceoffs: string
      hits: string
    }
    content: string
  }
  seo: {
    title: string
    description: string
    keywords: string[]
  }
}

async function fetchBoxscore(gameId: string): Promise<BoxscoreData | null> {
  try {
    const response = await fetch(`${NHL_API_BASE}/gamecenter/${gameId}/boxscore`, {
      next: { revalidate: 3600 }, // Cache completed games for 1 hour
    })

    if (!response.ok) {
      throw new Error("Failed to fetch boxscore")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching boxscore:", error)
    return null
  }
}

function generateRecap(boxscore: BoxscoreData): RecapData {
  const game = boxscore.game
  const isLeafsHome = game.homeTeam.id === 10
  const isLeafsAway = game.awayTeam.id === 10

  const leafsTeam = isLeafsHome ? game.homeTeam : game.awayTeam
  const opponentTeam = isLeafsHome ? game.awayTeam : game.homeTeam
  const leafsStats = isLeafsHome ? boxscore.playerByGameStats.homeTeam : boxscore.playerByGameStats.awayTeam
  const opponentStats = isLeafsHome ? boxscore.playerByGameStats.awayTeam : boxscore.playerByGameStats.homeTeam
  const teamStats = boxscore.summary.teamGameStats
  const leafsTeamStats = isLeafsHome ? teamStats.homeTeam : teamStats.awayTeam
  const opponentTeamStats = isLeafsHome ? teamStats.awayTeam : teamStats.homeTeam

  const isLeafsWin = leafsTeam.score > opponentTeam.score
  const finalScore = `${leafsTeam.score}-${opponentTeam.score}`

  // Find top performers
  const allLeafsPlayers = [...leafsStats.forwards, ...leafsStats.defense]
  const topLeafsScorer = allLeafsPlayers.reduce((prev, current) => (prev.points > current.points ? prev : current))

  const leafsGoalie = leafsStats.goalies[0]

  const allOpponentPlayers = [...opponentStats.forwards, ...opponentStats.defense]
  const topOpponentScorer = allOpponentPlayers.reduce((prev, current) =>
    prev.points > current.points ? prev : current,
  )

  const opponentGoalie = opponentStats.goalies[0]

  // Generate headlines and content
  const headline = isLeafsWin
    ? `Leafs ${leafsTeam.score > opponentTeam.score + 2 ? "Dominate" : "Edge"} ${opponentTeam.name.default} ${finalScore}`
    : `${opponentTeam.name.default} ${opponentTeam.score > leafsTeam.score + 2 ? "Overwhelm" : "Defeat"} Leafs ${opponentTeam.score}-${leafsTeam.score}`

  const turningPoint =
    game.periodDescriptor.number > 2
      ? `The game was decided in ${game.periodDescriptor.periodType.toLowerCase()}, with crucial plays determining the outcome.`
      : `Key momentum shifts in the ${game.periodDescriptor.number === 1 ? "first" : "second"} period proved decisive.`

  const content = `
The Toronto Maple Leafs ${isLeafsWin ? "secured a" : "suffered a"} ${finalScore} ${isLeafsWin ? "victory over" : "loss to"} the ${opponentTeam.name.default} at ${game.venue} on ${new Date(game.gameDate).toLocaleDateString()}.

${isLeafsWin ? "Toronto controlled the pace early" : "The Leafs faced an uphill battle"}, with ${topLeafsScorer.name.default} leading the charge with ${topLeafsScorer.goals} ${topLeafsScorer.goals === 1 ? "goal" : "goals"} and ${topLeafsScorer.assists} ${topLeafsScorer.assists === 1 ? "assist" : "assists"} for ${topLeafsScorer.points} points. ${leafsGoalie ? `Between the pipes, ${leafsGoalie.name.default} made ${leafsGoalie.saves} saves on ${leafsGoalie.shotsAgainst} shots for a ${(leafsGoalie.savePercentage * 100).toFixed(1)}% save percentage.` : ""}

The ${opponentTeam.name.default} were led by ${topOpponentScorer.name.default}, who recorded ${topOpponentScorer.points} ${topOpponentScorer.points === 1 ? "point" : "points"} on the night. ${opponentGoalie ? `Their goaltender ${opponentGoalie.name.default} faced ${opponentGoalie.shotsAgainst} shots, making ${opponentGoalie.saves} saves.` : ""}

Special teams played a ${leafsTeamStats.powerPlayGoals > 0 || opponentTeamStats.powerPlayGoals > 0 ? "crucial" : "minimal"} role, with Toronto going ${leafsTeamStats.powerPlayGoals}/${leafsTeamStats.powerPlayOpportunities} on the power play while ${opponentTeam.abbrev} converted ${opponentTeamStats.powerPlayGoals}/${opponentTeamStats.powerPlayOpportunities} of their opportunities.

${turningPoint} The Leafs ${isLeafsWin ? "showed resilience and determination" : "will look to bounce back"} as they continue their ${new Date(game.gameDate).getMonth() >= 9 || new Date(game.gameDate).getMonth() <= 3 ? "season" : "playoff"} campaign.

This ${isLeafsWin ? "victory" : "setback"} ${isLeafsWin ? "builds momentum" : "provides valuable lessons"} for Toronto as they ${isLeafsWin ? "continue their strong play" : "work to get back on track"} moving forward.
  `.trim()

  return {
    game: {
      id: game.id,
      date: game.gameDate,
      venue: game.venue,
      finalScore,
      winner: isLeafsWin ? "Toronto Maple Leafs" : opponentTeam.name.default,
      loser: isLeafsWin ? opponentTeam.name.default : "Toronto Maple Leafs",
      isLeafsWin,
    },
    recap: {
      headline,
      summary: `${isLeafsWin ? "Victory" : "Loss"} against ${opponentTeam.name.default} with standout performances from key players.`,
      turningPoint,
      topPerformers: {
        leafs: [
          {
            name: topLeafsScorer.name.default,
            stats: `${topLeafsScorer.goals}G, ${topLeafsScorer.assists}A, ${topLeafsScorer.points}P`,
            description: `Led Toronto with ${topLeafsScorer.points} points`,
          },
          ...(leafsGoalie
            ? [
                {
                  name: leafsGoalie.name.default,
                  stats: `${leafsGoalie.saves} saves, ${(leafsGoalie.savePercentage * 100).toFixed(1)}% SV%`,
                  description: `Solid performance in net`,
                },
              ]
            : []),
        ],
        opponent: [
          {
            name: topOpponentScorer.name.default,
            stats: `${topOpponentScorer.goals}G, ${topOpponentScorer.assists}A, ${topOpponentScorer.points}P`,
            description: `Top performer for ${opponentTeam.abbrev}`,
          },
          ...(opponentGoalie
            ? [
                {
                  name: opponentGoalie.name.default,
                  stats: `${opponentGoalie.saves} saves, ${(opponentGoalie.savePercentage * 100).toFixed(1)}% SV%`,
                  description: `Goaltending effort`,
                },
              ]
            : []),
        ],
      },
      keyStats: {
        shots: `TOR ${leafsTeamStats.shots} - ${opponentTeamStats.shots} ${opponentTeam.abbrev}`,
        powerPlay: `TOR ${leafsTeamStats.powerPlayGoals}/${leafsTeamStats.powerPlayOpportunities} - ${opponentTeamStats.powerPlayGoals}/${opponentTeamStats.powerPlayOpportunities} ${opponentTeam.abbrev}`,
        faceoffs: `TOR ${(leafsTeamStats.faceoffWinningPctg * 100).toFixed(1)}% - ${(opponentTeamStats.faceoffWinningPctg * 100).toFixed(1)}% ${opponentTeam.abbrev}`,
        hits: `TOR ${leafsTeamStats.hits} - ${opponentTeamStats.hits} ${opponentTeam.abbrev}`,
      },
      content,
    },
    seo: {
      title: `${headline} - Game Recap | Leafs News`,
      description: `Complete recap of the Toronto Maple Leafs ${isLeafsWin ? "victory over" : "loss to"} ${opponentTeam.name.default} ${finalScore}. Player stats, highlights, and analysis.`,
      keywords: [
        "Toronto Maple Leafs",
        "game recap",
        opponentTeam.name.default,
        "NHL",
        "hockey",
        topLeafsScorer.name.default,
      ],
    },
  }
}

export async function GET(request: Request, { params }: { params: { gameId: string } }) {
  try {
    const gameId = params.gameId
    const boxscore = await fetchBoxscore(gameId)

    if (!boxscore) {
      return NextResponse.json({ error: "Game not found or not completed" }, { status: 404 })
    }

    if (boxscore.game.gameState !== "OFF") {
      return NextResponse.json({ error: "Game not yet completed" }, { status: 400 })
    }

    const recap = generateRecap(boxscore)
    return NextResponse.json(recap)
  } catch (error) {
    console.error("Error generating recap:", error)
    return NextResponse.json({ error: "Failed to generate recap" }, { status: 500 })
  }
}
