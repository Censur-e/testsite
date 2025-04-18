import { hash, compare } from "bcryptjs"
import clientPromise from "./mongodb"
import type { ObjectId } from "mongodb"

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

// Fonction pour obtenir la collection des serveurs
async function getServersCollection() {
  const client = await clientPromise
  const db = client.db("obsidian")
  return db.collection<ServerData>("servers")
}

// Fonction pour lire les données des serveurs
export async function getServers(): Promise<ServerData[]> {
  try {
    const collection = await getServersCollection()
    const servers = await collection.find({}).toArray()
    return servers
  } catch (error) {
    console.error("Erreur lors de la lecture des données des serveurs:", error)
    return []
  }
}

// Fonction pour ajouter un nouveau serveur
export async function addServer(
  server: Omit<ServerData, "owner" | "_id" | "createdAt" | "updatedAt"> & {
    owner: { username: string; password: string }
  },
): Promise<ServerData> {
  try {
    const collection = await getServersCollection()

    // Vérifier si un serveur avec cet ID existe déjà
    const existingServer = await collection.findOne({ id: server.id })
    if (existingServer) {
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

    const result = await collection.insertOne(newServer)

    return {
      ...newServer,
      _id: result.insertedId,
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout d'un serveur:", error)
    throw error
  }
}

// Fonction pour mettre à jour le webhook d'un serveur
export async function updateServerWebhook(serverId: string, webhookUrl: string): Promise<ServerData> {
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
    throw error
  }
}

// Fonction pour authentifier un utilisateur
export async function authenticateUser(serverId: string, username: string, password: string): Promise<boolean> {
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
    return false
  }
}

// Fonction pour obtenir un serveur par ID
export async function getServerById(serverId: string): Promise<ServerData | null> {
  try {
    const collection = await getServersCollection()
    return await collection.findOne({ id: serverId })
  } catch (error) {
    console.error("Erreur lors de la récupération du serveur:", error)
    return null
  }
}

// Fonction pour supprimer un serveur
export async function deleteServer(serverId: string): Promise<boolean> {
  try {
    const collection = await getServersCollection()
    const result = await collection.deleteOne({ id: serverId })
    return result.deletedCount === 1
  } catch (error) {
    console.error("Erreur lors de la suppression du serveur:", error)
    return false
  }
}

// Constantes pour l'administration
export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin"
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "obsidian-admin"
