import * as fs from "fs"
import * as path from "path"
import * as bcryptjs from "bcryptjs"

// Types
export interface ServerData {
  id: string
  name: string
  webhookUrl: string
  owner: {
    username: string
    passwordHash: string
  }
  createdAt: string
  updatedAt: string
}

// Configuration
export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin"
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "obsidian-admin"

// Fonction pour obtenir le chemin du fichier de données
function getDataFilePath(): string {
  const isProduction = process.env.NODE_ENV === "production"
  const baseDir = isProduction ? "/tmp" : path.join(process.cwd(), "data")

  // Créer le répertoire s'il n'existe pas
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true })
  }

  return path.join(baseDir, "servers.json")
}

// Fonction pour lire les données des serveurs
export async function getServers(): Promise<ServerData[]> {
  try {
    const filePath = getDataFilePath()

    if (!fs.existsSync(filePath)) {
      return []
    }

    const data = fs.readFileSync(filePath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Erreur lors de la lecture des données des serveurs:", error)
    return []
  }
}

// Fonction pour obtenir un serveur par son ID
export async function getServerById(id: string): Promise<ServerData | null> {
  try {
    const servers = await getServers()
    return servers.find((server) => server.id === id) || null
  } catch (error) {
    console.error("Erreur lors de la récupération du serveur:", error)
    return null
  }
}

// Fonction pour sauvegarder les données des serveurs
export async function saveServers(servers: ServerData[]): Promise<void> {
  try {
    const filePath = getDataFilePath()
    fs.writeFileSync(filePath, JSON.stringify(servers, null, 2), "utf8")
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des données des serveurs:", error)
    throw error
  }
}

// Fonction pour ajouter un nouveau serveur
export async function addServer(server: Omit<ServerData, "createdAt" | "updatedAt">): Promise<ServerData> {
  try {
    const servers = await getServers()

    // Vérifier si un serveur avec le même ID existe déjà
    if (servers.some((s) => s.id === server.id)) {
      throw new Error("Un serveur avec cet ID existe déjà")
    }

    // Hacher le mot de passe
    const passwordHash = await bcryptjs.hash(server.owner.passwordHash, 10)

    const now = new Date().toISOString()
    const newServer: ServerData = {
      ...server,
      owner: {
        ...server.owner,
        passwordHash,
      },
      createdAt: now,
      updatedAt: now,
    }

    servers.push(newServer)
    await saveServers(servers)

    return newServer
  } catch (error) {
    console.error("Erreur lors de l'ajout du serveur:", error)
    throw error
  }
}

// Fonction pour mettre à jour un serveur
export async function updateServer(id: string, updates: Partial<ServerData>): Promise<ServerData | null> {
  try {
    const servers = await getServers()
    const index = servers.findIndex((server) => server.id === id)

    if (index === -1) {
      return null
    }

    // Mettre à jour le serveur
    const updatedServer = {
      ...servers[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    // Conserver le mot de passe haché si non modifié
    if (updates.owner && updates.owner.passwordHash) {
      updatedServer.owner.passwordHash = await bcryptjs.hash(updates.owner.passwordHash, 10)
    }

    servers[index] = updatedServer
    await saveServers(servers)

    return updatedServer
  } catch (error) {
    console.error("Erreur lors de la mise à jour du serveur:", error)
    throw error
  }
}

// Fonction pour supprimer un serveur
export async function deleteServer(id: string): Promise<boolean> {
  try {
    const servers = await getServers()
    const filteredServers = servers.filter((server) => server.id !== id)

    if (filteredServers.length === servers.length) {
      return false
    }

    await saveServers(filteredServers)
    return true
  } catch (error) {
    console.error("Erreur lors de la suppression du serveur:", error)
    throw error
  }
}

// Fonction pour authentifier un utilisateur
export async function authenticateUser(serverId: string, username: string, password: string): Promise<boolean> {
  try {
    const server = await getServerById(serverId)

    if (!server || server.owner.username !== username) {
      return false
    }

    // Vérifier le mot de passe
    return await bcryptjs.compare(password, server.owner.passwordHash)
  } catch (error) {
    console.error("Erreur lors de l'authentification:", error)
    return false
  }
}

// Fonction pour mettre à jour le webhook d'un serveur
export async function updateServerWebhook(id: string, webhookUrl: string): Promise<ServerData | null> {
  return updateServer(id, { webhookUrl })
}