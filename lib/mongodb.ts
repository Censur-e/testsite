interface WhitelistServer {
  gameId: string
  gameName?: string
  addedAt: string
  lastCheck?: string
}

class SimpleStorage {
  private servers: WhitelistServer[] = []

  constructor() {
    this.loadFromEnv()
  }

  private loadFromEnv() {
    try {
      // Charger depuis la variable d'environnement si elle existe
      const envData = process.env.WHITELIST_DATA
      if (envData) {
        const parsed = JSON.parse(envData)
        this.servers = parsed.servers || []
        console.log(`✅ Chargé ${this.servers.length} serveurs depuis l'environnement`)
      } else {
        console.log("📝 Démarrage avec liste vide")
        this.servers = []
      }
    } catch (error) {
      console.error("❌ Erreur chargement:", error)
      this.servers = []
    }
  }

  async addServer(gameId: string, gameName?: string): Promise<{ success: boolean; error?: string }> {
    console.log(`➕ Ajout serveur: ${gameId}`)

    if (this.servers.some((s) => s.gameId === gameId)) {
      return { success: false, error: "Serveur déjà existant" }
    }

    this.servers.push({
      gameId,
      gameName,
      addedAt: new Date().toISOString(),
    })

    console.log(`✅ Serveur ajouté: ${gameId}`)
    return { success: true }
  }

  async removeServer(gameId: string): Promise<{ success: boolean; error?: string }> {
    console.log(`➖ Suppression serveur: ${gameId}`)

    const initialLength = this.servers.length
    this.servers = this.servers.filter((s) => s.gameId !== gameId)

    if (this.servers.length === initialLength) {
      return { success: false, error: "Serveur non trouvé" }
    }

    console.log(`✅ Serveur supprimé: ${gameId}`)
    return { success: true }
  }

  async isWhitelisted(gameId: string): Promise<boolean> {
    const server = this.servers.find((s) => s.gameId === gameId)

    if (server) {
      server.lastCheck = new Date().toISOString()
    }

    const found = !!server
    console.log(`🔍 Vérification ${gameId}: ${found ? "AUTORISÉ" : "REFUSÉ"}`)
    return found
  }

  async getAllServers(): Promise<WhitelistServer[]> {
    console.log(`📋 Récupération de ${this.servers.length} serveurs`)
    return [...this.servers]
  }

  async getStats() {
    const total = this.servers.length
    const withLastCheck = this.servers.filter((s) => s.lastCheck).length

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const recentChecks = this.servers.filter((s) => s.lastCheck && s.lastCheck > oneDayAgo).length

    return { total, withLastCheck, recentChecks }
  }
}

export const mongodb = new SimpleStorage()
