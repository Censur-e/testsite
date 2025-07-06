import { NextResponse } from "next/server"
import { mongodb } from "@/lib/mongodb"

export async function POST() {
  try {
    console.log("[API] 🔄 Réinitialisation des données par défaut")

    // Timeout de 10 secondes
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Timeout reset")), 10000)
    })

    const resetPromise = async () => {
      await mongodb.resetToDefault()
      const servers = await mongodb.getAllServers()
      const stats = await mongodb.getStats()
      return { servers, stats }
    }

    const { servers, stats } = await Promise.race([resetPromise(), timeoutPromise])

    return NextResponse.json({
      success: true,
      message: "Données par défaut restaurées",
      servers,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[API] ❌ Erreur reset:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la réinitialisation",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 })
}
