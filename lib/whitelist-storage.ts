interface WhitelistServer {
  gameId: string
  gameName?: string
  addedAt: string
  lastCheck?: string
}

class WhitelistStorageClass {
  private servers: WhitelistServer[] = []

  // Ajouter un serveur
  addServer(gameId: string, gameName?: string): boolean {
    if (this.servers.some(s => s.gameId === gameId)) {
      return false // Déjà existant
    }

    this.servers.push({
      gameId,
      gameName,
      addedAt: new Date().toISOString()
    })

    console.log(`[WHITELIST] Serveur ajouté: ${gameId}`)
    this.debug()
    return true
  }

  // Supprimer un serveur
  removeServer(gameId: string): boolean {
    const initialLength = this.servers.length
    this.servers = this.servers.filter(s => s.gameId !== gameId)
    
    const removed = this.servers.length < initialLength
    if (removed) {
      console.log(`[WHITELIST] Serveur supprimé: ${gameId}`)
      this.debug()
    }
    return removed
  }

  // Vérifier si un serveur est whitelisté
  isWhitelisted(gameId: string): boolean {
    const found = this.servers.some(s => s.gameId === gameId)
    console.log(`[WHITELIST] Vérification ${gameId}: ${found ? 'AUTORISÉ' : 'REFUSÉ'}`)
    return found
  }

  // Mettre à jour la dernière vérification
  updateLastCheck(gameId: string): void {
    const server = this.servers.find(s => s.gameId === gameId)
    if (server) {
      server.lastCheck = new Date().toISOString()
      console.log(`[WHITELIST] Dernière vérification mise à jour pour: ${gameId}`)
    }
  }

  // Obtenir tous les serveurs
  getAllServers(): WhitelistServer[] {
    return [...this.servers]
  }

  // Debug - afficher l'état actuel
  debug(): void {
    console.log(`[WHITELIST] État actuel: ${this.servers.length} serveurs`)
    this.servers.forEach(server => {
      console.log(`  - ${server.gameId} (${server.gameName || 'Sans nom'})`)
    })
  }

  // Obtenir les statistiques
  getStats() {
    return {
      total: this.servers.length,
      withLastCheck: this.servers.filter(s => s.lastCheck).length,
      recentChecks: this.servers.filter(s => {
        if (!s.lastCheck) return false
        const checkTime = new Date(s.lastCheck).getTime()
        const now = Date.now()
        return (now - checkTime) < 24 * 60 * 60 * 1000 // Dernières 24h
      }).length
    }
  }
}

// Instance singleton
export const WhitelistStorage = new WhitelistStorageClass()
