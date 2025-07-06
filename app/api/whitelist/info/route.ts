import { NextResponse } from "next/server"
import { mongodb } from "@/lib/mongodb"

export async function GET() {
  try {
    console.log("[API] 📊 Informations de connexion MongoDB")

    const connectionInfo = mongodb.getConnectionInfo()
    const stats = await mongodb.getStats()

    return NextResponse.json({
      success: true,
      connection: connectionInfo,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[API] ❌ Erreur info:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération des informations",
      },
      { status: 500 },
    )
  }
}
