import { MongoClient, Db, Collection } from 'mongodb'

interface WhitelistServer {
  _id?: string
  gameId: string
  gameName?: string
  addedAt: Date
  lastCheck?: Date
}

class MongoDBConnection {
  private client: MongoClient | null = null
  private db: Db | null = null
  private collection: Collection<WhitelistServer> | null = null
  private isConnected = false

  constructor() {
    this.connect()
  }

  // Connexion à MongoDB
  private async connect() {
    try {
      if (!process.env.MONGODB_URI) {
        console.error("❌ [MongoDB] MONGODB_URI non définie")
        return
      }

      console.log("🔄 [MongoDB] Connexion en cours...")
      
      this.client = new MongoClient(process.env.MONGODB_URI)
      await this.client.connect()
      
      this.db = this.client.db('obsidian')
      this.collection = this.db.collection<WhitelistServer>('whitelist')
      
      // Créer un index sur gameId pour éviter les doublons
      await this.collection.createIndex({ gameId: 1 }, { unique: true })
      
      this.isConnected = true
      console.log("✅ [MongoDB] Connecté avec succès")
      
    } catch (error) {
      console.error("❌ [MongoDB] Erreur de connexion:", error)
      this.isConnected = false
    }
  }

  // Vérifier la connexion
  private async ensureConnection() {
    if (!this.isConnected || !this.collection) {
      await this.connect()
    }
    return this.isConnected && this.collection
  }

  // Ajouter un serveur
  async addServer(gameId: string, gameName?: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`➕ [MongoDB] Ajout serveur: ${gameId}`)

      if (!(await this.ensureConnection())) {
        return { success: false, error: "Erreur de connexion MongoDB" }
      }

      const newServer: WhitelistServer = {
        gameId,
        gameName,
        addedAt: new Date(),
      }

      await this.collection!.insertOne(newServer)
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
      console.log(`➖ [MongoDB] Suppression serveur: ${gameId}`)

      if (!(await this.ensureConnection())) {
        return { success: false, error: "Erreur de connexion MongoDB" }
      }

      const result = await this.collection!.deleteOne({ gameId })

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
      if (!(await this.ensureConnection())) {
        console.error("❌ [MongoDB] Pas de connexion pour vérification")
        return false
      }

      const server = await this.collection!.findOne({ gameId })

      if (server) {
        // Mettre à jour lastCheck
        await this.collection!.updateOne(
          { gameId },
          { $set: { lastCheck: new Date() } }
        )
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
      if (!(await this.ensureConnection())) {
        console.error("❌ [MongoDB] Pas de connexion pour récupération")
        return []
      }

      const servers = await this.collection!
        .find({})
        .sort({ addedAt: -1 })
        .toArray()

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
      if (!(await this.ensureConnection())) {
        return { total: 0, withLastCheck: 0, recentChecks: 0 }
      }

      const total = await this.collection!.countDocuments({})
      const withLastCheck = await this.collection!.countDocuments({ lastCheck: { $exists: true } })

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const recentChecks = await this.collection!.countDocuments({
        lastCheck: { $gte: oneDayAgo }
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
      if (!(await this.ensureConnection())) {
        return false
      }

      await this.db!.admin().ping()
      console.log("✅ [MongoDB] Test de connexion réussi")
      return true

    } catch (error) {
      console.error("❌ [MongoDB] Test de connexion échoué:", error)
      return false
    }
  }

  // Fermer la connexion
  async close() {
    try {
      if (this.client) {
        await this.client.close()
        console.log("🔒 [MongoDB] Connexion fermée")
      }
    } catch (error) {
      console.error("❌ [MongoDB] Erreur fermeture:", error)
    }
  }
}

export const mongodb = new MongoDBConnection()