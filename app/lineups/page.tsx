"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeft,
  RefreshCw,
  Users,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpDown,
  History,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

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

function PlayerCard({
  player,
  onConfirm,
  onSwap,
}: {
  player: Player
  onConfirm?: () => void
  onSwap?: () => void
}) {
  return (
    <div className="group relative">
      <Card
        className={`transition-all hover:shadow-md ${player.confirmed ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20" : "border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20"}`}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-xs font-mono text-muted-foreground">#{player.number}</div>
              <div>
                <div className="font-medium text-sm">{player.name}</div>
                <div className="text-xs text-muted-foreground">{player.position}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {player.confirmed ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-orange-600" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons on hover */}
      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
        {!player.confirmed && onConfirm && (
          <Button size="sm" variant="secondary" onClick={onConfirm}>
            Confirm
          </Button>
        )}
        {onSwap && (
          <Button size="sm" variant="outline" onClick={onSwap}>
            <ArrowUpDown className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  )
}

function EvenStrengthTab({
  depthChart,
  onPlayerAction,
}: {
  depthChart: DepthChart["evenStrength"]
  onPlayerAction: (action: string, player: Player) => void
}) {
  return (
    <div className="space-y-8">
      {/* Forwards */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Forwards
        </h3>
        <div className="space-y-4">
          {Object.entries(depthChart.forwards).map(([lineKey, line]) => (
            <Card key={lineKey}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{lineKey.replace("line", "Line ")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">LW</div>
                    <PlayerCard
                      player={line.left}
                      onConfirm={() => onPlayerAction("confirm", line.left)}
                      onSwap={() => onPlayerAction("swap", line.left)}
                    />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">C</div>
                    <PlayerCard
                      player={line.center}
                      onConfirm={() => onPlayerAction("confirm", line.center)}
                      onSwap={() => onPlayerAction("swap", line.center)}
                    />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">RW</div>
                    <PlayerCard
                      player={line.right}
                      onConfirm={() => onPlayerAction("confirm", line.right)}
                      onSwap={() => onPlayerAction("swap", line.right)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Defense */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Defense</h3>
        <div className="space-y-4">
          {Object.entries(depthChart.defense).map(([pairKey, pair]) => (
            <Card key={pairKey}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{pairKey.replace("pair", "Pair ")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">LD</div>
                    <PlayerCard
                      player={pair.left}
                      onConfirm={() => onPlayerAction("confirm", pair.left)}
                      onSwap={() => onPlayerAction("swap", pair.left)}
                    />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">RD</div>
                    <PlayerCard
                      player={pair.right}
                      onConfirm={() => onPlayerAction("confirm", pair.right)}
                      onSwap={() => onPlayerAction("swap", pair.right)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Goalies */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Goalies</h3>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground mb-2">Starter</div>
                <PlayerCard
                  player={depthChart.goalies.starter}
                  onConfirm={() => onPlayerAction("confirm", depthChart.goalies.starter)}
                />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2">Backup</div>
                <PlayerCard
                  player={depthChart.goalies.backup}
                  onConfirm={() => onPlayerAction("confirm", depthChart.goalies.backup)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SpecialTeamsTab({
  units,
  title,
  onPlayerAction,
}: {
  units: { unit1: { forwards: Player[]; defense: Player[] }; unit2: { forwards: Player[]; defense: Player[] } }
  title: string
  onPlayerAction: (action: string, player: Player) => void
}) {
  return (
    <div className="space-y-6">
      {Object.entries(units).map(([unitKey, unit]) => (
        <Card key={unitKey}>
          <CardHeader>
            <CardTitle className="text-lg">{unitKey.replace("unit", "Unit ")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">Forwards</h4>
              <div className="grid grid-cols-3 gap-3">
                {unit.forwards.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    onConfirm={() => onPlayerAction("confirm", player)}
                    onSwap={() => onPlayerAction("swap", player)}
                  />
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <h4 className="font-medium mb-3">Defense</h4>
              <div className="grid grid-cols-2 gap-3">
                {unit.defense.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    onConfirm={() => onPlayerAction("confirm", player)}
                    onSwap={() => onPlayerAction("swap", player)}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ChangeLog({ changes }: { changes: LineupChange[] }) {
  const getChangeIcon = (type: string) => {
    switch (type) {
      case "confirm":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "swap":
        return <ArrowUpDown className="w-4 h-4 text-blue-600" />
      case "update":
        return <AlertCircle className="w-4 h-4 text-orange-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getSituationBadge = (situation: string) => {
    switch (situation) {
      case "even-strength":
        return <Badge variant="secondary">ES</Badge>
      case "power-play":
        return <Badge variant="default">PP</Badge>
      case "penalty-kill":
        return <Badge variant="outline">PK</Badge>
      default:
        return <Badge variant="secondary">{situation}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Change Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {changes.map((change) => (
              <div key={change.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="mt-0.5">{getChangeIcon(change.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getSituationBadge(change.situation)}
                    <span className="text-xs text-muted-foreground">{new Date(change.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-sm">{change.description}</p>
                  {change.details.playersInvolved && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Players: {change.details.playersInvolved.join(", ")}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default function LineupsPage() {
  const [lineupData, setLineupData] = useState<LineupData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLineups() {
      try {
        const response = await fetch("/api/lineups")
        if (response.ok) {
          const data = await response.json()
          setLineupData(data)
        }
      } catch (error) {
        console.error("Failed to fetch lineups:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLineups()
  }, [])

  const handlePlayerAction = async (action: string, player: Player) => {
    try {
      const response = await fetch("/api/lineups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          situation: "even-strength",
          details: {
            description: `${action === "confirm" ? "Confirmed" : "Updated"} ${player.name}`,
            playersInvolved: [player.name],
          },
        }),
      })

      if (response.ok) {
        // Refresh data
        const updatedResponse = await fetch("/api/lineups")
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json()
          setLineupData(updatedData)
        }
      }
    } catch (error) {
      console.error("Failed to update lineup:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-background">
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading lineup data...</p>
        </div>
      </div>
    )
  }

  if (!lineupData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-background">
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Failed to Load Lineups</h2>
          <p className="text-muted-foreground mb-6">There was an error loading the lineup data.</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

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
                <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100">Lineup Tracker</h1>
                <p className="text-sm text-muted-foreground">Dynamic depth chart with change tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <RefreshCw className="w-3 h-3" />
              Updated: {new Date(lineupData.lastUpdated).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="even-strength" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="even-strength" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Even Strength
                </TabsTrigger>
                <TabsTrigger value="power-play" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Power Play
                </TabsTrigger>
                <TabsTrigger value="penalty-kill" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Penalty Kill
                </TabsTrigger>
              </TabsList>

              <TabsContent value="even-strength" className="mt-6">
                <EvenStrengthTab depthChart={lineupData.depthChart.evenStrength} onPlayerAction={handlePlayerAction} />
              </TabsContent>

              <TabsContent value="power-play" className="mt-6">
                <SpecialTeamsTab
                  units={lineupData.depthChart.powerPlay}
                  title="Power Play"
                  onPlayerAction={handlePlayerAction}
                />
              </TabsContent>

              <TabsContent value="penalty-kill" className="mt-6">
                <SpecialTeamsTab
                  units={lineupData.depthChart.penaltyKill}
                  title="Penalty Kill"
                  onPlayerAction={handlePlayerAction}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ChangeLog changes={lineupData.changeLog} />
          </div>
        </div>
      </div>
    </div>
  )
}
