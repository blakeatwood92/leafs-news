import { NextResponse } from "next/server"

const NHL_API_BASE = "https://api-web.nhle.com/v1"
const LEAFS_TEAM_ID = 10

interface CalendarGame {
  id: number
  gameDate: string
  awayTeam: { name: { default: string }; abbrev: string }
  homeTeam: { name: { default: string }; abbrev: string }
  venue: { default: string }
}

async function fetchLeafsSchedule(): Promise<CalendarGame[]> {
  try {
    const now = new Date()
    const currentSeason = now.getMonth() >= 9 ? now.getFullYear() : now.getFullYear() - 1
    const seasonId = `${currentSeason}${currentSeason + 1}`

    const response = await fetch(`${NHL_API_BASE}/club-schedule-season/${LEAFS_TEAM_ID}/${seasonId}`, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch schedule")
    }

    const data = await response.json()
    return data.games || []
  } catch (error) {
    console.error("Error fetching schedule for calendar:", error)
    return []
  }
}

function generateICS(games: CalendarGame[]): string {
  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Leafs News//Schedule//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Toronto Maple Leafs Schedule",
    "X-WR-CALDESC:Complete Toronto Maple Leafs game schedule",
  ]

  games.forEach((game) => {
    const gameDate = new Date(game.gameDate)
    const endDate = new Date(gameDate.getTime() + 3 * 60 * 60 * 1000) // 3 hours later

    const isLeafsHome = game.homeTeam.id === LEAFS_TEAM_ID
    const opponent = isLeafsHome ? game.awayTeam : game.homeTeam
    const location = isLeafsHome ? "Scotiabank Arena, Toronto" : game.venue.default

    const summary = `${game.awayTeam.abbrev} @ ${game.homeTeam.abbrev}`
    const description = `Toronto Maple Leafs ${isLeafsHome ? "vs" : "@"} ${opponent.name.default}`

    icsLines.push(
      "BEGIN:VEVENT",
      `UID:leafs-game-${game.id}@leafsnews.com`,
      `DTSTART:${gameDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTEND:${endDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      `STATUS:CONFIRMED`,
      `TRANSP:OPAQUE`,
      "END:VEVENT",
    )
  })

  icsLines.push("END:VCALENDAR")
  return icsLines.join("\r\n")
}

function generateGoogleCalendarUrl(games: CalendarGame[]): string {
  // For Google Calendar, we'll create a URL for the next upcoming game
  const upcomingGame = games.find((game) => new Date(game.gameDate) > new Date())
  if (!upcomingGame) return ""

  const gameDate = new Date(upcomingGame.gameDate)
  const endDate = new Date(gameDate.getTime() + 3 * 60 * 60 * 1000)

  const isLeafsHome = upcomingGame.homeTeam.id === LEAFS_TEAM_ID
  const opponent = isLeafsHome ? upcomingGame.awayTeam : upcomingGame.homeTeam
  const location = isLeafsHome ? "Scotiabank Arena, Toronto" : upcomingGame.venue.default

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${upcomingGame.awayTeam.abbrev} @ ${upcomingGame.homeTeam.abbrev}`,
    dates: `${gameDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z/${
      endDate.toISOString().replace(/[-:]/g, "").split(".")[0]
    }Z`,
    details: `Toronto Maple Leafs ${isLeafsHome ? "vs" : "@"} ${opponent.name.default}`,
    location: location,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export async function GET(request: Request, { params }: { params: { format: string } }) {
  try {
    const format = params.format
    const games = await fetchLeafsSchedule()

    if (format === "ics") {
      const icsContent = generateICS(games)
      return new NextResponse(icsContent, {
        headers: {
          "Content-Type": "text/calendar",
          "Content-Disposition": "attachment; filename=leafs-schedule.ics",
        },
      })
    }

    if (format === "google") {
      const googleUrl = generateGoogleCalendarUrl(games)
      return NextResponse.redirect(googleUrl)
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 })
  } catch (error) {
    console.error("Error generating calendar:", error)
    return NextResponse.json({ error: "Failed to generate calendar" }, { status: 500 })
  }
}
