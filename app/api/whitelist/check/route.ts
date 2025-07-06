import { type NextRequest, NextResponse } from "next/server"
import { mongodb } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get("gameId")

    console.log(`[API] Vérification serveur: ${gameId}`)

    if (!gameId) {
      return NextResponse.json({ success: false, error: "Game ID requis (?gameId=123456789)" }, { status: 400 })
    }

    // Timeout de 8 secondes
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => reject(new Error("Timeout vérification")), 8000)
    })

    const checkPromise = mongodb.isWhitelisted(gameId)

    const isWhitelisted = await Promise.race([checkPromise, timeoutPromise])

    return NextResponse.json({
      success: true,
      whitelisted: isWhitelisted,
      gameId,
      timestamp: new Date().toISOString(),
      message: isWhitelisted ? "Serveur autorisé - Obsidian activé" : "Serveur non autorisé - Obsidian désactivé",
    })
  } catch (error) {
    console.error("[API] Erreur vérification:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur",
        whitelisted: false,
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { gameId } = await request.json()

    console.log(`[API] Vérification serveur: ${gameId}`)

    if (!gameId) {
      return NextResponse.json({ success: false, error: "Game ID requis" }, { status: 400 })
    }

    const isWhitelisted = await mongodb.isWhitelisted(gameId)

    return NextResponse.json({
      success: true,
      whitelisted: isWhitelisted,
      gameId,
      timestamp: new Date().toISOString(),
      message: isWhitelisted ? "Serveur autorisé - Obsidian activé" : "Serveur non autorisé - Obsidian désactivé",
    })
  } catch (error) {
    console.error("[API] Erreur vérification:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur",
        whitelisted: false,
      },
      { status: 500 },
    )
  }
}
