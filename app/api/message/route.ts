import { type NextRequest, NextResponse } from "next/server"

const SECRET_KEY = "oBsiACdian"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { auth, embeds } = body

    if (!auth || auth !== SECRET_KEY) {
      console.log("Authentification échouée")
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    if (!Array.isArray(embeds) || embeds.length === 0) {
      return NextResponse.json({ error: "Format d'embed invalide" }, { status: 400 })
    }

    for (const embed of embeds) {
      if (!embed || typeof embed !== "object" || typeof embed.description !== "string" || !embed.description.startsWith("Nouveau cheateur detecté (cheh à lui !)")) {
        return NextResponse.json({ error: "La description doit commencer par 'Nouveau cheateur detecté (cheh à lui !)'" }, { status: 400 })
      }
    
      if (embed.title !== "OBSIDIAN - ANTI-CHEAT") {
        return NextResponse.json({ error: "Titre non autorisé" }, { status: 400 })
      }
    }


    const webhookUrl = process.env.DISCORD_WEBHOOK_URL2
    if (!webhookUrl) {
      console.error("Webhook Discord manquant")
      return NextResponse.json({ error: "Configuration du webhook manquante" }, { status: 500 })
    }

    const webhookData = {
      embeds: embeds.map((embed) => ({
        title: embed.title || "Sans titre",
        url: embed.url,
        description: embed.description || "Pas de description.",
        color: 0x8364e8,
        timestamp: new Date().toISOString(),
        footer: {
          text: embed.footer || "Obsidian Anti-Cheat System",
        },
      })),
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookData),
    })

    if (!response.ok) {
      console.error("Échec de l'envoi au webhook Discord:", await response.text())
      return NextResponse.json({ error: "Erreur d'envoi au webhook" }, { status: 500 })
    }

    return NextResponse.json({ status: "Message envoyé à Discord" }, { status: 200 })
  } catch (error) {
    console.error("Erreur lors du traitement de la requête:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
