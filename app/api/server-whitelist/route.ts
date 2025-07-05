import { type NextRequest, NextResponse } from "next/server"

// Stockage temporaire en mémoire (remplacer par une base de données en production)
let serverWhitelist: Array<{
  gameId: string
  name?: string
  addedAt: string
  lastCheck?: string
}> = []

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      servers: serverWhitelist,
      count: serverWhitelist.length,
    })
  } catch (error) {
    console.error("Erreur GET server whitelist:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { gameId, name } = await request.json()

    if (!gameId || typeof gameId !== "string") {
      return NextResponse.json({ error: "Game ID requis" }, { status: 400 })
    }

    // Vérifier si le serveur existe déjà
    if (serverWhitelist.some((entry) => entry.gameId === gameId)) {
      return NextResponse.json({ error: "Serveur déjà dans la whitelist" }, { status: 409 })
    }

    // Ajouter à la whitelist
    const newEntry = {
      gameId: gameId,
      name: name || undefined,
      addedAt: new Date().toISOString(),
    }

    serverWhitelist.push(newEntry)

    console.log(`✅ Serveur ajouté à la whitelist: ${gameId} ${name ? `(${name})` : ""}`)

    return NextResponse.json({
      success: true,
      message: "Serveur ajouté à la whitelist",
      servers: serverWhitelist,
    })
  } catch (error) {
    console.error("Erreur POST server whitelist:", error)
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
    const initialLength = serverWhitelist.length
    serverWhitelist = serverWhitelist.filter((entry) => entry.gameId !== gameId)

    if (serverWhitelist.length === initialLength) {
      return NextResponse.json({ error: "Serveur non trouvé dans la whitelist" }, { status: 404 })
    }

    console.log(`❌ Serveur retiré de la whitelist: ${gameId}`)

    return NextResponse.json({
      success: true,
      message: "Serveur retiré de la whitelist",
      servers: serverWhitelist,
    })
  } catch (error) {
    console.error("Erreur DELETE server whitelist:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
