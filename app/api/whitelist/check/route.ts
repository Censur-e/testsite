import { type NextRequest, NextResponse } from "next/server"

// Import de la whitelist (en production, utiliser une base de données)
const whitelist: Array<{
  id: string
  username?: string
  addedAt: string
}> = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "ID utilisateur requis" }, { status: 400 })
    }

    const isWhitelisted = whitelist.some((entry) => entry.id === userId)

    return NextResponse.json({
      userId: userId,
      whitelisted: isWhitelisted,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erreur vérification whitelist:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "ID utilisateur requis" }, { status: 400 })
    }

    const isWhitelisted = whitelist.some((entry) => entry.id === userId)

    return NextResponse.json({
      userId: userId,
      whitelisted: isWhitelisted,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erreur vérification whitelist:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
