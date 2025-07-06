import { NextResponse } from "next/server"
import { mongodb } from "@/lib/mongodb"

export async function POST() {
  try {
    console.log("[API] 🗑️ Suppression de tous les serveurs")

    // Timeout de 10 secondes
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Timeout clear")), 10000)
    })

    const clearPromise = async () => {
      await mongodb.clearAll()
      const servers = await mongodb.getAllServers()
      const stats = await mongodb.getStats()
      return { servers, stats }
    }

    const { servers, stats } = await Promise.race([clearPromise(), timeoutPromise])

    return NextResponse.json({
      success: true,
      message: "Tous les serveurs supprimés",
      servers,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[API] ❌ Erreur clear:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la suppression",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 })
}
