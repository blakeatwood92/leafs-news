import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

export const runtime = "edge"

async function getRecap(gameId: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/recap/${gameId}`)
    if (!res.ok) return null
    return await res.json()
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest, { params }: { params: { gameId: string } }) {
  try {
    const recap = await getRecap(params.gameId)

    if (!recap) {
      return new ImageResponse(
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#1e40af",
            color: "white",
          }}
        >
          <div style={{ fontSize: 60, fontWeight: "bold" }}>Game Recap</div>
          <div style={{ fontSize: 30, marginTop: 20 }}>Not Available</div>
        </div>,
        {
          width: 1200,
          height: 630,
        },
      )
    }

    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1e40af",
          backgroundImage: "linear-gradient(45deg, #1e40af 0%, #3b82f6 100%)",
          color: "white",
          padding: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: "bold",
              backgroundColor: recap.game.isLeafsWin ? "#16a34a" : "#dc2626",
              padding: "8px 16px",
              borderRadius: "8px",
              marginRight: "20px",
            }}
          >
            {recap.game.isLeafsWin ? "VICTORY" : "LOSS"}
          </div>
          <div style={{ fontSize: 48, fontWeight: "bold" }}>{recap.game.finalScore}</div>
        </div>

        <div
          style={{
            fontSize: 36,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "20px",
            lineHeight: 1.2,
            maxWidth: "900px",
          }}
        >
          {recap.recap.headline}
        </div>

        <div
          style={{
            fontSize: 18,
            textAlign: "center",
            opacity: 0.9,
            maxWidth: "800px",
          }}
        >
          {recap.recap.summary}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "40px",
            fontSize: 16,
            opacity: 0.8,
          }}
        >
          Leafs News
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    )
  } catch (error) {
    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1e40af",
          color: "white",
        }}
      >
        <div style={{ fontSize: 60, fontWeight: "bold" }}>Error Loading Recap</div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    )
  }
}
