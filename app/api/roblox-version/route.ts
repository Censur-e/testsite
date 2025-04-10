import { NextResponse } from "next/server"

export async function GET() {
  // Vous pouvez mettre à jour cette valeur manuellement ou la récupérer dynamiquement
  // depuis une source externe si nécessaire
  const robloxVersion = 00 // Remplacez par la version actuelle de Roblox

  return NextResponse.json(
    {
      "roblox-version": robloxVersion,
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
