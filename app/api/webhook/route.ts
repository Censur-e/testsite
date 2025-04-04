import { type NextRequest, NextResponse } from "next/server"
import { decrementRemainingCount, getProductCount } from "@/lib/product-count"

// URL du webhook Discord (à remplacer par votre URL réelle)
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "https://discord.com/api/webhooks/your-webhook-url"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, experience } = body

    // Validation des données
    if (!username || !email || !experience) {
      return new NextResponse(JSON.stringify({ error: "Données incomplètes" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Récupérer les données actuelles avant de décrémenter
    const currentData = getProductCount()
    console.log("Données avant décrémentation:", currentData)

    // Décrémenter le compteur de produits restants
    const productData = decrementRemainingCount()
    console.log("Données après décrémentation:", productData)

    // Créer le message pour Discord
    const discordMessage = {
      embeds: [
        {
          title: "Nouvelle demande d'accès à la bêta",
          color: 0x8364e8, // Couleur obsidian
          fields: [
            {
              name: "Nom d'utilisateur",
              value: username,
              inline: true,
            },
            {
              name: "Email",
              value: email,
              inline: true,
            },
            {
              name: "Expérience",
              value: experience,
            },
            {
              name: "Places restantes",
              value: `${productData.remaining}/${productData.total}`,
              inline: true,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    }

    // Envoyer le message au webhook Discord
    try {
      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(discordMessage),
      })

      if (!response.ok) {
        console.error("Erreur lors de l'envoi au webhook Discord:", await response.text())
      }
    } catch (webhookError) {
      console.error("Erreur lors de l'envoi au webhook Discord:", webhookError)
      // On continue même si l'envoi au webhook échoue
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        remaining: productData.remaining,
        total: productData.total,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error("Erreur lors du traitement de la demande:", error)
    return new NextResponse(JSON.stringify({ error: "Erreur serveur" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

