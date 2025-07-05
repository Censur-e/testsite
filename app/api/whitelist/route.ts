import { type NextRequest, NextResponse } from "next/server"
import { WhitelistStorage } from "@/lib/whitelist-storage"

export async function GET() {
  try {
    console.log("[API] GET /api/whitelist - Récupération des serveurs")
    
    const servers = WhitelistStorage.getAllServers()
    const stats = WhitelistStorage.getStats()

    const response = {
      success: true,
      servers,
      stats,
      timestamp: new Date().toISOString(),
    }

    console.log("[API] GET /api/whitelist - Réponse:", response)
    return NextResponse.json(response)
  } catch (error) {
    console.error("[API] Erreur GET whitelist:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Erreur serveur lors de la récupération des serveurs",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[API] POST /api/whitelist - Ajout d'un serveur")
    
    const body = await request.json()
    console.log("[API] Corps de la requête:", body)
    
    const { gameId, gameName } = body

    if (!gameId || typeof gameId !== "string") {
      console.log("[API] Game ID manquant ou invalide")
      return NextResponse.json(
        { 
          success: false, 
          error: "Game ID requis et doit être une chaîne de caractères" 
        }, 
        { status: 400 }
      )
    }

    const result = WhitelistStorage.addServer(gameId.trim(), gameName?.trim())

    if (!result.success) {
      console.log("[API] Échec de l'ajout:", result.error)
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        }, 
        { status: 409 }
      )
    }

    const response = {
      success: true,
      message: "Serveur ajouté avec succès",
      gameId: gameId.trim(),
      servers: WhitelistStorage.getAllServers(),
    }

    console.log("[API] POST /api/whitelist - Succès:", response)
    return NextResponse.json(response)
  } catch (error) {
    console.error("[API] Erreur POST whitelist:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Erreur serveur lors de l'ajout du serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("[API] DELETE /api/whitelist - Suppression d'un serveur")
    
    const body = await request.json()
    console.log("[API] Corps de la requête:", body)
    
    const { gameId } = body

    if (!gameId) {
      console.log("[API] Game ID manquant")
      return NextResponse.json(
        { 
          success: false, 
          error: "Game ID requis" 
        }, 
        { status: 400 }
      )
    }

    const result = WhitelistStorage.removeServer(gameId)

    if (!result.success) {
      console.log("[API] Échec de la suppression:", result.error)
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        }, 
        { status: 404 }
      )
    }

    const response = {
      success: true,
      message: "Serveur supprimé avec succès",
      servers: WhitelistStorage.getAllServers(),
    }

    console.log("[API] DELETE /api/whitelist - Succès:", response)
    return NextResponse.json(response)
  } catch (error) {
    console.error("[API] Erreur DELETE whitelist:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Erreur serveur lors de la suppression du serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      }, 
      { status: 500 }
    )
  }
}