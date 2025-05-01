import { NextResponse } from "next/server"

export async function GET() {
  const response = await fetch("https://clientsettings.roblox.com/v2/client-version/WindowsPlayer")
  const data = await response.json()
  
  const robloxVersion = parseInt(data.version.split('.')[1])
  const futurrobloxVersion = robloxVersion + 1

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