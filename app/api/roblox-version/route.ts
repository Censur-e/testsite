import { NextResponse } from "next/server"

export async function GET() {
  const robloxVersion = 670
  const futurrobloxVersion = 671

  return NextResponse.json(
    {
      "roblox-version": robloxVersion,
      "futur-roblox-version": futurrobloxVersion,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "Content-Type": "application/json",
      },
    },
  )
}
