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

// Stockage en mémoire des serveurs
const servers: Map<string, ServerData> = new Map()

// Fonction pour nettoyer les serveurs inactifs
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

// Fonction pour gérer les erreurs CORS et les headers
function createResponse(data: any, status = 200) {
  const response = NextResponse.json(data, { status })

  // Ajouter les headers CORS pour Roblox
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

  return response
}

// OPTIONS - Gérer les requêtes preflight CORS
export async function OPTIONS() {
  console.log("📋 Requête OPTIONS reçue (preflight CORS)")

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  })
}

// GET - Récupérer la liste des serveurs
export async function GET(request: NextRequest) {
  try {
    console.log("📨 Requête GET reçue")

    cleanupInactiveServers()

    const serverList = Array.from(servers.values()).sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "connected" ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })

    console.log(`✅ Retour de ${serverList.length} serveurs`)

    return createResponse({
      success: true,
      servers: serverList,
      total: serverList.length,
      connected: serverList.filter((s) => s.status === "connected").length,
      disconnected: serverList.filter((s) => s.status === "disconnected").length,
    })
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des serveurs:", error)
    return createResponse({ success: false, error: "Erreur serveur" }, 500)
  }
}

// POST - Mettre à jour l'état d'un serveur
export async function POST(request: NextRequest) {
  try {
    console.log("📨 Requête POST reçue")
    console.log("🔍 URL:", request.url)
    console.log("🔍 Method:", request.method)

    // Vérifier le Content-Type
    const contentType = request.headers.get("content-type")
    console.log("📋 Content-Type:", contentType)

    // Lire le corps de la requête
    let body
    try {
     const rawBody = await request.text()
     console.log("📊 Corps brut reçu:", rawBody)

     if (!rawBody) {
       console.error("❌ Corps de la requête vide")
       return createResponse({
         success: false,
         error: "Corps de la requête vide",
       }, 400)
     }

    body = JSON.parse(rawBody)
    console.log("📊 Corps parsé:", body)
    } catch (parseError) {
      console.error("❌ Erreur de parsing JSON:", parseError)
      return createResponse(
        {
          success: false,
          error: "Corps de la requête JSON invalide",
          details: parseError instanceof Error ? parseError.message : "Erreur inconnue",
        },
        400,
      )
    }

    const { serverId, serverName, status, playerCount, gameId } = body

    // Validation détaillée des données
    const errors: string[] = []

    if (!serverId) {
      errors.push("serverId est requis")
    } else if (typeof serverId !== "string") {
      errors.push("serverId doit être une chaîne de caractères")
    }

    if (!serverName) {
      errors.push("serverName est requis")
    } else if (typeof serverName !== "string") {
      errors.push("serverName doit être une chaîne de caractères")
    }

    if (status && !["connected", "disconnected"].includes(status)) {
      errors.push("status doit être 'connected' ou 'disconnected'")
    }

    if (playerCount !== undefined && (typeof playerCount !== "number" || playerCount < 0)) {
      errors.push("playerCount doit être un nombre positif")
    }

    if (errors.length > 0) {
      console.error("❌ Erreurs de validation:", errors)
      return createResponse(
        {
          success: false,
          error: "Données de requête invalides",
          details: errors,
          received: body,
        },
        400,
      )
    }

    // Créer les données du serveur
    const now = new Date().toISOString()
    const serverData: ServerData = {
      id: serverId,
      name: serverName,
      status: status || "connected",
      lastSeen: now,
      ...(playerCount !== undefined && { playerCount: Number(playerCount) }),
      ...(gameId && { gameId: String(gameId) }),
    }

    // Mettre à jour ou créer le serveur
    servers.set(serverId, serverData)

    console.log(`✅ Serveur mis à jour: ${serverName} (${serverId}) - ${serverData.status}`)
    console.log("📊 Données sauvegardées:", serverData)

    return createResponse({
      success: true,
      message: "Serveur mis à jour avec succès",
      server: serverData,
    })
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour du serveur:", error)
    return createResponse(
      {
        success: false,
        error: "Erreur lors du traitement de la requête",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      500,
    )
  }
}

// PUT - Alias pour POST (certains clients utilisent PUT pour les mises à jour)
export async function PUT(request: NextRequest) {
  console.log("📨 Requête PUT reçue, redirection vers POST")
  return POST(request)
}

// DELETE - Supprimer un serveur
export async function DELETE(request: NextRequest) {
  try {
    console.log("📨 Requête DELETE reçue")

    const { searchParams } = new URL(request.url)
    const serverId = searchParams.get("serverId")

    if (!serverId) {
      return createResponse({ success: false, error: "serverId est requis" }, 400)
    }

    if (servers.has(serverId)) {
      servers.delete(serverId)
      console.log(`🗑️ Serveur supprimé: ${serverId}`)
      return createResponse({
        success: true,
        message: "Serveur supprimé avec succès",
      })
    } else {
      return createResponse({ success: false, error: "Serveur non trouvé" }, 404)
    }
  } catch (error) {
    console.error("❌ Erreur lors de la suppression du serveur:", error)
    return createResponse({ success: false, error: "Erreur serveur" }, 500)
  }
}

// Gérer toutes les autres méthodes non supportées
export async function PATCH() {
  console.log("❌ Méthode PATCH non supportée")
  return createResponse(
    {
      success: false,
      error: "Méthode PATCH non supportée",
      supportedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    },
    405,
  )
}

// Handler par défaut pour les méthodes non définies
export function handler(request: NextRequest) {
  console.log(`❌ Méthode ${request.method} non supportée`)
  return createResponse(
    {
      success: false,
      error: `Méthode ${request.method} non supportée`,
      supportedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    },
    405,
  )
}
