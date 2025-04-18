import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser, getServerById } from "@/lib/server-data"
import { sign } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "obsidian-jwt-secret"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { serverId, username, password } = body

    if (!serverId || !username || !password) {
      return NextResponse.json({ error: "Données incomplètes" }, { status: 400 })
    }

    // Vérifier si le serveur existe
    const server = await getServerById(serverId)

    if (!server) {
      return NextResponse.json({ error: "Serveur non trouvé" }, { status: 404 })
    }

    // Authentifier l'utilisateur
    const isAuthenticated = await authenticateUser(serverId, username, password)

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Authentification échouée" }, { status: 401 })
    }

    // Générer un token JWT
    const token = sign(
      {
        serverId,
        username,
        name: server.name,
      },
      JWT_SECRET,
      { expiresIn: "1h" },
    )

    return NextResponse.json({ token, serverId, username, serverName: server.name })
  } catch (error) {
    console.error("Erreur lors de l'authentification:", error)
    return NextResponse.json({ error: "Erreur lors de l'authentification" }, { status: 500 })
  }
}
