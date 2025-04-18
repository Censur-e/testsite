import fs from "fs"
import path from "path"
import { hash, compare } from "bcryptjs"

// Types pour notre système
export interface ServerData {
  id: string
  name: string
  webhookUrl: string
  owner: {
    username: string
    passwordHash: string
  }
  createdAt?: Date
  updatedAt?: Date
}

// Utiliser le répertoire /tmp pour les environnements serverless
const DATA_DIR = process.env.NODE_ENV === "production" ? "/tmp" : path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "servers.json")

// Fonction pour s'assurer que le répertoire de données existe
function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    } catch (error) {
      console.error("Erreur lors de la création du répertoire de données:", error)
      // En cas d'erreur, utiliser /tmp comme fallback
      if (DATA_DIR !== "/tmp") {
        console.log("Utilisation de /tmp comme répertoire de secours")
        return "/tmp"
      }
    }
  }
  return DATA_DIR
}

// Fonction pour lire les données des serveurs
export async function getServers(): Promise<ServerData[]> {
  const dir = ensureDataDirectory()
  const filePath = path.join(dir, "servers.json")

  try {
    if (!fs.existsSync(filePath)) {
      // Si le fichier n'existe pas, créez-le avec un tableau vide
      fs.writeFileSync(filePath, JSON.stringify([]), "utf8")
      return []
    }

    const data = fs.readFileSync(filePath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Erreur lors de la lecture des données des serveurs:", error)
    return []
  }
}

// Fonction pour enregistrer les données des serveurs
export async function saveServers(servers: ServerData[]): Promise<void> {
  const dir = ensureDataDirectory()
  const filePath = path.join(dir, "servers.json")

  try {
    fs.writeFileSync(filePath, JSON.stringify(servers, null, 2), "utf8")
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des données des serveurs:", error)
    throw new Error("Impossible d'enregistrer les données des serveurs")
  }
}

// Fonction pour ajouter un nouveau serveur
export async function addServer(
  server: Omit<ServerData, "owner"> & { owner: { username: string; password: string } },
): Promise<ServerData> {
  const servers = await getServers()

  // Vérifier si un serveur avec cet ID existe déjà
  if (servers.some((s) => s.id === server.id)) {
    throw new Error(`Un serveur avec l'ID ${server.id} existe déjà`)
  }

  // Hacher le mot de passe
  const passwordHash = await hash(server.owner.password, 10)

  const newServer: ServerData = {
    ...server,
    owner: {
      username: server.owner.username,
      passwordHash,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  servers.push(newServer)
  await saveServers(servers)

  return newServer
}

// Fonction pour mettre à jour le webhook d'un serveur
export async function updateServerWebhook(serverId: string, webhookUrl: string): Promise<ServerData> {
  const servers = await getServers()
  const serverIndex = servers.findIndex((s) => s.id === serverId)

  if (serverIndex === -1) {
    throw new Error(`Serveur avec l'ID ${serverId} non trouvé`)
  }

  servers[serverIndex].webhookUrl = webhookUrl
  servers[serverIndex].updatedAt = new Date()
  await saveServers(servers)

  return servers[serverIndex]
}

// Fonction pour authentifier un utilisateur
export async function authenticateUser(serverId: string, username: string, password: string): Promise<boolean> {
  const servers = await getServers()
  const server = servers.find((s) => s.id === serverId)

  if (!server) {
    return false
  }

  if (server.owner.username !== username) {
    return false
  }

  return compare(password, server.owner.passwordHash)
}

// Fonction pour obtenir un serveur par ID
export async function getServerById(serverId: string): Promise<ServerData | null> {
  const servers = await getServers()
  const server = servers.find((s) => s.id === serverId)

  return server || null
}

// Fonction pour supprimer un serveur
export async function deleteServer(serverId: string): Promise<boolean> {
  const servers = await getServers()
  const initialLength = servers.length
  const filteredServers = servers.filter((s) => s.id !== serverId)

  if (filteredServers.length === initialLength) {
    return false
  }

  await saveServers(filteredServers)
  return true
}

// Constantes pour l'administration
export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin"
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "obsidian-admin"
