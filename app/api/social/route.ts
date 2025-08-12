import { NextResponse } from "next/server"

interface Tweet {
  id: string
  text: string
  author: {
    username: string
    name: string
    profile_image_url: string
    verified: boolean
  }
  created_at: string
  public_metrics: {
    retweet_count: number
    like_count: number
    reply_count: number
  }
  media?: {
    type: string
    url: string
  }[]
}

// Mock data for demonstration - replace with actual Twitter API calls
const mockTweets: Tweet[] = [
  {
    id: "1",
    text: "What a game! The Leafs showed incredible resilience tonight. Auston Matthews with another clutch performance! #LeafsForever #GoLeafsGo",
    author: {
      username: "leafsfan2024",
      name: "Leafs Nation",
      profile_image_url: "/hockey-fan-avatar.png",
      verified: false,
    },
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    public_metrics: {
      retweet_count: 45,
      like_count: 234,
      reply_count: 12,
    },
  },
  {
    id: "2",
    text: "Mitch Marner's playmaking ability is just unreal. That assist was pure magic! 🏒✨ #Leafs #NHL",
    author: {
      username: "hockeyanalyst",
      name: "Hockey Analytics Pro",
      profile_image_url: "/placeholder-kdtq0.png",
      verified: true,
    },
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    public_metrics: {
      retweet_count: 78,
      like_count: 456,
      reply_count: 23,
    },
  },
  {
    id: "3",
    text: "The atmosphere at Scotiabank Arena tonight was electric! Nothing beats playoff hockey in Toronto. #LeafsNation",
    author: {
      username: "torontosports",
      name: "Toronto Sports Hub",
      profile_image_url: "/generic-sports-logo.png",
      verified: true,
    },
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    public_metrics: {
      retweet_count: 123,
      like_count: 789,
      reply_count: 45,
    },
  },
  {
    id: "4",
    text: "William Nylander's speed on that breakaway was incredible. The future is bright for this team! 🔥 #Leafs",
    author: {
      username: "leafsinsider",
      name: "Leafs Insider",
      profile_image_url: "/hockey-reporter-avatar.png",
      verified: false,
    },
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    public_metrics: {
      retweet_count: 34,
      like_count: 187,
      reply_count: 8,
    },
  },
  {
    id: "5",
    text: "Joseph Woll has been absolutely stellar in net. The confidence he brings to the team is palpable. #GoLeafsGo",
    author: {
      username: "goalieexpert",
      name: "Goalie Analysis",
      profile_image_url: "/placeholder-s1jeg.png",
      verified: false,
    },
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    public_metrics: {
      retweet_count: 56,
      like_count: 298,
      reply_count: 15,
    },
  },
]

async function fetchTweets(): Promise<Tweet[]> {
  // In a real implementation, you would use the Twitter API v2
  // const response = await fetch('https://api.twitter.com/2/tweets/search/recent', {
  //   headers: {
  //     'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
  //   },
  //   params: {
  //     query: 'Toronto Maple Leafs OR #LeafsForever OR #GoLeafsGo',
  //     max_results: 20,
  //     'tweet.fields': 'created_at,public_metrics,author_id',
  //     'user.fields': 'name,username,profile_image_url,verified',
  //     expansions: 'author_id'
  //   }
  // });

  // For now, return mock data
  return mockTweets
}

export async function GET() {
  try {
    const tweets = await fetchTweets()

    return NextResponse.json({
      tweets,
      count: tweets.length,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching tweets:", error)
    return NextResponse.json({ error: "Failed to fetch tweets" }, { status: 500 })
  }
}
