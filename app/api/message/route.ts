import { type NextRequest, NextResponse } from "next/server"

// Clé secrète pour vérifier l'authenticité de la requête
const SECRET_KEY = "CLE_SECRETE" // À remplacer par votre vraie clé secrète

// Liste de mots interdits (facultatif)
const badWords = ["insulte1", "insulte2", "grosmot"]

export async function POST(request: NextRequest) {
  try {
    // Vérifier que la requête a un corps
    const body = await request.json()
    const { message, auth, playerName, gameId, cheatType } = body

    // Vérification de l'authentification
    if (!auth || auth !== SECRET_KEY) {
      console.log("Authentification échouée")
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    // Vérification du contenu du message
    if (typeof message !== "string") {
      return NextResponse.json({ error: "Message invalide" }, { status: 400 })
    }

    // Filtrage des mots interdits (facultatif)
    const contientMotsInterdits = badWords.some((word) => message.toLowerCase().includes(word))
    if (contientMotsInterdits) {
      return NextResponse.json({ error: "Message refusé (contenu offensant)" }, { status: 400 })
    }

    // Vérifier si le webhook Discord est configuré
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL
    if (!webhookUrl) {
      console.error("URL du webhook Discord non configurée")
      return NextResponse.json({ error: "Configuration du webhook manquante" }, { status: 500 })
    }

    // Créer le message pour Discord avec le format spécifié
    const webhookData = {
      embeds: [
        {
          title: "OBSIDIAN - ANTI-CHEAT",
          description: `Nouveau cheateur detecté\n\n**Jeu:** ${gameId || "Non spécifié"}\n**Joueur:** ${
            playerName || "Joueur inconnu"
          }\n**Type de triche:** ${cheatType || "Non spécifié"}`,
          color: 0x8364e8, // Couleur obsidian
          fields: [
            {
              name: "Message",
              value: message || "Aucun message supplémentaire",
            },
          ],
          timestamp: new Date().toISOString(),
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
      return NextResponse.json({ error: "Erreur d'envoi au webhook" }, { status: 500 })
    }

    // Réponse réussie
    return NextResponse.json({ status: "Message envoyé à Discord" }, { status: 200 })
  } catch (error) {
    console.error("Erreur lors du traitement de la requête:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
