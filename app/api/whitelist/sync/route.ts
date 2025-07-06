import { type NextRequest, NextResponse } from "next/server"
import { mongodb } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    console.log("[API] 🔄 POST /api/whitelist/sync - Synchronisation")

    const clientData = await request.json()
    console.log(`[API] 📊 Données client reçues: ${clientData.servers?.length || 0} serveurs`)

    const synced = await mongodb.syncWithClient(clientData)

    if (synced) {
      console.log("[API] ✅ Synchronisation réussie")
    } else {
      console.log("[API] ℹ️ Aucune synchronisation nécessaire")
    }

    const servers = await mongodb.getAllServers()
    const stats = await mongodb.getStats()

    return NextResponse.json({
      success: true,
      synced,
      servers,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[API] ❌ Erreur sync:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la synchronisation",
      },
      { status: 500 },
    )
  }
}
