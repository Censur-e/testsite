import { type NextRequest, NextResponse } from "next/server"
import { getProductCount, updateProductCount } from "@/lib/product-count"

// GET - Récupérer le compteur de produits
export async function GET() {
  try {
    const productCount = getProductCount()
    console.log("API GET - Données du compteur:", productCount)
    return new NextResponse(JSON.stringify(productCount), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Erreur lors de la récupération du compteur:", error)
    return new NextResponse(JSON.stringify({ error: "Erreur serveur" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

// POST - Mettre à jour le compteur de produits
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new NextResponse(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const body = await request.json()
    const { total, remaining } = body
    console.log("API POST - Données reçues:", { total, remaining })

    // Validation des données
    if (total === undefined && remaining === undefined) {
      return new NextResponse(JSON.stringify({ error: "Aucune donnée à mettre à jour" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Convertir en nombres pour s'assurer que ce sont des valeurs numériques
    const updateData: any = {}
    if (total !== undefined) updateData.total = Number(total)
    if (remaining !== undefined) updateData.remaining = Number(remaining)

    // Mettre à jour le compteur
    const updatedData = updateProductCount(updateData)
    console.log("API POST - Données mises à jour:", updatedData)

    return new NextResponse(JSON.stringify(updatedData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour du compteur:", error)
    return new NextResponse(
      JSON.stringify({ error: "Erreur serveur", details: error instanceof Error ? error.message : "Erreur inconnue" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}

