import { type NextRequest, NextResponse } from "next/server"

// Stockage temporaire en mémoire (remplacer par une base de données en production)
let whitelist: Array<{
  id: string
  username?: string
  addedAt: string
}> = []

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      whitelist: whitelist,
      count: whitelist.length,
    })
  } catch (error) {
    console.error("Erreur GET whitelist:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "ID utilisateur requis" }, { status: 400 })
    }

    // Vérifier si l'ID existe déjà
    if (whitelist.some((entry) => entry.id === userId)) {
      return NextResponse.json({ error: "ID déjà dans la whitelist" }, { status: 409 })
    }

    // Ajouter à la whitelist
    const newEntry = {
      id: userId,
      addedAt: new Date().toISOString(),
    }

    whitelist.push(newEntry)

    return NextResponse.json({
      success: true,
      message: "ID ajouté à la whitelist",
      whitelist: whitelist,
    })
  } catch (error) {
    console.error("Erreur POST whitelist:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "ID utilisateur requis" }, { status: 400 })
    }

    // Supprimer de la whitelist
    const initialLength = whitelist.length
    whitelist = whitelist.filter((entry) => entry.id !== userId)

    if (whitelist.length === initialLength) {
      return NextResponse.json({ error: "ID non trouvé dans la whitelist" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "ID retiré de la whitelist",
      whitelist: whitelist,
    })
  } catch (error) {
    console.error("Erreur DELETE whitelist:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
