// Simulation MongoDB avec persistance réelle
interface WhitelistServer {
  _id?: string
  gameId: string
  gameName?: string
  addedAt: Date
  lastCheck?: Date
}

interface MongoCollection {
  servers: WhitelistServer[]
  lastSaved: string
}

class MongoDBSimulator {
  private collection: MongoCollection = {
    servers: [],
    lastSaved: new Date().toISOString(),
  }

  constructor() {
    this.loadData()
  }

  // Charger les données depuis localStorage (côté client) ou env (côté serveur)
  private loadData() {
    try {
      // Côté serveur - charger depuis env
      if (typeof window === "undefined") {
        const envData = process.env.MONGODB_URI ? this.loadFromMongoDB() : this.loadFromEnv()
        if (envData) {
          this.collection = envData
          console.log(`🍃 [MongoDB] Chargé ${this.collection.servers.length} serveurs depuis la base`)
        }
      }
      // Côté client - charger depuis localStorage
      else {
        const saved = localStorage.getItem("obsidian-mongodb-data")
        if (saved) {
          this.collection = JSON.parse(saved)
          console.log(`💾 [MongoDB] Chargé ${this.collection.servers.length} serveurs depuis localStorage`)
        }
      }
    } catch (error) {
      console.error("❌ [MongoDB] Erreur chargement:", error)
      this.collection = { servers: [], lastSaved: new Date().toISOString() }
    }
  }

  // Simuler le chargement depuis MongoDB
  private loadFromMongoDB(): MongoCollection | null {
    try {
      // En production, ici on ferait une vraie connexion MongoDB
      // Pour l'instant, on utilise les variables d'environnement
      return this.loadFromEnv()
    } catch (error) {
      console.error("❌ [MongoDB] Erreur connexion:", error)
      return null
    }
  }

  // Charger depuis les variables d'environnement
  private loadFromEnv(): MongoCollection | null {
    try {
      const envData = process.env.WHITELIST_DATA
      if (envData) {
        const parsed = JSON.parse(envData)
        return {
          servers: parsed.servers || [],
          lastSaved: parsed.lastSaved || new Date().toISOString(),
        }
      }
    } catch (error) {
      console.error("❌ [MongoDB] Erreur parsing env:", error)
    }
    return null
  }

  // Sauvegarder les données
  private async saveData() {
    try {
      this.collection.lastSaved = new Date().toISOString()

      // Côté client - sauver dans localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("obsidian-mongodb-data", JSON.stringify(this.collection))
        console.log(`💾 [MongoDB] Sauvé ${this.collection.servers.length} serveurs dans localStorage`)
      }

      // Côté serveur - sauver dans MongoDB (simulé)
      await this.saveToMongoDB()
    } catch (error) {
      console.error("❌ [MongoDB] Erreur sauvegarde:", error)
      throw error
    }
  }

  // Simuler la sauvegarde MongoDB
  private async saveToMongoDB() {
    try {
      // En production, ici on sauvegarderait vraiment dans MongoDB
      console.log(`🍃 [MongoDB] Simulation sauvegarde de ${this.collection.servers.length} serveurs`)

      // Pour l'instant, on log les données pour debug
      console.log("📊 [MongoDB] Données:", JSON.stringify(this.collection, null, 2))

      return true
    } catch (error) {
      console.error("❌ [MongoDB] Erreur sauvegarde MongoDB:", error)
      return false
    }
  }

  // Ajouter un serveur
  async addServer(gameId: string, gameName?: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`➕ [MongoDB] Ajout serveur: ${gameId}`)

      if (this.collection.servers.some((s) => s.gameId === gameId)) {
        return { success: false, error: "Serveur déjà existant" }
      }

      const newServer: WhitelistServer = {
        _id: this.generateId(),
        gameId,
        gameName,
        addedAt: new Date(),
      }

      this.collection.servers.push(newServer)
      await this.saveData()

      console.log(`✅ [MongoDB] Serveur ajouté: ${gameId}`)
      return { success: true }
    } catch (error) {
      console.error("❌ [MongoDB] Erreur ajout:", error)
      return { success: false, error: "Erreur lors de l'ajout" }
    }
  }

  // Supprimer un serveur
  async removeServer(gameId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`➖ [MongoDB] Suppression serveur: ${gameId}`)

      const initialLength = this.collection.servers.length
      this.collection.servers = this.collection.servers.filter((s) => s.gameId !== gameId)

      if (this.collection.servers.length === initialLength) {
        return { success: false, error: "Serveur non trouvé" }
      }

      await this.saveData()

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
      const server = this.collection.servers.find((s) => s.gameId === gameId)

      if (server) {
        server.lastCheck = new Date()
        await this.saveData()
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
      console.log(`📋 [MongoDB] Récupération de ${this.collection.servers.length} serveurs`)
      return [...this.collection.servers].sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    } catch (error) {
      console.error("❌ [MongoDB] Erreur récupération:", error)
      return []
    }
  }

  // Obtenir les statistiques
  async getStats() {
    try {
      const total = this.collection.servers.length
      const withLastCheck = this.collection.servers.filter((s) => s.lastCheck).length

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const recentChecks = this.collection.servers.filter(
        (s) => s.lastCheck && new Date(s.lastCheck) > oneDayAgo,
      ).length

      return { total, withLastCheck, recentChecks }
    } catch (error) {
      console.error("❌ [MongoDB] Erreur stats:", error)
      return { total: 0, withLastCheck: 0, recentChecks: 0 }
    }
  }

  // Synchroniser avec le client
  async syncWithClient(clientData: MongoCollection): Promise<boolean> {
    try {
      // Merger les données client avec les données serveur
      const serverTime = new Date(this.collection.lastSaved).getTime()
      const clientTime = new Date(clientData.lastSaved).getTime()

      if (clientTime > serverTime) {
        console.log("🔄 [MongoDB] Synchronisation depuis le client")
        this.collection = clientData
        await this.saveData()
        return true
      }

      return false
    } catch (error) {
      console.error("❌ [MongoDB] Erreur sync:", error)
      return false
    }
  }

  // Exporter les données pour backup
  exportData(): MongoCollection {
    return { ...this.collection }
  }

  // Importer des données
  async importData(data: MongoCollection): Promise<boolean> {
    try {
      this.collection = data
      await this.saveData()
      console.log(`📥 [MongoDB] Importé ${data.servers.length} serveurs`)
      return true
    } catch (error) {
      console.error("❌ [MongoDB] Erreur import:", error)
      return false
    }
  }

  // Générer un ID unique
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Forcer le rechargement
  async reload(): Promise<void> {
    this.loadData()
  }
}

export const mongodb = new MongoDBSimulator()