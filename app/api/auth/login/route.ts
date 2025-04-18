import { type NextRequest, NextResponse } from "next/server"
import { deleteServer, ADMIN_USERNAME, ADMIN_PASSWORD } from "@/lib/server-data"

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

// DELETE - Supprimer un serveur (admin uniquement)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const isAuthenticated = await authenticateAdmin(request)

  if (!isAuthenticated) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const serverId = params.id

  try {
    const success = await deleteServer(serverId)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Serveur non trouvé" }, { status: 404 })
    }
  } catch (error) {
    console.error("Erreur lors de la suppression du serveur:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression du serveur" }, { status: 500 })
  }
}
