import { type NextRequest, NextResponse } from "next/server"
import { WhitelistStorage } from "@/lib/whitelist-storage"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get("gameId")

    if (!gameId) {
      return NextResponse.json({ error: "Game ID requis" }, { status: 400 })
    }

    console.log("🔍 [API] Vérification GET pour Game ID:", gameId)
    WhitelistStorage.debug()

    const isWhitelisted = WhitelistStorage.isWhitelisted(gameId)

    if (isWhitelisted) {
      WhitelistStorage.updateLastCheck(gameId)
    }

    const response = {
      success: true,
      gameId: gameId,
      whitelisted: isWhitelisted,
      timestamp: new Date().toISOString(),
    }

    console.log("📤 [API] Réponse GET:", response)

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ [API] Erreur GET check whitelist:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { gameId } = await request.json()

    if (!gameId) {
      return NextResponse.json({ error: "Game ID requis" }, { status: 400 })
    }

    console.log("🔍 [API] Vérification POST pour Game ID:", gameId)
    WhitelistStorage.debug()

    const isWhitelisted = WhitelistStorage.isWhitelisted(gameId)

    if (isWhitelisted) {
      WhitelistStorage.updateLastCheck(gameId)
    }

    const response = {
      success: true,
      gameId: gameId,
      whitelisted: isWhitelisted,
      timestamp: new Date().toISOString(),
    }

    console.log("📤 [API] Réponse POST:", response)

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ [API] Erreur POST check whitelist:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}