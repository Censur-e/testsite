"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Trash2,
  Plus,
  TestTube,
  Server,
  Shield,
  Clock,
  Copy,
  AlertCircle,
  Database,
  FolderSyncIcon as Sync,
  Download,
  Upload,
  Info,
} from "lucide-react"

interface WhitelistServer {
  _id?: string
  gameId: string
  gameName?: string
  addedAt: string
  lastCheck?: string
}

interface MongoCollection {
  servers: WhitelistServer[]
  lastSaved: string
}

export default function ServerWhitelistManager() {
  const [servers, setServers] = useState<WhitelistServer[]>([])
  const [newGameId, setNewGameId] = useState("")
  const [newGameName, setNewGameName] = useState("")
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [stats, setStats] = useState({ total: 0, withLastCheck: 0, recentChecks: 0 })
  const [lastSync, setLastSync] = useState<string | null>(null)

  // Charger depuis localStorage au démarrage
  useEffect(() => {
    const saved = localStorage.getItem("obsidian-mongodb-data")
    if (saved) {
      try {
        const data: MongoCollection = JSON.parse(saved)
        setServers(data.servers || [])
        setLastSync(data.lastSaved)
        console.log(`💾 Chargé ${data.servers.length} serveurs depuis localStorage`)
      } catch (error) {
        console.error("Erreur chargement localStorage:", error)
      }
    }
    loadServers()
  }, [])

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    if (servers.length >= 0) {
      const data: MongoCollection = {
        servers,
        lastSaved: new Date().toISOString(),
      }
      localStorage.setItem("obsidian-mongodb-data", JSON.stringify(data))
      setLastSync(data.lastSaved)
    }
  }, [servers])

  // Synchroniser avec le serveur
  const syncWithServer = async () => {
    try {
      const localData: MongoCollection = {
        servers,
        lastSaved: lastSync || new Date().toISOString(),
      }

      const response = await fetch("/api/whitelist/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(localData),
      })

      if (response.ok) {
        const data = await response.json()
        setServers(data.servers || [])
        setStats(data.stats || { total: 0, withLastCheck: 0, recentChecks: 0 })
        setSuccess(data.synced ? "Synchronisation réussie !" : "Données à jour")
      }
    } catch (error) {
      console.error("Erreur sync:", error)
    }
  }

  // Charger les serveurs
  const loadServers = async () => {
    try {
      setError(null)
      const response = await fetch("/api/whitelist")

      if (response.ok) {
        const data = await response.json()
        setServers(data.servers || [])
        setStats(data.stats || { total: 0, withLastCheck: 0, recentChecks: 0 })
      } else {
        setError("Erreur lors du chargement")
      }
    } catch (error) {
      setError("Erreur de connexion")
    }
  }

  // Ajouter un serveur
  const addServer = async () => {
    if (!newGameId.trim()) {
      setError("Game ID requis")
      return
    }

    // Vérifier si existe déjà localement
    if (servers.some((s) => s.gameId === newGameId.trim())) {
      setError("Serveur déjà existant")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Ajouter localement d'abord
      const newServer: WhitelistServer = {
        _id: Date.now().toString(),
        gameId: newGameId.trim(),
        gameName: newGameName.trim() || undefined,
        addedAt: new Date().toISOString(),
      }

      setServers((prev) => [newServer, ...prev])
      setNewGameId("")
      setNewGameName("")
      setSuccess(`Serveur ${newGameId.trim()} ajouté !`)

      // Puis synchroniser avec le serveur
      setTimeout(syncWithServer, 500)
    } catch (error) {
      setError("Erreur lors de l'ajout")
    }
    setLoading(false)
  }

  // Supprimer un serveur
  const removeServer = async (gameId: string) => {
    if (!confirm("Supprimer ce serveur ?")) return

    try {
      // Supprimer localement d'abord
      setServers((prev) => prev.filter((s) => s.gameId !== gameId))
      setSuccess(`Serveur ${gameId} supprimé !`)

      // Puis synchroniser avec le serveur
      setTimeout(syncWithServer, 500)
    } catch (error) {
      setError("Erreur lors de la suppression")
    }
  }

  // Tester un serveur
  const testServer = async (gameId: string) => {
    try {
      const response = await fetch(`/api/whitelist/check?gameId=${gameId}`)
      const data = await response.json()

      setTestResults((prev) => ({ ...prev, [gameId]: data.whitelisted }))

      setTimeout(() => {
        setTestResults((prev) => {
          const newResults = { ...prev }
          delete newResults[gameId]
          return newResults
        })
      }, 3000)
    } catch (error) {
      setError("Erreur lors du test")
    }
  }

  // Exporter les données
  const exportData = () => {
    try {
      const data: MongoCollection = {
        servers,
        lastSaved: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `obsidian-whitelist-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setSuccess("Données exportées !")
    } catch (error) {
      setError("Erreur lors de l'export")
    }
  }

  // Importer les données
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data: MongoCollection = JSON.parse(e.target?.result as string)
        setServers(data.servers || [])
        setSuccess("Données importées !")
        setTimeout(syncWithServer, 500)
      } catch (error) {
        setError("Fichier JSON invalide")
      }
    }
    reader.readAsText(file)
  }

  // Copier le script Roblox
  const copyScript = () => {
    const script = `-- Script Obsidian Whitelist v2.0
local HttpService = game:GetService("HttpService")
local API_URL = "${typeof window !== "undefined" ? window.location.origin : ""}/api/whitelist/check"

local function checkWhitelist()
    local gameId = tostring(game.GameId)
    print("🔍 [OBSIDIAN] Vérification Game ID: " .. gameId)
    
    local success, result = pcall(function()
        return HttpService:RequestAsync({
            Url = API_URL .. "?gameId=" .. gameId,
            Method = "GET"
        })
    end)
    
    if success and result.StatusCode == 200 then
        local data = HttpService:JSONDecode(result.Body)
        if data.whitelisted then
            print("✅ [OBSIDIAN] Serveur autorisé - Protection activée")
            print("🛡️ [OBSIDIAN] Toutes les fonctionnalités sont disponibles")
            return true
        else
            print("❌ [OBSIDIAN] Serveur non autorisé")
            print("⚠️ [OBSIDIAN] Ajoutez le Game ID " .. gameId .. " à la whitelist")
            return false
        end
    else
        print("⚠️ [OBSIDIAN] Erreur de vérification")
        print("💡 [OBSIDIAN] Vérifiez 'Allow HTTP Requests' dans les paramètres")
        return false
    end
end

-- Vérification au démarrage
spawn(function()
    wait(2)
    local authorized = checkWhitelist()
    
    if authorized then
        print("🎯 [OBSIDIAN] Système opérationnel")
        -- ICI: Activez vos protections Obsidian
    else
        print("🔒 [OBSIDIAN] Système en attente d'autorisation")
    end
end)

-- API publique
_G.ObsidianWhitelist = {
    IsAuthorized = checkWhitelist,
    GetGameId = function() return tostring(game.GameId) end
}`

    navigator.clipboard.writeText(script)
    setSuccess("Script copié !")
  }

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <Card className="bg-red-900/50 border-red-700">
          <CardContent className="p-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-red-300">❌ {error}</p>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="bg-green-900/50 border-green-700">
          <CardContent className="p-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-400" />
            <p className="text-green-300">✅ {success}</p>
          </CardContent>
        </Card>
      )}

      {/* Info Persistance */}
      <Card className="bg-blue-900/50 border-blue-700">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-blue-300 font-medium mb-2">💾 Persistance Garantie</h3>
              <p className="text-blue-200 text-sm mb-2">
                Vos données sont sauvegardées automatiquement dans votre navigateur ET synchronisées avec le serveur.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-blue-300">
                  <Database className="h-4 w-4 inline mr-1" />
                  MongoDB Simulé
                </span>
                <span className="text-blue-300">
                  <Sync className="h-4 w-4 inline mr-1" />
                  Auto-Sync
                </span>
                {lastSync && (
                  <span className="text-blue-400">Dernière sync: {new Date(lastSync).toLocaleTimeString()}</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Server className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-slate-400">Serveurs Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.withLastCheck}</p>
                <p className="text-slate-400">Vérifiés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.recentChecks}</p>
                <p className="text-slate-400">Récents (24h)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ajouter serveur */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Ajouter un serveur
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Game ID (ex: 123456789)"
              value={newGameId}
              onChange={(e) => setNewGameId(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              onKeyPress={(e) => e.key === "Enter" && addServer()}
            />
            <Input
              placeholder="Nom du jeu (optionnel)"
              value={newGameName}
              onChange={(e) => setNewGameName(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              onKeyPress={(e) => e.key === "Enter" && addServer()}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={addServer}
              disabled={loading || !newGameId.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? "Ajout..." : "Ajouter"}
            </Button>
            <Button
              onClick={syncWithServer}
              variant="outline"
              className="border-blue-600 text-blue-300 hover:bg-blue-600/20 bg-transparent"
            >
              <Sync className="h-4 w-4 mr-2" />
              Sync
            </Button>
            <Button
              onClick={exportData}
              variant="outline"
              className="border-green-600 text-green-300 hover:bg-green-600/20 bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <label className="cursor-pointer">
              <Button
                variant="outline"
                className="border-yellow-600 text-yellow-300 hover:bg-yellow-600/20 bg-transparent"
                asChild
              >
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </span>
              </Button>
              <input type="file" accept=".json" onChange={importData} className="hidden" />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Liste serveurs */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Server className="h-5 w-5" />
            Serveurs Whitelistés ({servers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {servers.length === 0 ? (
            <div className="text-center py-8">
              <Server className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">Aucun serveur whitelisté</p>
              <p className="text-slate-500 text-sm">Ajoutez votre premier serveur ci-dessus</p>
            </div>
          ) : (
            <div className="space-y-3">
              {servers.map((server) => (
                <div
                  key={server._id || server.gameId}
                  className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-600/20 text-green-400">{server.gameId}</Badge>
                      {testResults[server.gameId] !== undefined && (
                        <Badge className={testResults[server.gameId] ? "bg-green-600" : "bg-red-600"}>
                          {testResults[server.gameId] ? "✅ OK" : "❌ NOK"}
                        </Badge>
                      )}
                    </div>
                    {server.gameName && <p className="text-white font-medium mt-1">{server.gameName}</p>}
                    <p className="text-slate-400 text-sm">
                      Ajouté: {new Date(server.addedAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => testServer(server.gameId)}
                      size="sm"
                      variant="outline"
                      className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
                    >
                      <TestTube className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => removeServer(server.gameId)}
                      size="sm"
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-600/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Script Roblox */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            📋 Script Roblox v2.0
            <Button
              onClick={copyScript}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copier
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-700/50 p-3 rounded border border-slate-600">
            <p className="text-sm font-mono text-green-400">
              URL: {typeof window !== "undefined" ? window.location.origin : ""}/api/whitelist/check
            </p>
            <p className="text-sm text-slate-400 mt-2">Script amélioré avec logs détaillés et API publique</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
