import { type NextRequest, NextResponse } from "next/server"

// Référence au même stockage que l'autre route
const servers: Array<{
  gameId: string
  gameName?: string
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

    // Vérifier si le serveur est whitelisté
    const serverIndex = servers.findIndex((server) => server.gameId === gameId)
    const isWhitelisted = serverIndex !== -1

    // Mettre à jour la dernière vérification
    if (isWhitelisted) {
      servers[serverIndex].lastCheck = new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      gameId: gameId,
      whitelisted: isWhitelisted,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erreur check whitelist:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { gameId } = await request.json()

    if (!gameId) {
      return NextResponse.json({ error: "Game ID requis" }, { status: 400 })
    }

    // Vérifier si le serveur est whitelisté
    const serverIndex = servers.findIndex((server) => server.gameId === gameId)
    const isWhitelisted = serverIndex !== -1

    // Mettre à jour la dernière vérification
    if (isWhitelisted) {
      servers[serverIndex].lastCheck = new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      gameId: gameId,
      whitelisted: isWhitelisted,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erreur check whitelist:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
