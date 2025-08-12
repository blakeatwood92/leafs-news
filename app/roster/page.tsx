import type React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, RefreshCw, MapPin, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

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
  totalPlayers: number
  lastUpdated: string
}

async function getRoster(): Promise<RosterData> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/roster`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })
    if (!res.ok) throw new Error("Failed to fetch roster")
    return await res.json()
  } catch (error) {
    console.error("Failed to fetch roster:", error)
    return {
      forwards: [],
      defensemen: [],
      goalies: [],
      totalPlayers: 0,
      lastUpdated: new Date().toISOString(),
    }
  }
}

function formatHeight(inches: number): string {
  const feet = Math.floor(inches / 12)
  const remainingInches = inches % 12
  return `${feet}'${remainingInches}"`
}

function calculateAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

function getPositionColor(position: string): string {
  switch (position) {
    case "C":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    case "LW":
    case "RW":
    case "L":
    case "R":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "D":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
    case "G":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }
}

function PlayerCard({ player }: { player: Player }) {
  const birthLocation = player.birthStateProvince
    ? `${player.birthCity.default}, ${player.birthStateProvince.default}, ${player.birthCountry}`
    : `${player.birthCity.default}, ${player.birthCountry}`

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Image
              src={player.headshot || "/placeholder.svg?height=80&width=80"}
              alt={`${player.firstName.default} ${player.lastName.default}`}
              width={80}
              height={80}
              className="rounded-lg bg-gray-100 dark:bg-gray-800"
            />
            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {player.sweaterNumber}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-bold text-lg leading-tight">
                  {player.firstName.default} {player.lastName.default}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getPositionColor(player.positionCode)}>{player.positionCode}</Badge>
                  <span className="text-sm text-muted-foreground">#{player.sweaterNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex items-center gap-1 mb-2">
              <span className="font-medium">Height:</span>
              <span className="text-muted-foreground">{formatHeight(player.heightInInches)}</span>
            </div>
            <div className="flex items-center gap-1 mb-2">
              <span className="font-medium">Weight:</span>
              <span className="text-muted-foreground">{player.weightInPounds} lbs</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">Shoots:</span>
              <span className="text-muted-foreground">{player.shootsCatches}</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-2">
              <Calendar className="w-3 h-3" />
              <span className="text-muted-foreground">Age {calculateAge(player.birthDate)}</span>
            </div>
            <div className="flex items-start gap-1">
              <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground text-xs leading-tight">{birthLocation}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PlayerSection({ title, players, icon }: { title: string; players: Player[]; icon: React.ReactNode }) {
  if (players.length === 0) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-6 flex items-center gap-2">
          {icon}
          {title}
          <Badge variant="secondary">0</Badge>
        </h2>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No {title.toLowerCase()} data available.</p>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-6 flex items-center gap-2">
        {icon}
        {title}
        <Badge variant="secondary">{players.length}</Badge>
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {players.map((player) => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>
    </section>
  )
}

export default async function RosterPage() {
  const { forwards, defensemen, goalies, totalPlayers, lastUpdated } = await getRoster()

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
                <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100">Team Roster</h1>
                <p className="text-sm text-muted-foreground">2024-25 Toronto Maple Leafs</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">{totalPlayers} players</Badge>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <RefreshCw className="w-3 h-3" />
                Updated: {new Date(lastUpdated).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Team Overview */}
        <section className="mb-12">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="py-6 text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{forwards.length}</div>
                <div className="text-sm text-blue-800 dark:text-blue-200">Forwards</div>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
              <CardContent className="py-6 text-center">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{defensemen.length}</div>
                <div className="text-sm text-orange-800 dark:text-orange-200">Defensemen</div>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
              <CardContent className="py-6 text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{goalies.length}</div>
                <div className="text-sm text-purple-800 dark:text-purple-200">Goalies</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Player Sections */}
        <PlayerSection title="Forwards" players={forwards} icon={<Users className="w-6 h-6" />} />
        <PlayerSection title="Defensemen" players={defensemen} icon={<Users className="w-6 h-6" />} />
        <PlayerSection title="Goalies" players={goalies} icon={<Users className="w-6 h-6" />} />
      </div>
    </div>
  )
}
