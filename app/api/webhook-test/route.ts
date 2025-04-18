import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { webhookUrl, serverId, serverName } = body

    if (!webhookUrl) {
      return NextResponse.json({ error: "URL du webhook manquante" }, { status: 400 })
    }

    // Créer un message de test
    const testMessage = {
      embeds: [
        {
          title: "OBSIDIAN - ANTI-CHEAT",
          description:
            "Ceci est un test de webhook\n\n**Serveur:** " +
            (serverName || "Non spécifié") +
            "\n**ID:** " +
            (serverId || "Non spécifié"),
          color: 0x8364e8,
          timestamp: new Date().toISOString(),
          footer: {
            text: "Obsidian Anti-Cheat System - Test",
          },
        },
      ],
    }

    // Envoyer le message de test au webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testMessage),
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Erreur lors de l'envoi du test au webhook" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors du test du webhook:", error)
    return NextResponse.json({ error: "Erreur lors du test du webhook" }, { status: 500 })
  }
}
