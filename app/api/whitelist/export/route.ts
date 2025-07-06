import { type NextRequest, NextResponse } from "next/server"
import { WhitelistStorage } from "@/lib/whitelist-storage"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get("gameId")

    console.log(`[API] GET /api/whitelist/check - Vérification du serveur: ${gameId}`)

    if (!gameId) {
      console.log("[API] Game ID manquant dans les paramètres")
      return NextResponse.json(
        {
          success: false,
          error: "Game ID requis en paramètre (?gameId=123456789)",
        },
        { status: 400 },
      )
    }

    // Forcer le rechargement des données depuis le JSON pour s'assurer d'avoir les dernières
    await WhitelistStorage.reload()

    const isWhitelisted = WhitelistStorage.isWhitelisted(gameId)

    // Mettre à jour la dernière vérification si le serveur est whitelisté
    if (isWhitelisted) {
      await WhitelistStorage.updateLastCheck(gameId)
    }

    const response = {
      success: true,
      whitelisted: isWhitelisted,
      gameId: gameId,
      timestamp: new Date().toISOString(),
      message: isWhitelisted
        ? "Serveur autorisé - Obsidian peut être activé"
        : "Serveur non autorisé - Obsidian reste désactivé",
    }

    console.log(`[API] Résultat de la vérification:`, response)
    return NextResponse.json(response)
  } catch (error) {
    console.error("[API] Erreur lors de la vérification:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la vérification",
        whitelisted: false,
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gameId } = body

    console.log(`[API] POST /api/whitelist/check - Vérification du serveur: ${gameId}`)

    if (!gameId) {
      console.log("[API] Game ID manquant dans le corps de la requête")
      return NextResponse.json(
        {
          success: false,
          error: "Game ID requis dans le corps de la requête",
        },
        { status: 400 },
      )
    }

    // Forcer le rechargement des données depuis le JSON
    await WhitelistStorage.reload()

    const isWhitelisted = WhitelistStorage.isWhitelisted(gameId)

    // Mettre à jour la dernière vérification si le serveur est whitelisté
    if (isWhitelisted) {
      await WhitelistStorage.updateLastCheck(gameId)
    }

    const response = {
      success: true,
      whitelisted: isWhitelisted,
      gameId: gameId,
      timestamp: new Date().toISOString(),
      message: isWhitelisted
        ? "Serveur autorisé - Obsidian peut être activé"
        : "Serveur non autorisé - Obsidian reste désactivé",
    }

    console.log(`[API] Résultat de la vérification:`, response)
    return NextResponse.json(response)
  } catch (error) {
    console.error("[API] Erreur lors de la vérification:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la vérification",
        whitelisted: false,
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
