import { type NextRequest, NextResponse } from "next/server"
import { WhitelistStorage } from "@/lib/whitelist-storage"

export async function GET() {
  try {
    const servers = WhitelistStorage.getAll()

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
    const { gameId, gameName } = await request.json()

    if (!gameId || typeof gameId !== "string") {
      return NextResponse.json({ error: "Game ID requis" }, { status: 400 })
    }

    console.log("Tentative d'ajout du serveur:", gameId)

    const servers = WhitelistStorage.add(gameId.trim(), gameName?.trim())

    return NextResponse.json({
      success: true,
      message: "Serveur ajouté à la whitelist",
      servers: servers,
    })
  } catch (error) {
    console.error("Erreur POST whitelist:", error)

    if (error instanceof Error && error.message === "Serveur déjà dans la whitelist") {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { gameId } = await request.json()

    if (!gameId) {
      return NextResponse.json({ error: "Game ID requis" }, { status: 400 })
    }

    console.log("Tentative de suppression du serveur:", gameId)

    const servers = WhitelistStorage.remove(gameId)

    return NextResponse.json({
      success: true,
      message: "Serveur retiré de la whitelist",
      servers: servers,
    })
  } catch (error) {
    console.error("Erreur DELETE whitelist:", error)

    if (error instanceof Error && error.message === "Serveur non trouvé") {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
