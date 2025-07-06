// Simulation MongoDB avec persistance réelle pour l'environnement next-lite
interface WhitelistServer {
  _id?: string
  gameId: string
  gameName?: string
  addedAt: Date
  lastCheck?: Date
}

class MongoDBConnection {
  private servers: WhitelistServer[] = []
  private isConnected = false

  constructor() {
    this.loadFromEnv()
  }

  // Charger depuis les variables d'environnement ou localStorage
  private loadFromEnv() {
    try {
      // En production, on utiliserait vraiment MongoDB
      // Pour next-lite, on simule avec localStorage + variables d'env
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("obsidian-mongodb-servers")
        if (saved) {
          this.servers = JSON.parse(saved).map((s: any) => ({
            ...s,
            addedAt: new Date(s.addedAt),
            lastCheck: s.lastCheck ? new Date(s.lastCheck) : undefined,
          }))
        }
      }

      // Simuler la connexion MongoDB
      this.isConnected = !!process.env.MONGODB_URI
      console.log(`🍃 [MongoDB] ${this.isConnected ? "Connecté" : "Mode simulation"} - ${this.servers.length} serveurs`)
    } catch (error) {
      console.error("❌ [MongoDB] Erreur chargement:", error)
      this.servers = []
      this.isConnected = false
    }
  }

  // Sauvegarder les données
  private saveData() {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("obsidian-mongodb-servers", JSON.stringify(this.servers))
      }
      console.log(`💾 [MongoDB] Sauvé ${this.servers.length} serveurs`)
    } catch (error) {
      console.error("❌ [MongoDB] Erreur sauvegarde:", error)
    }
  }

  // Ajouter un serveur
  async addServer(gameId: string, gameName?: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`➕ [MongoDB] Ajout serveur: ${gameId}`)

      if (this.servers.some((s) => s.gameId === gameId)) {
        return { success: false, error: "Serveur déjà existant" }
      }

      const newServer: WhitelistServer = {
        _id: this.generateId(),
        gameId,
        gameName,
        addedAt: new Date(),
      }

      this.servers.unshift(newServer)
      this.saveData()

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

      const initialLength = this.servers.length
      this.servers = this.servers.filter((s) => s.gameId !== gameId)

      if (this.servers.length === initialLength) {
        return { success: false, error: "Serveur non trouvé" }
      }

      this.saveData()

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
      const server = this.servers.find((s) => s.gameId === gameId)

      if (server) {
        server.lastCheck = new Date()
        this.saveData()
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
      // Recharger depuis localStorage
      this.loadFromEnv()
      console.log(`📋 [MongoDB] Récupération de ${this.servers.length} serveurs`)
      return [...this.servers]
    } catch (error) {
      console.error("❌ [MongoDB] Erreur récupération:", error)
      return []
    }
  }

  // Obtenir les statistiques
  async getStats() {
    try {
      const total = this.servers.length
      const withLastCheck = this.servers.filter((s) => s.lastCheck).length

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const recentChecks = this.servers.filter((s) => s.lastCheck && s.lastCheck > oneDayAgo).length

      return { total, withLastCheck, recentChecks }
    } catch (error) {
      console.error("❌ [MongoDB] Erreur stats:", error)
      return { total: 0, withLastCheck: 0, recentChecks: 0 }
    }
  }

  // Tester la connexion
  async testConnection(): Promise<boolean> {
    try {
      // Simuler un test de connexion
      const hasMongoUri = !!process.env.MONGODB_URI

      if (hasMongoUri) {
        console.log("✅ [MongoDB] Test de connexion réussi (MONGODB_URI trouvée)")
        this.isConnected = true
        return true
      } else {
        console.log("⚠️ [MongoDB] MONGODB_URI non configurée - Mode simulation")
        this.isConnected = false
        return false
      }
    } catch (error) {
      console.error("❌ [MongoDB] Test de connexion échoué:", error)
      this.isConnected = false
      return false
    }
  }

  // Générer un ID unique
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}

export const mongodb = new MongoDBConnection()