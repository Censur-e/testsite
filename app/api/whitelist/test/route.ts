import { NextResponse } from "next/server"
import { mongodb } from "@/lib/mongodb"

export async function GET() {
  try {
    console.log("[API] 🧪 Test de connexion MongoDB")

    const isConnected = await mongodb.testConnection()

    if (isConnected) {
      const stats = await mongodb.getStats()

      return NextResponse.json({
        success: true,
        connected: true,
        message: "MongoDB connecté avec succès",
        stats,
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          connected: false,
          message: "Échec de connexion à MongoDB",
          error: "Vérifiez MONGODB_URI",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[API] ❌ Erreur test MongoDB:", error)
    return NextResponse.json(
      {
        success: false,
        connected: false,
        message: "Erreur lors du test",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  // Même logique pour POST si nécessaire
  return GET()
}