import { type NextRequest, NextResponse } from "next/server"

// Interface pour les données de serveur
interface ServerData {
  id: string
  name: string
  status: "connected" | "disconnected"
  lastSeen: string
  playerCount?: number
  gameId?: string
}

// Stockage en mémoire des serveurs (en production, utilisez une base de données)
const servers: Map<string, ServerData> = new Map()

// Fonction pour nettoyer les serveurs inactifs (plus de 30 secondes)
function cleanupInactiveServers() {
  const now = new Date()
  const thirtySecondsAgo = new Date(now.getTime() - 30000)

  for (const [serverId, server] of servers.entries()) {
    const lastSeen = new Date(server.lastSeen)
    if (lastSeen < thirtySecondsAgo && server.status === "connected") {
      servers.set(serverId, {
        ...server,
        status: "disconnected",
      })
    }
  }
}

// GET - Récupérer la liste des serveurs
export async function GET() {
  try {
    // Nettoyer les serveurs inactifs
    cleanupInactiveServers()

    const serverList = Array.from(servers.values()).sort((a, b) => {
      // Trier par statut (connectés en premier) puis par nom
      if (a.status !== b.status) {
        return a.status === "connected" ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json({
      success: true,
      servers: serverList,
      total: serverList.length,
      connected: serverList.filter((s) => s.status === "connected").length,
      disconnected: serverList.filter((s) => s.status === "disconnected").length,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des serveurs:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}

// POST - Mettre à jour l'état d'un serveur (appelé par les scripts Roblox)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { serverId, serverName, status, playerCount, gameId } = body

    // Validation des données
    if (!serverId || !serverName) {
      return NextResponse.json({ success: false, error: "serverId et serverName sont requis" }, { status: 400 })
    }

    if (status && !["connected", "disconnected"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "status doit être 'connected' ou 'disconnected'" },
        { status: 400 },
      )
    }

    const now = new Date().toISOString()
    const serverData: ServerData = {
      id: serverId,
      name: serverName,
      status: status || "connected",
      lastSeen: now,
      ...(playerCount !== undefined && { playerCount: Number(playerCount) }),
      ...(gameId && { gameId }),
    }

    // Mettre à jour ou créer le serveur
    servers.set(serverId, serverData)

    console.log(`Serveur mis à jour: ${serverName} (${serverId}) - ${serverData.status}`)

    return NextResponse.json({
      success: true,
      message: "Serveur mis à jour avec succès",
      server: serverData,
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour du serveur:", error)
    return NextResponse.json({ success: false, error: "Erreur lors du traitement de la requête" }, { status: 500 })
  }
}

// DELETE - Supprimer un serveur
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serverId = searchParams.get("serverId")

    if (!serverId) {
      return NextResponse.json({ success: false, error: "serverId est requis" }, { status: 400 })
    }

    if (servers.has(serverId)) {
      servers.delete(serverId)
      return NextResponse.json({
        success: true,
        message: "Serveur supprimé avec succès",
      })
    } else {
      return NextResponse.json({ success: false, error: "Serveur non trouvé" }, { status: 404 })
    }
  } catch (error) {
    console.error("Erreur lors de la suppression du serveur:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
