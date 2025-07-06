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
  private fallbackData: WhitelistServer[] = []

  // URI MongoDB avec timeout optimisé
  private readonly MONGODB_URI =
    process.env.MONGODB_URI ||
    "mongodb+srv://hugodubois1462:6TGH1fatWZWr1EWs@obsidiansite.nyg5yqu.mongodb.net/?retryWrites=true&w=majority&appName=ObsidianSite&connectTimeoutMS=5000&serverSelectionTimeoutMS=5000"
  private readonly DB_NAME = "Obsidian Whitelist"
  private readonly COLLECTION_NAME = "servers"

  constructor() {
    this.loadFallbackData()
  }

  // Charger les données de fallback depuis localStorage
  private loadFallbackData() {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("obsidian-mongodb-fallback")
        if (saved) {
          this.fallbackData = JSON.parse(saved).map((s: any) => ({
            ...s,
            addedAt: new Date(s.addedAt),
            lastCheck: s.lastCheck ? new Date(s.lastCheck) : undefined,
          }))
        }
      }

      // Si pas de données de fallback, créer les données par défaut
      if (this.fallbackData.length === 0) {
        this.createFallbackData()
      }
    } catch (error) {
      console.error("❌ [MongoDB] Erreur chargement fallback:", error)
      this.createFallbackData()
    }
  }

  // Créer les données de fallback
  private createFallbackData() {
    const now = new Date()
    this.fallbackData = DEFAULT_SERVERS.map((server, i) => ({
      _id: this.generateId(),
      gameId: server.gameId,
      gameName: server.gameName,
      addedAt: new Date(now.getTime() - i * 60000),
      lastCheck: Math.random() > 0.5 ? new Date(now.getTime() - Math.random() * 86400000) : undefined,
    }))
    this.saveFallbackData()
  }

  // Sauvegarder les données de fallback
  private saveFallbackData() {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("obsidian-mongodb-fallback", JSON.stringify(this.fallbackData))
      }
    } catch (error) {
      console.error("❌ [MongoDB] Erreur sauvegarde fallback:", error)
    }
  }

  // Initialisation avec timeout
  private async initialize(): Promise<boolean> {
    if (this.initialized) return this.isConnected

    try {
      console.log("🍃 [MongoDB] Tentative de connexion Atlas...")

      // Timeout de 8 secondes maximum
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Timeout de connexion")), 8000)
      })

      const connectPromise = this.connectToMongoDB()

      await Promise.race([connectPromise, timeoutPromise])

      this.initialized = true
      return this.isConnected
    } catch (error) {
      console.error("❌ [MongoDB] Connexion échouée, utilisation du mode fallback:", error)
      this.isConnected = false
      this.initialized = true
      return false
    }
  }

  // Connexion MongoDB
  private async connectToMongoDB() {
    this.client = new MongoClient(this.MONGODB_URI, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    })

    await this.client.connect()
    this.db = this.client.db(this.DB_NAME)
    this.collection = this.db.collection<WhitelistServer>(this.COLLECTION_NAME)

    // Test rapide
    await this.collection.findOne({}, { maxTimeMS: 3000 })

    this.isConnected = true
    console.log("✅ [MongoDB] Connexion Atlas établie")

    // Synchroniser avec les données de fallback si nécessaire
    await this.syncWithFallback()
  }

  // Synchroniser avec les données de fallback
  private async syncWithFallback() {
    if (!this.collection) return

    try {
      const count = await this.collection.countDocuments()
      if (count === 0 && this.fallbackData.length > 0) {
        console.log("🔄 [MongoDB] Synchronisation des données fallback vers Atlas...")
        await this.collection.insertMany(this.fallbackData)
        console.log(`✅ [MongoDB] ${this.fallbackData.length} serveurs synchronisés`)
      }
    } catch (error) {
      console.error("❌ [MongoDB] Erreur synchronisation:", error)
    }
  }

  // Ajouter un serveur
  async addServer(gameId: string, gameName?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const connected = await this.initialize()

      const newServer: WhitelistServer = {
        _id: this.generateId(),
        gameId,
        gameName,
        addedAt: new Date(),
      }

      if (connected && this.collection) {
        // Utiliser MongoDB
        await this.collection.insertOne(newServer)
        console.log(`✅ [MongoDB Atlas] Serveur ajouté: ${gameId}`)
      } else {
        // Utiliser fallback
        if (this.fallbackData.some((s) => s.gameId === gameId)) {
          return { success: false, error: "Serveur déjà existant" }
        }
        this.fallbackData.unshift(newServer)
        this.saveFallbackData()
        console.log(`✅ [MongoDB Fallback] Serveur ajouté: ${gameId}`)
      }

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
      const connected = await this.initialize()

      if (connected && this.collection) {
        // Utiliser MongoDB
        const result = await this.collection.deleteOne({ gameId })
        if (result.deletedCount === 0) {
          return { success: false, error: "Serveur non trouvé" }
        }
        console.log(`✅ [MongoDB Atlas] Serveur supprimé: ${gameId}`)
      } else {
        // Utiliser fallback
        const initialLength = this.fallbackData.length
        this.fallbackData = this.fallbackData.filter((s) => s.gameId !== gameId)
        if (this.fallbackData.length === initialLength) {
          return { success: false, error: "Serveur non trouvé" }
        }
        this.saveFallbackData()
        console.log(`✅ [MongoDB Fallback] Serveur supprimé: ${gameId}`)
      }

      return { success: true }
    } catch (error) {
      console.error("❌ [MongoDB] Erreur suppression:", error)
      return { success: false, error: "Erreur lors de la suppression" }
    }
  }

  // Vérifier si un serveur est whitelisté
  async isWhitelisted(gameId: string): Promise<boolean> {
    try {
      const connected = await this.initialize()

      if (connected && this.collection) {
        // Utiliser MongoDB
        const server = await this.collection.findOne({ gameId })
        if (server) {
          await this.collection.updateOne({ gameId }, { $set: { lastCheck: new Date() } })
        }
        const found = !!server
        console.log(`🔍 [MongoDB Atlas] Vérification ${gameId}: ${found ? "AUTORISÉ" : "REFUSÉ"}`)
        return found
      } else {
        // Utiliser fallback
        const server = this.fallbackData.find((s) => s.gameId === gameId)
        if (server) {
          server.lastCheck = new Date()
          this.saveFallbackData()
        }
        const found = !!server
        console.log(`🔍 [MongoDB Fallback] Vérification ${gameId}: ${found ? "AUTORISÉ" : "REFUSÉ"}`)
        return found
      }
    } catch (error) {
      console.error("❌ [MongoDB] Erreur vérification:", error)
      return false
    }
  }

  // Récupérer tous les serveurs
  async getAllServers(): Promise<WhitelistServer[]> {
    try {
      const connected = await this.initialize()

      if (connected && this.collection) {
        // Utiliser MongoDB
        const servers = await this.collection.find({}).sort({ addedAt: -1 }).toArray()
        console.log(`📋 [MongoDB Atlas] Récupération de ${servers.length} serveurs`)
        return servers
      } else {
        // Utiliser fallback
        console.log(`📋 [MongoDB Fallback] Récupération de ${this.fallbackData.length} serveurs`)
        return [...this.fallbackData].sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())
      }
    } catch (error) {
      console.error("❌ [MongoDB] Erreur récupération:", error)
      return this.fallbackData
    }
  }

  // Obtenir les statistiques
  async getStats() {
    try {
      const connected = await this.initialize()
      let servers: WhitelistServer[]

      if (connected && this.collection) {
        servers = await this.collection.find({}).toArray()
      } else {
        servers = this.fallbackData
      }

      const total = servers.length
      const withLastCheck = servers.filter((s) => s.lastCheck).length

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const recentChecks = servers.filter((s) => s.lastCheck && s.lastCheck > oneDayAgo).length

      return { total, withLastCheck, recentChecks }
    } catch (error) {
      console.error("❌ [MongoDB] Erreur stats:", error)
      return { total: 0, withLastCheck: 0, recentChecks: 0 }
    }
  }

  // Tester la connexion
  async testConnection(): Promise<boolean> {
    try {
      return await this.initialize()
    } catch (error) {
      console.error("❌ [MongoDB] Test de connexion échoué:", error)
      return false
    }
  }

  // Réinitialiser avec les données par défaut
  async resetToDefault(): Promise<void> {
    try {
      const connected = await this.initialize()

      if (connected && this.collection) {
        // Utiliser MongoDB
        await this.collection.deleteMany({})
        const serversToInsert = DEFAULT_SERVERS.map((server, i) => ({
          gameId: server.gameId,
          gameName: server.gameName,
          addedAt: new Date(Date.now() - i * 60000),
          lastCheck: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 86400000) : undefined,
        }))
        await this.collection.insertMany(serversToInsert)
        console.log("✅ [MongoDB Atlas] Réinitialisation terminée")
      } else {
        // Utiliser fallback
        this.createFallbackData()
        console.log("✅ [MongoDB Fallback] Réinitialisation terminée")
      }
    } catch (error) {
      console.error("❌ [MongoDB] Erreur réinitialisation:", error)
      throw error
    }
  }

  // Vider la base de données
  async clearAll(): Promise<void> {
    try {
      const connected = await this.initialize()

      if (connected && this.collection) {
        // Utiliser MongoDB
        const result = await this.collection.deleteMany({})
        console.log(`✅ [MongoDB Atlas] ${result.deletedCount} serveurs supprimés`)
      } else {
        // Utiliser fallback
        this.fallbackData = []
        this.saveFallbackData()
        console.log("✅ [MongoDB Fallback] Tous les serveurs supprimés")
      }
    } catch (error) {
      console.error("❌ [MongoDB] Erreur suppression:", error)
      throw error
    }
  }

  // Obtenir les informations de connexion
  getConnectionInfo() {
    return {
      connected: this.isConnected,
      database: this.DB_NAME,
      collection: this.COLLECTION_NAME,
      uri: this.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, "//***:***@"),
      mode: this.isConnected ? "MongoDB Atlas" : "Fallback Local",
    }
  }

  // Générer un ID unique
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
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
}

export const mongodb = new MongoDBConnection()
