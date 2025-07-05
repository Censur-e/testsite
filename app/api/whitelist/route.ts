import { type NextRequest, NextResponse } from "next/server"

// Stockage temporaire en mémoire (remplacer par une base de données en production)
let servers: Array<{
  gameId: string
  gameName?: string
  addedAt: string
  lastCheck?: string
}> = []

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      servers: servers,
      count: servers.length,
    })
  } catch (error) {
    console.error("Erreur GET whitelist:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { gameId } = await request.json()

    if (!gameId || typeof gameId !== "string") {
      return NextResponse.json({ error: "Game ID requis" }, { status: 400 })
    }

    // Vérifier si le Game ID existe déjà
    if (servers.some((server) => server.gameId === gameId)) {
      return NextResponse.json({ error: "Serveur déjà dans la whitelist" }, { status: 409 })
    }

    // Ajouter à la whitelist
    const newServer = {
      gameId: gameId,
      addedAt: new Date().toISOString(),
    }

    servers.push(newServer)

    return NextResponse.json({
      success: true,
      message: "Serveur ajouté à la whitelist",
      servers: servers,
    })
  } catch (error) {
    console.error("Erreur POST whitelist:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { gameId } = await request.json()

    if (!gameId) {
      return NextResponse.json({ error: "Game ID requis" }, { status: 400 })
    }

    // Supprimer de la whitelist
    const initialLength = servers.length
    servers = servers.filter((server) => server.gameId !== gameId)

    if (servers.length === initialLength) {
      return NextResponse.json({ error: "Serveur non trouvé dans la whitelist" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Serveur retiré de la whitelist",
      servers: servers,
    })
  } catch (error) {
    console.error("Erreur DELETE whitelist:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
