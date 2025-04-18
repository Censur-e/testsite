import { type NextRequest, NextResponse } from "next/server"

// Clé secrète pour vérifier l'authenticité de la requête
// Dans un environnement de production, utilisez une variable d'environnement
const SECRET_KEY = "obsidian-roblox-secret"

export async function POST(request: NextRequest) {
  try {
    // Vérifier que la requête a un corps
    const body = await request.json()

    // Vérifier l'authentification et le contenu
    if (!body || !body.key || body.key !== SECRET_KEY) {
      console.log("Authentification échouée ou contenu invalide")
      return NextResponse.json(
        { success: false, message: "Authentification échouée ou contenu invalide" },
        { status: 401 },
      )
    }

    // Vérifier si le webhook Discord est configuré
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL
    if (!webhookUrl) {
      console.error("URL du webhook Discord non configurée")
      return NextResponse.json({ success: false, message: "Configuration du webhook manquante" }, { status: 500 })
    }

    // Préparer les données pour le webhook Discord
    const gameId = body.gameId || "Non spécifié"
    const playerName = body.playerName || "Joueur inconnu"
    const action = body.action || "Action non spécifiée"
    const timestamp = new Date().toISOString()

    // Créer le message pour Discord avec le format spécifié
    const webhookData = {
      embeds: [
        {
          title: "OBSIDIAN - ANTI-CHEAT",
          description: `Nouveau cheateur detecté\n\n**Jeu:** ${gameId}\n**Joueur:** ${playerName}\n**Action:** ${action}`,
          color: 0x8364e8, // Couleur obsidian
          fields: [
            {
              name: "Détails",
              value: body.additionalData ? JSON.stringify(body.additionalData, null, 2) : "Aucun détail supplémentaire",
            },
          ],
          timestamp: timestamp,
          footer: {
            text: "Obsidian Anti-Cheat System",
          },
        },
      ],
    }

    // Envoyer la notification au webhook Discord
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookData),
    })

    if (!response.ok) {
      console.error("Échec de l'envoi au webhook Discord:", await response.text())
      return NextResponse.json({ success: false, message: "Échec de l'envoi au webhook" }, { status: 500 })
    }

    // Réponse réussie
    return NextResponse.json({ success: true, message: "Notification envoyée avec succès" }, { status: 200 })
  } catch (error) {
    console.error("Erreur lors du traitement de la requête:", error)
    return NextResponse.json({ success: false, message: "Erreur interne du serveur" }, { status: 500 })
  }
}
