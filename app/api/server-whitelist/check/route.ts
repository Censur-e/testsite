import { type NextRequest, NextResponse } from "next/server"

// Import de la whitelist (en production, utiliser une base de données partagée)
// Pour l'instant, on va simuler avec un stockage temporaire
const serverWhitelist: Array<{
  gameId: string
  name?: string
  addedAt: string
  lastCheck?: string
}> = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get("gameId")

    if (!gameId) {
      return NextResponse.json({ error: "Game ID requis" }, { status: 400 })
    }

    const serverEntry = serverWhitelist.find((entry) => entry.gameId === gameId)
    const isWhitelisted = !!serverEntry

    // Mettre à jour la dernière vérification
    if (serverEntry) {
      serverEntry.lastCheck = new Date().toISOString()
    }

    console.log(`🔍 Vérification serveur ${gameId}: ${isWhitelisted ? "AUTORISÉ" : "REFUSÉ"}`)

    return NextResponse.json({
      gameId: gameId,
      whitelisted: isWhitelisted,
      serverName: serverEntry?.name,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erreur vérification server whitelist:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { gameId } = await request.json()

    if (!gameId) {
      return NextResponse.json({ error: "Game ID requis" }, { status: 400 })
    }

    const serverEntry = serverWhitelist.find((entry) => entry.gameId === gameId)
    const isWhitelisted = !!serverEntry

    // Mettre à jour la dernière vérification
    if (serverEntry) {
      serverEntry.lastCheck = new Date().toISOString()
    }

    console.log(`🔍 Vérification serveur ${gameId}: ${isWhitelisted ? "AUTORISÉ" : "REFUSÉ"}`)

    return NextResponse.json({
      gameId: gameId,
      whitelisted: isWhitelisted,
      serverName: serverEntry?.name,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erreur vérification server whitelist:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
