import type { Metadata } from "next"
import RecapClientPage from "./RecapClientPage"

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

interface PageProps {
  params: {
    gameId: string
  }
}

async function getRecap(gameId: string): Promise<RecapData | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/recap/${gameId}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })
    if (!res.ok) return null
    return await res.json()
  } catch (error) {
    console.error("Failed to fetch recap:", error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const recap = await getRecap(params.gameId)

  if (!recap) {
    return {
      title: "Game Recap Not Found | Leafs News",
      description: "The requested game recap could not be found.",
    }
  }

  return {
    title: recap.seo.title,
    description: recap.seo.description,
    keywords: recap.seo.keywords,
    openGraph: {
      title: recap.seo.title,
      description: recap.seo.description,
      type: "article",
      publishedTime: recap.game.date,
      authors: ["Leafs News"],
      tags: recap.seo.keywords,
      images: [
        {
          url: `/api/og/recap/${params.gameId}`,
          width: 1200,
          height: 630,
          alt: recap.recap.headline,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: recap.seo.title,
      description: recap.seo.description,
      images: [`/api/og/recap/${params.gameId}`],
    },
  }
}

export default async function RecapPage({ params }: PageProps) {
  const recap = await getRecap(params.gameId)

  return <RecapClientPage params={params} recap={recap} />
}
