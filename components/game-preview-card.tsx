"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  MapPin,
  Thermometer,
  Wind,
  Users,
  TrendingUp,
  AlertTriangle,
  BellIcon as Whistle,
} from "lucide-react"
import { useEffect, useState } from "react"

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

interface GamePreviewCardProps {
  gameId: string
}

export function GamePreviewCard({ gameId }: GamePreviewCardProps) {
  const [data, setData] = useState<GamePreviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPreview() {
      try {
        const response = await fetch(`/api/game-preview/${gameId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch game preview")
        }
        const previewData = await response.json()
        setData(previewData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchPreview()
  }, [gameId])

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="py-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading game preview...</p>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className="w-full">
        <CardContent className="py-12 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-600">Failed to load game preview</p>
        </CardContent>
      </Card>
    )
  }

  const gameDate = new Date(data.game.date)

  return (
    <div className="w-full space-y-6">
      {/* SEO JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SportsEvent",
            name: `Toronto Maple Leafs vs ${data.game.opponent.name}`,
            startDate: data.game.date,
            location: {
              "@type": "Place",
              name: data.game.venue,
            },
            homeTeam: {
              "@type": "SportsTeam",
              name: "Toronto Maple Leafs",
            },
            awayTeam: {
              "@type": "SportsTeam",
              name: data.game.opponent.name,
            },
            sport: "Ice Hockey",
          }),
        }}
      />

      {/* Game Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100">Game Day Preview</CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {gameDate.toLocaleDateString()} at{" "}
                  {gameDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {data.game.venue}
                </div>
              </div>
            </div>
            <Badge variant="secondary">{data.game.gameType}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-lg font-bold">Toronto Maple Leafs</div>
              <div className="text-sm text-muted-foreground">TOR</div>
            </div>
            <div className="text-center px-8">
              <div className="text-4xl font-bold text-blue-600">VS</div>
              <div className="text-sm text-muted-foreground mt-1">
                {gameDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{data.game.opponent.name}</div>
              <div className="text-sm text-muted-foreground">
                {data.game.opponent.abbrev} ({data.game.opponent.record})
              </div>
            </div>
          </div>

          {/* Weather for outdoor games */}
          {data.game.weather && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Thermometer className="w-4 h-4" />
                Weather Conditions
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Temperature:</span> {data.game.weather.temperature}
                </div>
                <div>
                  <span className="font-medium">Conditions:</span> {data.game.weather.conditions}
                </div>
                <div className="flex items-center gap-1">
                  <Wind className="w-3 h-3" />
                  <span className="font-medium">Wind:</span> {data.game.weather.wind}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="lineups" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="lineups" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Lineups
          </TabsTrigger>
          <TabsTrigger value="injuries" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Injuries
          </TabsTrigger>
          <TabsTrigger value="officials" className="flex items-center gap-2">
            <Whistle className="w-4 h-4" />
            Officials
          </TabsTrigger>
          <TabsTrigger value="odds" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Odds
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lineups" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Leafs Lineup */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Toronto Maple Leafs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Forwards</h4>
                  {data.probableLineups.leafs.forwards.map((line) => (
                    <div key={line.line} className="text-sm mb-2">
                      <Badge variant="outline" className="mr-2">
                        Line {line.line}
                      </Badge>
                      {line.left} - {line.center} - {line.right}
                    </div>
                  ))}
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Defense</h4>
                  {data.probableLineups.leafs.defense.map((pair) => (
                    <div key={pair.pair} className="text-sm mb-2">
                      <Badge variant="outline" className="mr-2">
                        Pair {pair.pair}
                      </Badge>
                      {pair.left} - {pair.right}
                    </div>
                  ))}
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Goalies</h4>
                  <div className="text-sm space-y-1">
                    <div>
                      <Badge className="mr-2">Starter</Badge>
                      {data.probableLineups.leafs.goalies.starter}
                    </div>
                    <div>
                      <Badge variant="secondary" className="mr-2">
                        Backup
                      </Badge>
                      {data.probableLineups.leafs.goalies.backup}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Opponent Lineup */}
            <Card>
              <CardHeader>
                <CardTitle>{data.game.opponent.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Forwards</h4>
                  {data.probableLineups.opponent.forwards.map((line) => (
                    <div key={line.line} className="text-sm mb-2">
                      <Badge variant="outline" className="mr-2">
                        Line {line.line}
                      </Badge>
                      {line.left} - {line.center} - {line.right}
                    </div>
                  ))}
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Defense</h4>
                  {data.probableLineups.opponent.defense.map((pair) => (
                    <div key={pair.pair} className="text-sm mb-2">
                      <Badge variant="outline" className="mr-2">
                        Pair {pair.pair}
                      </Badge>
                      {pair.left} - {pair.right}
                    </div>
                  ))}
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Goalies</h4>
                  <div className="text-sm space-y-1">
                    <div>
                      <Badge className="mr-2">Starter</Badge>
                      {data.probableLineups.opponent.goalies.starter}
                    </div>
                    <div>
                      <Badge variant="secondary" className="mr-2">
                        Backup
                      </Badge>
                      {data.probableLineups.opponent.goalies.backup}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="injuries" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Toronto Maple Leafs</CardTitle>
              </CardHeader>
              <CardContent>
                {data.injuries.leafs.length === 0 ? (
                  <p className="text-muted-foreground">No injuries reported</p>
                ) : (
                  <div className="space-y-3">
                    {data.injuries.leafs.map((injury, index) => (
                      <div key={index} className="border-l-4 border-red-500 pl-4">
                        <div className="font-medium">{injury.player}</div>
                        <div className="text-sm text-muted-foreground">
                          {injury.injury} - {injury.status}
                          {injury.expectedReturn && (
                            <span className="ml-2 text-green-600">Expected: {injury.expectedReturn}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{data.game.opponent.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {data.injuries.opponent.length === 0 ? (
                  <p className="text-muted-foreground">No injuries reported</p>
                ) : (
                  <div className="space-y-3">
                    {data.injuries.opponent.map((injury, index) => (
                      <div key={index} className="border-l-4 border-red-500 pl-4">
                        <div className="font-medium">{injury.player}</div>
                        <div className="text-sm text-muted-foreground">
                          {injury.injury} - {injury.status}
                          {injury.expectedReturn && (
                            <span className="ml-2 text-green-600">Expected: {injury.expectedReturn}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="officials">
          <Card>
            <CardHeader>
              <CardTitle>Game Officials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Referees</h4>
                <div className="space-y-1">
                  {data.officials.referees.map((ref, index) => (
                    <div key={index} className="text-sm">
                      {ref}
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Linesmen</h4>
                <div className="space-y-1">
                  {data.officials.linesmen.map((linesman, index) => (
                    <div key={index} className="text-sm">
                      {linesman}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="odds">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Moneyline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Toronto Maple Leafs</span>
                  <Badge variant={data.odds.moneyline.leafs.startsWith("-") ? "default" : "secondary"}>
                    {data.odds.moneyline.leafs}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>{data.game.opponent.abbrev}</span>
                  <Badge variant={data.odds.moneyline.opponent.startsWith("-") ? "default" : "secondary"}>
                    {data.odds.moneyline.opponent}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-center mb-2">
                  <Badge variant="outline">O/U {data.odds.total.line}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Over</span>
                  <Badge variant="secondary">{data.odds.total.over}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Under</span>
                  <Badge variant="secondary">{data.odds.total.under}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Puck Line</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Toronto Maple Leafs {data.odds.spread.line}</span>
                  <Badge variant="secondary">{data.odds.spread.leafs}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>
                    {data.game.opponent.abbrev} +{Math.abs(Number.parseFloat(data.odds.spread.line))}
                  </span>
                  <Badge variant="secondary">{data.odds.spread.opponent}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
