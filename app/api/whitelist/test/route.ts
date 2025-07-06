import { NextResponse } from "next/server"
import { mongodb } from "@/lib/mongodb"

export async function GET() {
  try {
    console.log("[API] 🧪 Test de connexion MongoDB")

    // Timeout de 8 secondes pour éviter les 504
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Timeout test connexion")), 8000)
    })

    const testPromise = mongodb.testConnection()

    const isConnected = await Promise.race([testPromise, timeoutPromise])

    if (isConnected) {
      const stats = await mongodb.getStats()

      return NextResponse.json({
        success: true,
        connected: true,
        message: "MongoDB Atlas connecté avec succès",
        stats,
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json({
        success: true,
        connected: false,
        message: "Mode fallback activé - Données locales utilisées",
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error("[API] ❌ Erreur test MongoDB:", error)
    return NextResponse.json({
      success: true,
      connected: false,
      message: "Mode fallback activé - Timeout de connexion",
      error: error instanceof Error ? error.message : "Erreur inconnue",
      timestamp: new Date().toISOString(),
    })
  }
}

export async function POST() {
  return GET()
}
