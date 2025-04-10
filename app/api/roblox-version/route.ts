import { NextResponse } from "next/server"

export async function GET() {
  const robloxVersion = 668
  const futurrobloxVersion = 669

  return NextResponse.json(
    {
      "roblox-version": robloxVersion,
      "futur-roblox-version": futurrobloxVersion,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400", // Cache pendant 1 heure
        "Content-Type": "application/json",
      },
    },
  )
}
