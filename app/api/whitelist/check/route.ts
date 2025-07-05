import { type NextRequest, NextResponse } from "next/server"
import { WhitelistStorage } from "@/lib/whitelist-storage"

export async function GET(request: NextRequest) {
  try {
    console.log("[API] GET /api/whitelist/check - Vérification d'un serveur")
    
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get("gameId")

    console.log("[API] Game ID reçu:", gameId)

    if (!gameId) {
      console.log("[API] Game ID manquant dans les paramètres")
      return NextResponse.json(
        { 
          success: false, 
          error: "Game ID requis dans les paramètres de l'URL (?gameId=123456)" 
        }, 
        { status: 400 }
      )
    }

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

    console.log("[API] GET /api/whitelist/check - Réponse:", response)
    return NextResponse.json(response)
  } catch (error) {
    console.error("[API] Erreur GET check whitelist:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Erreur serveur lors de la vérification",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[API] POST /api/whitelist/check - Vérification d'un serveur")
    
    const body = await request.json()
    console.log("[API] Corps de la requête:", body)
    
    const { gameId } = body

    if (!gameId) {
      console.log("[API] Game ID manquant dans le corps")
      return NextResponse.json(
        { 
          success: false, 
          error: "Game ID requis dans le corps de la requête" 
        }, 
        { status: 400 }
      )
    }

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

    console.log("[API] POST /api/whitelist/check - Réponse:", response)
    return NextResponse.json(response)
  } catch (error) {
    console.error("[API] Erreur POST check whitelist:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Erreur serveur lors de la vérification",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      }, 
      { status: 500 }
    )
  }
}
