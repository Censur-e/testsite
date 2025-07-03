import { type NextRequest, NextResponse } from "next/server"

// Structure simple pour un serveur
interface Server {
  id: string
  name: string
  status: "online" | "offline"
  lastSeen: string
  playerCount: number
  gameId: string
}

// Stockage en mémoire (remplacez par une base de données en production)
let servers: Server[] = []

// Fonction utilitaire pour nettoyer les serveurs inactifs
function cleanupServers() {
  const now = Date.now()
  const fiveMinutesAgo = now - 5 * 60 * 1000 // 5 minutes

  servers = servers.map((server) => {
    const lastSeenTime = new Date(server.lastSeen).getTime()
    if (lastSeenTime < fiveMinutesAgo && server.status === "online") {
      return { ...server, status: "offline" as const }
    }
    return server
  })
}

// GET - Récupérer tous les serveurs
export async function GET() {
  try {
    cleanupServers()

    const response = {
      success: true,
      servers: servers,
      stats: {
        total: servers.length,
        online: servers.filter((s) => s.status === "online").length,
        offline: servers.filter((s) => s.status === "offline").length,
      },
    }

    console.log("📊 GET /api/servers - Retour:", response.stats)

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ Erreur GET:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}

// POST - Mettre à jour un serveur
export async function POST(request: NextRequest) {
  try {
    console.log("📨 POST /api/servers - Nouvelle requête")

    // Lire le corps de la requête
    const body = await request.json()
    console.log("📋 Données reçues:", body)

    // Validation simple
    if (!body.serverId || !body.serverName) {
      console.log("❌ Données manquantes")
      return NextResponse.json({ success: false, error: "serverId et serverName requis" }, { status: 400 })
    }

    // Créer ou mettre à jour le serveur
    const serverData: Server = {
      id: String(body.serverId),
      name: String(body.serverName),
      status: "online",
      lastSeen: new Date().toISOString(),
      playerCount: Number(body.playerCount) || 0,
      gameId: String(body.gameId) || "",
    }

    // Trouver et mettre à jour ou ajouter
    const existingIndex = servers.findIndex((s) => s.id === serverData.id)
    if (existingIndex >= 0) {
      servers[existingIndex] = serverData
      console.log("✅ Serveur mis à jour:", serverData.name)
    } else {
      servers.push(serverData)
      console.log("✅ Nouveau serveur ajouté:", serverData.name)
    }

    return NextResponse.json({
      success: true,
      message: "Serveur enregistré",
      server: serverData,
    })
  } catch (error) {
    console.error("❌ Erreur POST:", error)
    return NextResponse.json({ success: false, error: "Erreur lors du traitement" }, { status: 500 })
  }
}

// DELETE - Supprimer un serveur
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const serverId = url.searchParams.get("serverId")

    if (!serverId) {
      return NextResponse.json({ success: false, error: "serverId requis" }, { status: 400 })
    }

    const initialLength = servers.length
    servers = servers.filter((s) => s.id !== serverId)

    if (servers.length < initialLength) {
      console.log("🗑️ Serveur supprimé:", serverId)
      return NextResponse.json({ success: true, message: "Serveur supprimé" })
    } else {
      return NextResponse.json({ success: false, error: "Serveur non trouvé" }, { status: 404 })
    }
  } catch (error) {
    console.error("❌ Erreur DELETE:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}