import { promises as fs } from "fs"
import path from "path"

interface WhitelistServer {
  gameId: string
  gameName?: string
  addedAt: string
  lastCheck?: string
}

interface StorageData {
  servers: WhitelistServer[]
  lastSaved: string
  version: string
}

class WhitelistStorageClass {
  private servers: WhitelistServer[] = []
  private readonly JSON_FILE_PATH = path.join(process.cwd(), "data", "whitelist.json")
  private readonly VERSION = "1.0"

  constructor() {
    this.loadFromJSON()
  }

  // Créer le dossier data s'il n'existe pas
  private async ensureDataDirectory(): Promise<void> {
    const dataDir = path.dirname(this.JSON_FILE_PATH)
    try {
      await fs.access(dataDir)
    } catch {
      await fs.mkdir(dataDir, { recursive: true })
      console.log("[STORAGE] Dossier data créé")
    }
  }

  // Charger depuis le fichier JSON
  private async loadFromJSON(): Promise<void> {
    try {
      await this.ensureDataDirectory()

      const data = await fs.readFile(this.JSON_FILE_PATH, "utf-8")
      const parsedData: StorageData = JSON.parse(data)

      this.servers = parsedData.servers || []
      console.log(`[STORAGE] Chargé ${this.servers.length} serveurs depuis ${this.JSON_FILE_PATH}`)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        console.log("[STORAGE] Fichier whitelist.json non trouvé, création d'un nouveau")
        this.servers = []
        await this.saveToJSON()
      } else {
        console.error("[STORAGE] Erreur lors du chargement:", error)
        this.servers = []
      }
    }
  }

  // Sauvegarder dans le fichier JSON
  private async saveToJSON(): Promise<void> {
    try {
      await this.ensureDataDirectory()

      const data: StorageData = {
        servers: this.servers,
        lastSaved: new Date().toISOString(),
        version: this.VERSION,
      }

      await fs.writeFile(this.JSON_FILE_PATH, JSON.stringify(data, null, 2), "utf-8")
      console.log(`[STORAGE] ${this.servers.length} serveurs sauvegardés dans ${this.JSON_FILE_PATH}`)
    } catch (error) {
      console.error("[STORAGE] Erreur lors de la sauvegarde:", error)
      throw error
    }
  }

  // Ajouter un serveur
  async addServer(gameId: string, gameName?: string): Promise<{ success: boolean; error?: string }> {
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

    try {
      await this.saveToJSON()
      console.log(`[STORAGE] Serveur ajouté: ${gameId}`)
      this.debug()
      return { success: true }
    } catch (error) {
      // Rollback en cas d'erreur
      this.servers = this.servers.filter((s) => s.gameId !== gameId)
      return { success: false, error: "Erreur lors de la sauvegarde" }
    }
  }

  // Supprimer un serveur
  async removeServer(gameId: string): Promise<{ success: boolean; error?: string }> {
    console.log(`[STORAGE] Tentative de suppression du serveur: ${gameId}`)

    const initialLength = this.servers.length
    const backupServers = [...this.servers]
    this.servers = this.servers.filter((s) => s.gameId !== gameId)

    if (this.servers.length === initialLength) {
      console.log(`[STORAGE] Serveur ${gameId} non trouvé`)
      return { success: false, error: "Serveur non trouvé" }
    }

    try {
      await this.saveToJSON()
      console.log(`[STORAGE] Serveur supprimé: ${gameId}`)
      this.debug()
      return { success: true }
    } catch (error) {
      // Rollback en cas d'erreur
      this.servers = backupServers
      return { success: false, error: "Erreur lors de la sauvegarde" }
    }
  }

  // Vérifier si un serveur est whitelisté
  isWhitelisted(gameId: string): boolean {
    const found = this.servers.some((s) => s.gameId === gameId)
    console.log(`[STORAGE] Vérification ${gameId}: ${found ? "AUTORISÉ" : "REFUSÉ"}`)
    console.log(`[STORAGE] Serveurs disponibles: [${this.servers.map((s) => s.gameId).join(", ")}]`)
    return found
  }

  // Mettre à jour la dernière vérification
  async updateLastCheck(gameId: string): Promise<void> {
    const server = this.servers.find((s) => s.gameId === gameId)
    if (server) {
      server.lastCheck = new Date().toISOString()
      try {
        await this.saveToJSON()
        console.log(`[STORAGE] Dernière vérification mise à jour pour: ${gameId}`)
      } catch (error) {
        console.error(`[STORAGE] Erreur mise à jour lastCheck pour ${gameId}:`, error)
      }
    }
  }

  // Obtenir tous les serveurs
  getAllServers(): WhitelistServer[] {
    console.log(`[STORAGE] Récupération de ${this.servers.length} serveurs`)
    return [...this.servers]
  }

  // Forcer le rechargement depuis le fichier JSON
  async reload(): Promise<void> {
    console.log("[STORAGE] Rechargement forcé des données")
    await this.loadFromJSON()
  }

  // Debug - afficher l'état actuel
  debug(): void {
    console.log(`[STORAGE] === ÉTAT ACTUEL ===`)
    console.log(`[STORAGE] Fichier: ${this.JSON_FILE_PATH}`)
    console.log(`[STORAGE] Nombre de serveurs: ${this.servers.length}`)
    this.servers.forEach((server, index) => {
      console.log(
        `[STORAGE] ${index + 1}. ${server.gameId} (${server.gameName || "Sans nom"}) - Ajouté: ${server.addedAt}`,
      )
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

  // Exporter les données (pour backup)
  exportData(): StorageData {
    return {
      servers: [...this.servers],
      lastSaved: new Date().toISOString(),
      version: this.VERSION,
    }
  }

  // Importer les données (pour restore)
  async importData(data: StorageData): Promise<boolean> {
    try {
      const backupServers = [...this.servers]
      this.servers = data.servers || []

      await this.saveToJSON()
      console.log(`[STORAGE] Importé ${this.servers.length} serveurs`)
      return true
    } catch (error) {
      console.error("[STORAGE] Erreur lors de l'import:", error)
      return false
    }
  }

  // Obtenir le chemin du fichier JSON
  getFilePath(): string {
    return this.JSON_FILE_PATH
  }
}

// Instance singleton
export const WhitelistStorage = new WhitelistStorageClass()