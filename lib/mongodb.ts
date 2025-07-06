import { MongoClient, type Db, type Collection } from "mongodb"

interface WhitelistServer {
  gameId: string
  gameName?: string
  addedAt: Date
  lastCheck?: Date
}

class MongoDB {
  private client: MongoClient | null = null
  private db: Db | null = null

  async connect(): Promise<Db> {
    if (this.db) {
      return this.db
    }

    try {
      const uri = process.env.MONGODB_URI
      if (!uri) {
        throw new Error("MONGODB_URI non définie")
      }

      this.client = new MongoClient(uri)
      await this.client.connect()
      this.db = this.client.db("obsidian")

      console.log("✅ Connecté à MongoDB")
      return this.db
    } catch (error) {
      console.error("❌ Erreur connexion MongoDB:", error)
      throw error
    }
  }

  async getCollection(): Promise<Collection<WhitelistServer>> {
    const db = await this.connect()
    return db.collection<WhitelistServer>("whitelist")
  }

  async addServer(gameId: string, gameName?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const collection = await this.getCollection()

      // Vérifier si existe déjà
      const existing = await collection.findOne({ gameId })
      if (existing) {
        return { success: false, error: "Serveur déjà existant" }
      }

      // Ajouter
      await collection.insertOne({
        gameId,
        gameName,
        addedAt: new Date(),
      })

      console.log(`✅ Serveur ajouté: ${gameId}`)
      return { success: true }
    } catch (error) {
      console.error("❌ Erreur ajout serveur:", error)
      return { success: false, error: "Erreur base de données" }
    }
  }

  async removeServer(gameId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const collection = await this.getCollection()

      const result = await collection.deleteOne({ gameId })

      if (result.deletedCount === 0) {
        return { success: false, error: "Serveur non trouvé" }
      }

      console.log(`✅ Serveur supprimé: ${gameId}`)
      return { success: true }
    } catch (error) {
      console.error("❌ Erreur suppression serveur:", error)
      return { success: false, error: "Erreur base de données" }
    }
  }

  async isWhitelisted(gameId: string): Promise<boolean> {
    try {
      const collection = await this.getCollection()
      const server = await collection.findOne({ gameId })

      // Mettre à jour lastCheck si trouvé
      if (server) {
        await collection.updateOne({ gameId }, { $set: { lastCheck: new Date() } })
      }

      const found = !!server
      console.log(`🔍 Vérification ${gameId}: ${found ? "AUTORISÉ" : "REFUSÉ"}`)
      return found
    } catch (error) {
      console.error("❌ Erreur vérification:", error)
      return false
    }
  }

  async getAllServers(): Promise<WhitelistServer[]> {
    try {
      const collection = await this.getCollection()
      const servers = await collection.find({}).sort({ addedAt: -1 }).toArray()

      console.log(`📋 Récupéré ${servers.length} serveurs`)
      return servers
    } catch (error) {
      console.error("❌ Erreur récupération serveurs:", error)
      return []
    }
  }

  async getStats() {
    try {
      const collection = await this.getCollection()

      const total = await collection.countDocuments()
      const withLastCheck = await collection.countDocuments({ lastCheck: { $exists: true } })

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const recentChecks = await collection.countDocuments({
        lastCheck: { $gte: oneDayAgo },
      })

      return { total, withLastCheck, recentChecks }
    } catch (error) {
      console.error("❌ Erreur stats:", error)
      return { total: 0, withLastCheck: 0, recentChecks: 0 }
    }
  }
}

export const mongodb = new MongoDB()
