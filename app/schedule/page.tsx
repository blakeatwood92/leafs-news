import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  RefreshCw,
  Calendar,
  MapPin,
  Tv,
  Smartphone,
  Download,
  ExternalLink,
  Home,
  Plane,
  Filter,
} from "lucide-react"
import Link from "next/link"

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

interface PageProps {
  searchParams: {
    filter?: string
    month?: string
  }
}

async function getSchedule(filter?: string, month?: string): Promise<ScheduleData> {
  try {
    const params = new URLSearchParams()
    if (filter) params.append("filter", filter)
    if (month) params.append("month", month)

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/schedule?${params.toString()}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      },
    )
    if (!res.ok) throw new Error("Failed to fetch schedule")
    return await res.json()
  } catch (error) {
    console.error("Failed to fetch schedule:", error)
    return {
      games: [],
      totalGames: 0,
      homeGames: 0,
      awayGames: 0,
      lastUpdated: new Date().toISOString(),
    }
  }
}

function CalendarButtons() {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Add to Calendar:</span>
      <Button variant="outline" size="sm" asChild>
        <a href="/api/calendar/ics" download className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          ICS
        </a>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <a href="/api/calendar/google" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          Google
        </a>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <a
          href="webcal://localhost:3000/api/calendar/ics"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Apple
        </a>
      </Button>
    </div>
  )
}

function GameCard({ game }: { game: ScheduleGame }) {
  const isLeafsHome = game.homeTeam.id === 10
  const isLeafsAway = game.awayTeam.id === 10
  const opponent = isLeafsHome ? game.awayTeam : game.homeTeam

  const gameDate = new Date(game.gameDate)
  const isUpcoming = game.gameState !== "OFF"
  const isPast = game.gameState === "OFF"

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${isLeafsHome ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-800"}`}
            >
              {isLeafsHome ? <Home className="w-4 h-4 text-blue-600" /> : <Plane className="w-4 h-4 text-gray-600" />}
            </div>
            <div>
              <div className="font-semibold">
                {game.awayTeam.abbrev} @ {game.homeTeam.abbrev}
              </div>
              <div className="text-sm text-muted-foreground">vs {opponent.name.default}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">{gameDate.toLocaleDateString([], { month: "short", day: "numeric" })}</div>
            <div className="text-sm text-muted-foreground">
              {gameDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          {game.venue.default}
        </div>

        {/* TV/Streaming Information */}
        <div className="space-y-3">
          {game.tvBroadcasts.canada.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tv className="w-4 h-4" />
                <span className="text-sm font-medium">Canada TV</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {game.tvBroadcasts.canada.map((channel) => (
                  <Badge key={channel} variant="secondary" className="text-xs">
                    {channel}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {game.tvBroadcasts.usa.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tv className="w-4 h-4" />
                <span className="text-sm font-medium">USA TV</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {game.tvBroadcasts.usa.map((channel) => (
                  <Badge key={channel} variant="outline" className="text-xs">
                    {channel}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {game.tvBroadcasts.streaming.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="w-4 h-4" />
                <span className="text-sm font-medium">Streaming</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {game.tvBroadcasts.streaming.map((service) => (
                  <Badge key={service} variant="default" className="text-xs">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-2">
          {isUpcoming && (
            <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
              <Link href={`/preview/${game.id}`}>Game Preview</Link>
            </Button>
          )}
          {isPast && (
            <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
              <Link href={`/recaps/${game.id}`}>Game Recap</Link>
            </Button>
          )}
          {game.ticketLink && (
            <Button variant="default" size="sm" asChild>
              <a href={game.ticketLink} target="_blank" rel="noopener noreferrer">
                Tickets
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ScheduleFilters({ currentFilter, currentMonth }: { currentFilter?: string; currentMonth?: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">Filters:</span>
      </div>

      <Select defaultValue={currentFilter || "all"}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="All Games" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Games</SelectItem>
          <SelectItem value="home">Home</SelectItem>
          <SelectItem value="away">Away</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue={currentMonth || "all"}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All Months" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Months</SelectItem>
          <SelectItem value="2024-10">October 2024</SelectItem>
          <SelectItem value="2024-11">November 2024</SelectItem>
          <SelectItem value="2024-12">December 2024</SelectItem>
          <SelectItem value="2025-01">January 2025</SelectItem>
          <SelectItem value="2025-02">February 2025</SelectItem>
          <SelectItem value="2025-03">March 2025</SelectItem>
          <SelectItem value="2025-04">April 2025</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export default async function SchedulePage({ searchParams }: PageProps) {
  const { games, totalGames, homeGames, awayGames, lastUpdated } = await getSchedule(
    searchParams.filter,
    searchParams.month,
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100">Schedule & TV</h1>
                <p className="text-sm text-muted-foreground">Complete schedule with streaming info</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <CalendarButtons />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <RefreshCw className="w-3 h-3" />
                Updated: {new Date(lastUpdated).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Schedule Overview */}
        <section className="mb-8">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="py-6 text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalGames}</div>
                <div className="text-sm text-blue-800 dark:text-blue-200">Total Games</div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <CardContent className="py-6 text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{homeGames}</div>
                <div className="text-sm text-green-800 dark:text-green-200">Home Games</div>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
              <CardContent className="py-6 text-center">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{awayGames}</div>
                <div className="text-sm text-orange-800 dark:text-orange-200">Away Games</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Filters */}
        <ScheduleFilters currentFilter={searchParams.filter} currentMonth={searchParams.month} />

        {/* Games List */}
        <section>
          {games.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No games found for the selected filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
