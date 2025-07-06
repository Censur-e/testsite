import { type NextRequest, NextResponse } from "next/server"
import { mongodb } from "@/lib/mongodb"

export async function GET() {
  try {
    console.log("[API] 📡 GET /api/whitelist - Récupération des serveurs")

    const servers = await mongodb.getAllServers()
    const stats = await mongodb.getStats()

    console.log(`[API] ✅ Récupéré ${servers.length} serveurs`)

    return NextResponse.json({
      success: true,
      servers,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[API] ❌ Erreur GET:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la récupération",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[API] ➕ POST /api/whitelist - Ajout serveur")

    const body = await request.json()
    const { gameId, gameName } = body

    console.log("[API] 📝 Données reçues:", { gameId, gameName })

    if (!gameId?.trim()) {
      console.log("[API] ❌ Game ID manquant")
      return NextResponse.json({ success: false, error: "Game ID requis" }, { status: 400 })
    }

    const result = await mongodb.addServer(gameId.trim(), gameName?.trim())

    if (!result.success) {
      console.log("[API] ❌ Échec ajout:", result.error)
      return NextResponse.json({ success: false, error: result.error }, { status: 409 })
    }

    const servers = await mongodb.getAllServers()

    console.log("[API] ✅ Serveur ajouté avec succès")
    return NextResponse.json({
      success: true,
      message: "Serveur ajouté avec succès",
      servers,
    })
  } catch (error) {
    console.error("[API] ❌ Erreur POST:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de l'ajout",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("[API] DELETE /api/whitelist")

    const { gameId } = await request.json()

    if (!gameId) {
      return NextResponse.json({ success: false, error: "Game ID requis" }, { status: 400 })
    }

    const result = await mongodb.removeServer(gameId)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 404 })
    }

    const servers = await mongodb.getAllServers()

    return NextResponse.json({
      success: true,
      message: "Serveur supprimé",
      servers,
    })
  } catch (error) {
    console.error("[API] Erreur DELETE:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
