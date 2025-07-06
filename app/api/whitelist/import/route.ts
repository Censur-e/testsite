import { type NextRequest, NextResponse } from "next/server"
import { WhitelistStorage } from "@/lib/whitelist-storage"

export async function POST(request: NextRequest) {
  try {
    console.log("[API] POST /api/whitelist/import - Import des données")

    const data = await request.json()
    console.log(`[API] Tentative d'import de ${data.servers?.length || 0} serveurs`)

    const success = await WhitelistStorage.importData(data)

    if (success) {
      const response = {
        success: true,
        message: `${data.servers?.length || 0} serveurs importés avec succès`,
        servers: WhitelistStorage.getAllServers(),
      }

      console.log("[API] Import réussi:", response)
      return NextResponse.json(response)
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Erreur lors de l'import des données",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[API] Erreur import:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de l'import",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
