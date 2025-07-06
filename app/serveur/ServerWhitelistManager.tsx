"use client"

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
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react"

interface WhitelistServer {
  _id?: string
  gameId: string
  gameName?: string
  addedAt: string
  lastCheck?: string
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
  const [mongoStatus, setMongoStatus] = useState<{
    connected: boolean
    message: string
    loading: boolean
  }>({ connected: false, message: "Vérification...", loading: true })

  // Tester la connexion MongoDB
  const testMongoDB = async () => {
    setMongoStatus({ connected: false, message: "Test en cours...", loading: true })

    try {
      const response = await fetch("/api/whitelist/test")
      const data = await response.json()

      if (data.success && data.connected) {
        setMongoStatus({
          connected: true,
          message: "MongoDB connecté avec succès",
          loading: false,
        })
        if (data.stats) {
          setStats(data.stats)
        }
      } else {
        setMongoStatus({
          connected: false,
          message: data.message || "Échec de connexion",
          loading: false,
        })
      }
    } catch (error) {
      setMongoStatus({
        connected: false,
        message: "Erreur de connexion au serveur",
        loading: false,
      })
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
        console.log(`✅ Chargé ${data.servers?.length || 0} serveurs depuis MongoDB`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Erreur lors du chargement")
      }
    } catch (error) {
      setError("Erreur de connexion au serveur")
    }
  }

  // Ajouter un serveur
  const addServer = async () => {
    if (!newGameId.trim()) {
      setError("Game ID requis")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: newGameId.trim(),
          gameName: newGameName.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setServers(data.servers || [])
        setStats(data.stats || { total: 0, withLastCheck: 0, recentChecks: 0 })
        setNewGameId("")
        setNewGameName("")
        setSuccess(`✅ Serveur ${newGameId.trim()} ajouté à MongoDB !`)
      } else {
        setError(data.error || "Erreur lors de l'ajout")
      }
    } catch (error) {
      setError("Erreur de connexion au serveur")
    }
    setLoading(false)
  }

  // Supprimer un serveur
  const removeServer = async (gameId: string) => {
    if (!confirm("Supprimer ce serveur de MongoDB ?")) return

    try {
      const response = await fetch("/api/whitelist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId }),
      })

      const data = await response.json()

      if (response.ok) {
        setServers(data.servers || [])
        setStats(data.stats || { total: 0, withLastCheck: 0, recentChecks: 0 })
        setSuccess(`✅ Serveur ${gameId} supprimé de MongoDB !`)
      } else {
        setError(data.error || "Erreur lors de la suppression")
      }
    } catch (error) {
      setError("Erreur de connexion au serveur")
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

  // Copier le script Roblox
  const copyScript = () => {
    const script = `-- Script Obsidian Whitelist MongoDB v3.0
local HttpService = game:GetService("HttpService")
local API_URL = "${typeof window !== "undefined" ? window.location.origin : ""}/api/whitelist/check"

local function checkWhitelist()
    local gameId = tostring(game.GameId)
    print("🔍 [OBSIDIAN] Vérification Game ID: " .. gameId)
    print("🍃 [OBSIDIAN] Connexion à MongoDB...")
    
    local success, result = pcall(function()
        return HttpService:RequestAsync({
            Url = API_URL .. "?gameId=" .. gameId,
            Method = "GET"
        })
    end)
    
    if success and result.StatusCode == 200 then
        local data = HttpService:JSONDecode(result.Body)
        if data.whitelisted then
            print("✅ [OBSIDIAN] Serveur autorisé dans MongoDB")
            print("🛡️ [OBSIDIAN] Protection Obsidian ACTIVÉE")
            return true
        else
            print("❌ [OBSIDIAN] Serveur NON AUTORISÉ")
            print("⚠️ [OBSIDIAN] Ajoutez Game ID " .. gameId .. " à MongoDB")
            return false
        end
    else
        print("⚠️ [OBSIDIAN] Erreur connexion MongoDB")
        print("💡 [OBSIDIAN] Vérifiez 'Allow HTTP Requests'")
        return false
    end
end

-- Vérification au démarrage
spawn(function()
    wait(2)
    print("🚀 [OBSIDIAN] Démarrage du système...")
    local authorized = checkWhitelist()
    
    if authorized then
        print("🎯 [OBSIDIAN] Système OPÉRATIONNEL")
        print("🍃 [OBSIDIAN] Données synchronisées avec MongoDB")
        -- ICI: Activez vos protections Obsidian
    else
        print("🔒 [OBSIDIAN] Système en ATTENTE d'autorisation")
        print("📝 [OBSIDIAN] Contactez l'admin pour whitelist")
    end
end)

-- API publique
_G.ObsidianWhitelist = {
    IsAuthorized = checkWhitelist,
    GetGameId = function() return tostring(game.GameId) end,
    GetStatus = function() 
        return checkWhitelist() and "AUTHORIZED" or "UNAUTHORIZED" 
    end
}`

    navigator.clipboard.writeText(script)
    setSuccess("✅ Script MongoDB copié !")
  }

  // Charger au démarrage
  useEffect(() => {
    testMongoDB()
    loadServers()
  }, [])

  // Nettoyer les messages
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
            <p className="text-green-300">{success}</p>
          </CardContent>
        </Card>
      )}

      {/* Statut MongoDB */}
      <Card
        className={`${mongoStatus.connected ? "bg-green-900/50 border-green-700" : "bg-red-900/50 border-red-700"}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {mongoStatus.loading ? (
              <RefreshCw className="h-6 w-6 text-blue-400 animate-spin" />
            ) : mongoStatus.connected ? (
              <CheckCircle className="h-6 w-6 text-green-400" />
            ) : (
              <XCircle className="h-6 w-6 text-red-400" />
            )}
            <div>
              <h3 className={`font-medium ${mongoStatus.connected ? "text-green-300" : "text-red-300"}`}>
                🍃 MongoDB {mongoStatus.connected ? "CONNECTÉ" : "DÉCONNECTÉ"}
              </h3>
              <p className={`text-sm ${mongoStatus.connected ? "text-green-200" : "text-red-200"}`}>
                {mongoStatus.message}
              </p>
            </div>
            <Button
              onClick={testMongoDB}
              size="sm"
              variant="outline"
              className="ml-auto border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Test
            </Button>
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
                <p className="text-slate-400">Serveurs MongoDB</p>
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
            Ajouter un serveur à MongoDB
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
              disabled={loading || !newGameId.trim() || !mongoStatus.connected}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? "Ajout..." : "Ajouter à MongoDB"}
            </Button>
            <Button
              onClick={loadServers}
              variant="outline"
              className="border-blue-600 text-blue-300 hover:bg-blue-600/20 bg-transparent"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recharger
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste serveurs */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="h-5 w-5" />
            Serveurs MongoDB ({servers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {servers.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">Aucun serveur dans MongoDB</p>
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
                      <Badge className="bg-blue-600/20 text-blue-400">MongoDB</Badge>
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
            📋 Script Roblox MongoDB v3.0
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
              🍃 MongoDB: {typeof window !== "undefined" ? window.location.origin : ""}/api/whitelist/check
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Script optimisé pour MongoDB avec logs détaillés et vérification de connexion
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
