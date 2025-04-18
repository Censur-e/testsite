import { type NextRequest, NextResponse } from "next/server"
import { addServer, getServers, ADMIN_USERNAME, ADMIN_PASSWORD } from "@/lib/server-data"

// Middleware pour vérifier l'authentification de l'administrateur
async function authenticateAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return false
  }

  const base64Credentials = authHeader.split(" ")[1]
  const credentials = Buffer.from(base64Credentials, "base64").toString("ascii")
  const [username, password] = credentials.split(":")

  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}

// GET - Récupérer tous les serveurs (admin uniquement)
export async function GET(request: NextRequest) {
  const isAuthenticated = await authenticateAdmin(request)

  if (!isAuthenticated) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const servers = await getServers()

  // Ne pas renvoyer les hachages de mot de passe
  const safeServers = servers.map((server) => ({
    id: server.id,
    name: server.name,
    webhookUrl: server.webhookUrl,
    owner: {
      username: server.owner.username,
    },
  }))

  return NextResponse.json(safeServers)
}

// POST - Ajouter un nouveau serveur (admin uniquement)
export async function POST(request: NextRequest) {
  const isAuthenticated = await authenticateAdmin(request)

  if (!isAuthenticated) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, name, webhookUrl, ownerUsername, ownerPassword } = body

    if (!id || !name || !webhookUrl || !ownerUsername || !ownerPassword) {
      return NextResponse.json({ error: "Données incomplètes" }, { status: 400 })
    }

    const newServer = await addServer({
      id,
      name,
      webhookUrl,
      owner: {
        username: ownerUsername,
        password: ownerPassword,
      },
    })

    // Ne pas renvoyer le hachage du mot de passe
    const safeServer = {
      id: newServer.id,
      name: newServer.name,
      webhookUrl: newServer.webhookUrl,
      owner: {
        username: newServer.owner.username,
      },
    }

    return NextResponse.json(safeServer, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de l'ajout d'un serveur:", error)
    return NextResponse.json({ error: "Erreur lors de l'ajout du serveur" }, { status: 500 })
  }
}
