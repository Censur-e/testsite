import { MongoClient, type Db, type Collection } from "mongodb"

interface WhitelistServer {
  _id?: string
  gameId: string
  gameName?: string
  addedAt: Date
  lastCheck?: Date
}

// Données de démonstration par défaut
const DEFAULT_SERVERS: Omit<WhitelistServer, "_id" | "addedAt">[] = [
  {
    gameId: "920587237",
    gameName: "Adopt Me!",
  },
  {
    gameId: "142823291",
    gameName: "Murder Mystery 2",
  },
  {
    gameId: "286090429",
    gameName: "Arsenal",
  },
  {
    gameId: "537413528",
    gameName: "Build A Boat For Treasure",
  },
  {
    gameId: "606849621",
    gameName: "Jailbreak",
  },
  {
    gameId: "189707",
    gameName: "Natural Disaster Survival",
  },
  {
    gameId: "155615604",
    gameName: "Prison Life",
  },
  {
    gameId: "1224212277",
    gameName: "Mad City",
  },
]

class MongoDBConnection {
  private client: MongoClient | null = null
  private db: Db | null = null
  private collection: Collection<WhitelistServer> | null = null
  private isConnected = false
  private initialized = false

  // URI MongoDB fournie par l'utilisateur
  private readonly MONGODB_URI =
    process.env.MONGODB_URI ||
    "mongodb+srv://hugodubois1462:6TGH1fatWZWr1EWs@obsidiansite.nyg5yqu.mongodb.net/?retryWrites=true&w=majority&appName=ObsidianSite"
  private readonly DB_NAME = "Obsidian Whitelist"
  private readonly COLLECTION_NAME = "servers"

  constructor() {
    this.initialize()
  }

  // Initialisation de la connexion MongoDB
  private async initialize() {
    if (this.initialized) return

    try {
      console.log("🍃 [MongoDB] Connexion à la base de données...")
      console.log(`🍃 [MongoDB] Database: ${this.DB_NAME}`)
      console.log(`🍃 [MongoDB] Collection: ${this.COLLECTION_NAME}`)

      // Créer le client MongoDB
      this.client = new MongoClient(this.MONGODB_URI)

      // Se connecter
      await this.client.connect()

      // Sélectionner la base de données
      this.db = this.client.db(this.DB_NAME)

      // Sélectionner la collection
      this.collection = this.db.collection<WhitelistServer>(this.COLLECTION_NAME)

      // Créer un index sur gameId pour des recherches rapides
      await this.collection.createIndex({ gameId: 1 }, { unique: true })

      this.isConnected = true
      this.initialized = true

      console.log("✅ [MongoDB] Connexion établie avec succès")

      // Vérifier si la collection est vide et ajouter les données par défaut
      const count = await this.collection.countDocuments()
      if (count === 0) {
        console.log("🎯 [MongoDB] Collection vide - Ajout des serveurs de démonstration...")
        await this.createDefaultServers()
      } else {
        console.log(`📊 [MongoDB] ${count} serveurs trouvés dans la collection`)
      }
    } catch (error) {
      console.error("❌ [MongoDB] Erreur de connexion:", error)
      this.isConnected = false
      this.initialized = false
      throw error
    }
  }

  // Créer les serveurs par défaut
  private async createDefaultServers() {
    if (!this.collection) return

    try {
      const now = new Date()
      const serversToInsert: WhitelistServer[] = []

      for (let i = 0; i < DEFAULT_SERVERS.length; i++) {
        const serverData = DEFAULT_SERVERS[i]
        const server: WhitelistServer = {
          gameId: serverData.gameId,
          gameName: serverData.gameName,
          addedAt: new Date(now.getTime() - i * 60000), // Échelonner les dates
          lastCheck: Math.random() > 0.5 ? new Date(now.getTime() - Math.random() * 86400000) : undefined,
        }
        serversToInsert.push(server)
      }

      await this.collection.insertMany(serversToInsert)
      console.log(`✅ [MongoDB] ${DEFAULT_SERVERS.length} serveurs de démonstration ajoutés`)
    } catch (error) {
      console.error("❌ [MongoDB] Erreur création données par défaut:", error)
    }
  }

