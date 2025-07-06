import { type NextRequest, NextResponse } from "next/server"
import { mongodb } from "@/lib/mongodb"

export async function GET() {
  try {
    console.log("[API] GET /api/whitelist")

    const servers = await mongodb.getAllServers()
    const stats = await mongodb.getStats()

    return NextResponse.json({
      success: true,
      servers,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[API] Erreur GET:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[API] POST /api/whitelist")

    const { gameId, gameName } = await request.json()

    if (!gameId?.trim()) {
      return NextResponse.json({ success: false, error: "Game ID requis" }, { status: 400 })
    }

    const result = await mongodb.addServer(gameId.trim(), gameName?.trim())

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 409 })
    }

    const servers = await mongodb.getAllServers()

    return NextResponse.json({
      success: true,
      message: "Serveur ajouté",
      servers,
    })
  } catch (error) {
    console.error("[API] Erreur POST:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
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
