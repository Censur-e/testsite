import { NextResponse } from "next/server"
import { WhitelistStorage } from "@/lib/whitelist-storage"

export async function GET() {
  try {
    console.log("[API] GET /api/whitelist/export - Export des données")

    await WhitelistStorage.reload()
    const data = WhitelistStorage.exportData()

    console.log(`[API] Export de ${data.servers.length} serveurs`)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[API] Erreur export:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de l'export",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