  // Ajouter un serveur
  async addServer(gameId: string, gameName?: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.initialize()
      if (!this.collection) throw new Error("Collection non initialisée")

      console.log(`➕ [MongoDB] Ajout serveur: ${gameId}`)

      const newServer: WhitelistServer = {
        gameId,
        gameName,
        addedAt: new Date(),
      }

      await this.collection.insertOne(newServer)
      console.log(`✅ [MongoDB] Serveur ajouté: ${gameId}`)
      return { success: true }
    } catch (error: any) {
      console.error("❌ [MongoDB] Erreur ajout:", error)

      if (error.code === 11000) {
        return { success: false, error: "Serveur déjà existant" }
      }

      return { success: false, error: "Erreur lors de l'ajout" }
    }
  }

  // Supprimer un serveur
  async removeServer(gameId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.initialize()
      if (!this.collection) throw new Error("Collection non initialisée")

      console.log(`➖ [MongoDB] Suppression serveur: ${gameId}`)

      const result = await this.collection.deleteOne({ gameId })

      if (result.deletedCount === 0) {
        return { success: false, error: "Serveur non trouvé" }
      }

      console.log(`✅ [MongoDB] Serveur supprimé: ${gameId}`)
      return { success: true }
    } catch (error) {
      console.error("❌ [MongoDB] Erreur suppression:", error)
      return { success: false, error: "Erreur lors de la suppression" }
    }
  }

  // Vérifier si un serveur est whitelisté
  async isWhitelisted(gameId: string): Promise<boolean> {
    try {
      await this.initialize()
      if (!this.collection) throw new Error("Collection non initialisée")

      const server = await this.collection.findOne({ gameId })

      if (server) {
        // Mettre à jour la dernière vérification
        await this.collection.updateOne({ gameId }, { $set: { lastCheck: new Date() } })
      }

      const found = !!server
      console.log(`🔍 [MongoDB] Vérification ${gameId}: ${found ? "AUTORISÉ" : "REFUSÉ"}`)
      return found
    } catch (error) {
      console.error("❌ [MongoDB] Erreur vérification:", error)
      return false
    }
  }

  // Récupérer tous les serveurs
  async getAllServers(): Promise<WhitelistServer[]> {
    try {
      await this.initialize()
      if (!this.collection) throw new Error("Collection non initialisée")

      const servers = await this.collection.find({}).sort({ addedAt: -1 }).toArray()

      console.log(`📋 [MongoDB] Récupération de ${servers.length} serveurs`)
      return servers
    } catch (error) {
      console.error("❌ [MongoDB] Erreur récupération:", error)
      return []
    }
  }

  // Obtenir les statistiques
  async getStats() {
    try {
      await this.initialize()
      if (!this.collection) throw new Error("Collection non initialisée")

      const total = await this.collection.countDocuments()
      const withLastCheck = await this.collection.countDocuments({ lastCheck: { $exists: true } })

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const recentChecks = await this.collection.countDocuments({
        lastCheck: { $gte: oneDayAgo },
      })

      return { total, withLastCheck, recentChecks }
    } catch (error) {
      console.error("❌ [MongoDB] Erreur stats:", error)
      return { total: 0, withLastCheck: 0, recentChecks: 0 }
    }
  }

  // Tester la connexion
  async testConnection(): Promise<boolean> {
    try {
      await this.initialize()

      if (!this.client) return false

      // Ping la base de données
      await this.client.db("admin").command({ ping: 1 })

      console.log("✅ [MongoDB] Test de connexion réussi")
      return true
    } catch (error) {
      console.error("❌ [MongoDB] Test de connexion échoué:", error)
      this.isConnected = false
      return false
    }
  }

  // Réinitialiser avec les données par défaut
  async resetToDefault(): Promise<void> {
    try {
      await this.initialize()
      if (!this.collection) throw new Error("Collection non initialisée")

      console.log("🔄 [MongoDB] Réinitialisation avec données par défaut...")

      // Supprimer tous les documents existants
      await this.collection.deleteMany({})

      // Ajouter les serveurs par défaut
      await this.createDefaultServers()

      console.log("✅ [MongoDB] Réinitialisation terminée")
    } catch (error) {
      console.error("❌ [MongoDB] Erreur réinitialisation:", error)
      throw error
    }
  }

  // Vider la base de données
  async clearAll(): Promise<void> {
    try {
      await this.initialize()
      if (!this.collection) throw new Error("Collection non initialisée")

      console.log("🗑️ [MongoDB] Suppression de tous les serveurs...")

      const result = await this.collection.deleteMany({})

      console.log(`✅ [MongoDB] ${result.deletedCount} serveurs supprimés`)
    } catch (error) {
      console.error("❌ [MongoDB] Erreur suppression:", error)
      throw error
    }
  }

  // Fermer la connexion
  async close(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close()
        console.log("🔌 [MongoDB] Connexion fermée")
      }
    } catch (error) {
      console.error("❌ [MongoDB] Erreur fermeture:", error)
    }
  }

  // Obtenir les informations de connexion
  getConnectionInfo() {
    return {
      connected: this.isConnected,
      database: this.DB_NAME,
      collection: this.COLLECTION_NAME,
      uri: this.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, "//***:***@"), // Masquer les credentials
    }
  }
}

export const mongodb = new MongoDBConnection()

// Fermer la connexion lors de l'arrêt de l'application
process.on("SIGINT", async () => {
  await mongodb.close()
  process.exit(0)
})

process.on("SIGTERM", async () => {
  await mongodb.close()
  process.exit(0)
})
