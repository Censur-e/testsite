// Système de stockage partagé pour la whitelist
interface ServerEntry {
  gameId: string
  gameName?: string
  addedAt: string
  lastCheck?: string
}

// Stockage en mémoire (remplacer par une base de données en production)
let servers: ServerEntry[] = []

export const WhitelistStorage = {
  // Obtenir tous les serveurs
  getAll(): ServerEntry[] {
    return [...servers]
  },

  // Ajouter un serveur
  add(gameId: string, gameName?: string): ServerEntry[] {
    // Vérifier si existe déjà
    if (servers.some((server) => server.gameId === gameId)) {
      throw new Error("Serveur déjà dans la whitelist")
    }

    const newServer: ServerEntry = {
      gameId,
      gameName,
      addedAt: new Date().toISOString(),
    }

    servers.push(newServer)
    console.log("Serveur ajouté:", newServer)
    console.log("Liste complète:", servers)
    return [...servers]
  },

  // Supprimer un serveur
  remove(gameId: string): ServerEntry[] {
    const initialLength = servers.length
    servers = servers.filter((server) => server.gameId !== gameId)

    if (servers.length === initialLength) {
      throw new Error("Serveur non trouvé")
    }

    console.log("Serveur supprimé:", gameId)
    console.log("Liste complète:", servers)
    return [...servers]
  },

  // Vérifier si un serveur est whitelisté
  isWhitelisted(gameId: string): boolean {
    const isListed = servers.some((server) => server.gameId === gameId)
    console.log(`Vérification whitelist pour ${gameId}:`, isListed)
    console.log(
      "Serveurs dans la liste:",
      servers.map((s) => s.gameId),
    )
    return isListed
  },

  // Mettre à jour la dernière vérification
  updateLastCheck(gameId: string): void {
    const serverIndex = servers.findIndex((server) => server.gameId === gameId)
    if (serverIndex !== -1) {
      servers[serverIndex].lastCheck = new Date().toISOString()
    }
  },

  // Debug: afficher l'état actuel
  debug(): void {
    console.log("=== WHITELIST DEBUG ===")
    console.log("Nombre de serveurs:", servers.length)
    console.log("Serveurs:", servers)
    console.log("======================")
  },
}
