import { hash, compare } from "bcryptjs"
import clientPromise from "./mongodb"
import type { ObjectId } from "mongodb"
import { getServersFromLocalStorage, saveServersToLocalStorage } from "./local-storage"

// Types pour notre système
export interface ServerData {
  _id?: ObjectId | string
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

// Fonction pour déterminer s'il faut utiliser le stockage local
function useLocalStorage() {
  return process.env.USE_LOCAL_STORAGE === "true"
}

// Fonction pour obtenir la collection des serveurs
async function getServersCollection() {
  try {
    const client = await clientPromise
    const db = client.db("obsidian")
    return db.collection<ServerData>("servers")
  } catch (error) {
    console.error("Erreur de connexion à MongoDB:", error)
    throw error
  }
}

// Fonction pour lire les données des serveurs
export async function getServers(): Promise<ServerData[]> {
  // Si USE_LOCAL_STORAGE est activé, utiliser le stockage local
  if (useLocalStorage()) {
    console.log("Utilisation du stockage local pour getServers")
    return getServersFromLocalStorage()
  }

  try {
    const collection = await getServersCollection()
    const servers = await collection.find({}).toArray()
    return servers
  } catch (error) {
    console.error("Erreur lors de la lecture des données des serveurs:", error)

    // En cas d'erreur avec MongoDB, utiliser le stockage local comme fallback
    console.log("Fallback vers le stockage local")
    return getServersFromLocalStorage()
  }
}

// Fonction pour ajouter un nouveau serveur
export async function addServer(
  server: Omit<ServerData, "owner" | "_id" | "createdAt" | "updatedAt"> & {
    owner: { username: string; password: string }
  },
): Promise<ServerData> {
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

  // Si USE_LOCAL_STORAGE est activé, utiliser le stockage local
  if (useLocalStorage()) {
    console.log("Utilisation du stockage local pour addServer")
    const servers = await getServersFromLocalStorage()

    // Vérifier si un serveur avec cet ID existe déjà
    if (servers.some((s) => s.id === server.id)) {
      throw new Error(`Un serveur avec l'ID ${server.id} existe déjà`)
    }

    servers.push(newServer)
    await saveServersToLocalStorage(servers)
    return newServer
  }

  try {
    const collection = await getServersCollection()

    // Vérifier si un serveur avec cet ID existe déjà
    const existingServer = await collection.findOne({ id: server.id })
    if (existingServer) {
      throw new Error(`Un serveur avec l'ID ${server.id} existe déjà`)
    }

    const result = await collection.insertOne(newServer)

    return {
      ...newServer,
      _id: result.insertedId,
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout d'un serveur:", error)

    // En cas d'erreur avec MongoDB, utiliser le stockage local comme fallback
    if (!useLocalStorage()) {
      console.log("Fallback vers le stockage local pour addServer")
      const servers = await getServersFromLocalStorage()

      // Vérifier si un serveur avec cet ID existe déjà
      if (servers.some((s) => s.id === server.id)) {
        throw new Error(`Un serveur avec l'ID ${server.id} existe déjà`)
      }

      servers.push(newServer)
      await saveServersToLocalStorage(servers)
      return newServer
    }

    throw error
  }
}

// Fonction pour mettre à jour le webhook d'un serveur
export async function updateServerWebhook(serverId: string, webhookUrl: string): Promise<ServerData> {
  // Si USE_LOCAL_STORAGE est activé, utiliser le stockage local
  if (useLocalStorage()) {
    console.log("Utilisation du stockage local pour updateServerWebhook")
    const servers = await getServersFromLocalStorage()
    const serverIndex = servers.findIndex((s) => s.id === serverId)

    if (serverIndex === -1) {
      throw new Error(`Serveur avec l'ID ${serverId} non trouvé`)
    }

    servers[serverIndex].webhookUrl = webhookUrl
    servers[serverIndex].updatedAt = new Date()
    await saveServersToLocalStorage(servers)

    return servers[serverIndex]
  }

  try {
    const collection = await getServersCollection()

    const result = await collection.findOneAndUpdate(
      { id: serverId },
      {
        $set: {
          webhookUrl,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    if (!result) {
      throw new Error(`Serveur avec l'ID ${serverId} non trouvé`)
    }

    return result
  } catch (error) {
    console.error("Erreur lors de la mise à jour du webhook:", error)

    // En cas d'erreur avec MongoDB, utiliser le stockage local comme fallback
    if (!useLocalStorage()) {
      console.log("Fallback vers le stockage local pour updateServerWebhook")
      const servers = await getServersFromLocalStorage()
      const serverIndex = servers.findIndex((s) => s.id === serverId)

      if (serverIndex === -1) {
        throw new Error(`Serveur avec l'ID ${serverId} non trouvé`)
      }

      servers[serverIndex].webhookUrl = webhookUrl
      servers[serverIndex].updatedAt = new Date()
      await saveServersToLocalStorage(servers)

      return servers[serverIndex]
    }

    throw error
  }
}

// Fonction pour authentifier un utilisateur
export async function authenticateUser(serverId: string, username: string, password: string): Promise<boolean> {
  // Si USE_LOCAL_STORAGE est activé, utiliser le stockage local
  if (useLocalStorage()) {
    console.log("Utilisation du stockage local pour authenticateUser")
    const servers = await getServersFromLocalStorage()
    const server = servers.find((s) => s.id === serverId)

    if (!server) {
      return false
    }

    if (server.owner.username !== username) {
      return false
    }

    return compare(password, server.owner.passwordHash)
  }

  try {
    const collection = await getServersCollection()
    const server = await collection.findOne({ id: serverId })

    if (!server) {
      return false
    }

    if (server.owner.username !== username) {
      return false
    }

    return compare(password, server.owner.passwordHash)
  } catch (error) {
    console.error("Erreur lors de l'authentification:", error)

    // En cas d'erreur avec MongoDB, utiliser le stockage local comme fallback
    if (!useLocalStorage()) {
      console.log("Fallback vers le stockage local pour authenticateUser")
      const servers = await getServersFromLocalStorage()
      const server = servers.find((s) => s.id === serverId)

      if (!server) {
        return false
      }

      if (server.owner.username !== username) {
        return false
      }

      return compare(password, server.owner.passwordHash)
    }

    return false
  }
}

// Fonction pour obtenir un serveur par ID
export async function getServerById(serverId: string): Promise<ServerData | null> {
  // Si USE_LOCAL_STORAGE est activé, utiliser le stockage local
  if (useLocalStorage()) {
    console.log("Utilisation du stockage local pour getServerById")
    const servers = await getServersFromLocalStorage()
    return servers.find((s) => s.id === serverId) || null
  }

  try {
    const collection = await getServersCollection()
    return await collection.findOne({ id: serverId })
  } catch (error) {
    console.error("Erreur lors de la récupération du serveur:", error)

    // En cas d'erreur avec MongoDB, utiliser le stockage local comme fallback
    if (!useLocalStorage()) {
      console.log("Fallback vers le stockage local pour getServerById")
      const servers = await getServersFromLocalStorage()
      return servers.find((s) => s.id === serverId) || null
    }

    return null
  }
}

// Fonction pour supprimer un serveur
export async function deleteServer(serverId: string): Promise<boolean> {
  // Si USE_LOCAL_STORAGE est activé, utiliser le stockage local
  if (useLocalStorage()) {
    console.log("Utilisation du stockage local pour deleteServer")
    const servers = await getServersFromLocalStorage()
    const initialLength = servers.length
    const filteredServers = servers.filter((s) => s.id !== serverId)

    if (filteredServers.length === initialLength) {
      return false
    }

    await saveServersToLocalStorage(filteredServers)
    return true
  }

  try {
    const collection = await getServersCollection()
    const result = await collection.deleteOne({ id: serverId })
    return result.deletedCount === 1
  } catch (error) {
    console.error("Erreur lors de la suppression du serveur:", error)

    // En cas d'erreur avec MongoDB, utiliser le stockage local comme fallback
    if (!useLocalStorage()) {
      console.log("Fallback vers le stockage local pour deleteServer")
      const servers = await getServersFromLocalStorage()
      const initialLength = servers.length
      const filteredServers = servers.filter((s) => s.id !== serverId)

      if (filteredServers.length === initialLength) {
        return false
      }

      await saveServersToLocalStorage(filteredServers)
      return true
    }

    return false
  }
}

// Constantes pour l'administration
export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin"
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "obsidian-admin"
