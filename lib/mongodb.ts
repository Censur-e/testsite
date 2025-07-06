// Simulation MongoDB avec persistance réelle
interface WhitelistServer {
  _id?: string
  gameId: string
  gameName?: string
  addedAt: Date
  lastCheck?: Date
}

class MongoDBSimulator {
  private servers: WhitelistServer[] = []

  constructor() {
    this.loadData()
  }

  // Charger les données depuis localStorage
  private loadData() {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("obsidian-servers")
        if (saved) {
          this.servers = JSON.parse(saved)
          console.log(`💾 [MongoDB] Chargé ${this.servers.length} serveurs depuis localStorage`)
        }
      }
    } catch (error) {
      console.error("❌ [MongoDB] Erreur chargement:", error)
      this.servers = []
    }
  }

  // Sauvegarder les données
  private saveData() {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("obsidian-servers", JSON.stringify(this.servers))
        console.log(`💾 [MongoDB] Sauvé ${this.servers.length} serveurs dans localStorage`)
      }
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

      this.servers.unshift(newServer) // Ajouter au début
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
      // Recharger depuis localStorage à chaque fois
      this.loadData()
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
      const recentChecks = this.servers.filter((s) => s.lastCheck && new Date(s.lastCheck) > oneDayAgo).length

      return { total, withLastCheck, recentChecks }
    } catch (error) {
      console.error("❌ [MongoDB] Erreur stats:", error)
      return { total: 0, withLastCheck: 0, recentChecks: 0 }
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
