interface WhitelistServer {
  gameId: string
  gameName?: string
  addedAt: string
  lastCheck?: string
}

class WhitelistStorageClass {
  private servers: WhitelistServer[] = []

  // Ajouter un serveur
  addServer(gameId: string, gameName?: string): { success: boolean; error?: string } {
    console.log(`[STORAGE] Tentative d'ajout du serveur: ${gameId}`)
    
    if (this.servers.some((s) => s.gameId === gameId)) {
      console.log(`[STORAGE] Serveur ${gameId} déjà existant`)
      return { success: false, error: "Serveur déjà existant" }
    }

    const newServer: WhitelistServer = {
      gameId,
      gameName,
      addedAt: new Date().toISOString(),
    }

    this.servers.push(newServer)
    console.log(`[STORAGE] Serveur ajouté: ${gameId}`)
    this.debug()
    return { success: true }
  }

  // Supprimer un serveur
  removeServer(gameId: string): { success: boolean; error?: string } {
    console.log(`[STORAGE] Tentative de suppression du serveur: ${gameId}`)
    
    const initialLength = this.servers.length
    this.servers = this.servers.filter((s) => s.gameId !== gameId)

    if (this.servers.length === initialLength) {
      console.log(`[STORAGE] Serveur ${gameId} non trouvé`)
      return { success: false, error: "Serveur non trouvé" }
    }

    console.log(`[STORAGE] Serveur supprimé: ${gameId}`)
    this.debug()
    return { success: true }
  }

  // Vérifier si un serveur est whitelisté
  isWhitelisted(gameId: string): boolean {
    const found = this.servers.some((s) => s.gameId === gameId)
    console.log(`[STORAGE] Vérification ${gameId}: ${found ? "AUTORISÉ" : "REFUSÉ"}`)
    console.log(`[STORAGE] Serveurs disponibles: [${this.servers.map(s => s.gameId).join(', ')}]`)
    return found
  }

  // Mettre à jour la dernière vérification
  updateLastCheck(gameId: string): void {
    const server = this.servers.find((s) => s.gameId === gameId)
    if (server) {
      server.lastCheck = new Date().toISOString()
      console.log(`[STORAGE] Dernière vérification mise à jour pour: ${gameId}`)
    }
  }

  // Obtenir tous les serveurs
  getAllServers(): WhitelistServer[] {
    console.log(`[STORAGE] Récupération de ${this.servers.length} serveurs`)
    return [...this.servers]
  }

  // Debug - afficher l'état actuel
  debug(): void {
    console.log(`[STORAGE] === ÉTAT ACTUEL ===`)
    console.log(`[STORAGE] Nombre de serveurs: ${this.servers.length}`)
    this.servers.forEach((server, index) => {
      console.log(`[STORAGE] ${index + 1}. ${server.gameId} (${server.gameName || "Sans nom"}) - Ajouté: ${server.addedAt}`)
    })
    console.log(`[STORAGE] =====================`)
  }

  // Obtenir les statistiques
  getStats() {
    const stats = {
      total: this.servers.length,
      withLastCheck: this.servers.filter((s) => s.lastCheck).length,
      recentChecks: this.servers.filter((s) => {
        if (!s.lastCheck) return false
        const checkTime = new Date(s.lastCheck).getTime()
        const now = Date.now()
        return now - checkTime < 24 * 60 * 60 * 1000 // Dernières 24h
      }).length,
    }
    
    console.log(`[STORAGE] Statistiques:`, stats)
    return stats
  }
}

// Instance singleton
export const WhitelistStorage = new WhitelistStorageClass()