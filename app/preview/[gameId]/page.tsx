import { GamePreviewCard } from "@/components/game-preview-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: {
    gameId: string
  }
}

export default function GamePreviewPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/scores" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Scores
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100">Game Preview</h1>
              <p className="text-sm text-muted-foreground">Complete game day information</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <GamePreviewCard gameId={params.gameId} />
      </div>
    </div>
  )
}
