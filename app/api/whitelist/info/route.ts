import { NextResponse } from "next/server"
import { mongodb } from "@/lib/mongodb"

export async function GET() {
  try {
    console.log("[API] 📊 Informations de connexion MongoDB")

    // Timeout de 5 secondes
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Timeout info")), 5000)
    })

    const infoPromise = async () => {
      const connectionInfo = mongodb.getConnectionInfo()
      const stats = await mongodb.getStats()
      return { connectionInfo, stats }
    }

    const { connectionInfo, stats } = await Promise.race([infoPromise(), timeoutPromise])

    return NextResponse.json({
      success: true,
      connection: connectionInfo,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[API] ❌ Erreur info:", error)

    // Retourner les infos de base même en cas d'erreur
    const connectionInfo = mongodb.getConnectionInfo()

    return NextResponse.json({
      success: true,
      connection: {
        ...connectionInfo,
        connected: false,
        mode: "Fallback Local",
      },
      stats: { total: 0, withLastCheck: 0, recentChecks: 0 },
      error: "Timeout - Mode fallback",
      timestamp: new Date().toISOString(),
    })
  }
}

export async function POST() {
  return GET()
}
