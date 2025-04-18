import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser, updateServerWebhook, getServerById } from "@/lib/server-data"

// PUT - Mettre à jour le webhook d'un serveur
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const serverId = params.id

  try {
    const body = await request.json()
    const { username, password, webhookUrl } = body

    if (!username || !password || !webhookUrl) {
      return NextResponse.json({ error: "Données incomplètes" }, { status: 400 })
    }

    // Authentifier l'utilisateur
    const isAuthenticated = await authenticateUser(serverId, username, password)

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Authentification échouée" }, { status: 401 })
    }

    // Mettre à jour le webhook
    const updatedServer = await updateServerWebhook(serverId, webhookUrl)

    // Ne pas renvoyer le hachage du mot de passe
    const safeServer = {
      id: updatedServer.id,
      name: updatedServer.name,
      webhookUrl: updatedServer.webhookUrl,
      owner: {
        username: updatedServer.owner.username,
      },
    }

    return NextResponse.json(safeServer)
  } catch (error) {
    console.error("Erreur lors de la mise à jour du webhook:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour du webhook" }, { status: 500 })
  }
}

// GET - Obtenir les informations d'un serveur (sans le mot de passe)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const serverId = params.id

  try {
    const server = await getServerById(serverId)

    if (!server) {
      return NextResponse.json({ error: "Serveur non trouvé" }, { status: 404 })
    }

    // Ne pas renvoyer le hachage du mot de passe
    const safeServer = {
      id: server.id,
      name: server.name,
      owner: {
        username: server.owner.username,
      },
    }

    return NextResponse.json(safeServer)
  } catch (error) {
    console.error("Erreur lors de la récupération du serveur:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération du serveur" }, { status: 500 })
  }
}
