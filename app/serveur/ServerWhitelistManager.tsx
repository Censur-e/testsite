"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, RefreshCw, TestTube, Server, Shield, Clock, Copy, AlertCircle, Download, Upload, Database, Info } from 'lucide-react'

interface WhitelistServer {
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

  // Charger les serveurs depuis le localStorage au démarrage
  useEffect(() => {
    const savedServers = localStorage.getItem("obsidian-whitelist-servers")
    if (savedServers) {
      try {
        const parsed = JSON.parse(savedServers)
        setServers(parsed.servers || [])
        setSuccess("Données chargées depuis le stockage local")
      } catch (error) {
        console.error("Erreur lors du chargement:", error)
      }
    }
  }, [])

  // Sauvegarder dans le localStorage à chaque changement
  useEffect(() => {
    if (servers.length > 0) {
      const data = {
        servers,
        lastSaved: new Date().toISOString(),
        version: "1.0",
      }
      localStorage.setItem("obsidian-whitelist-servers", JSON.stringify(data))
    }
  }, [servers])

  // Charger les serveurs depuis l'API
  const loadServers = async () => {
    try {
      setError(null)
      console.log("Chargement des serveurs...")

      const response = await fetch("/api/whitelist", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Réponse GET:", response.status, response.statusText)

      if (response.ok) {
        const data = await response.json()
        console.log("Données reçues:", data)
        setServers(data.servers || [])
      } else {
        const errorData = await response.text()
        console.error("Erreur API:", response.status, errorData)
        setError(`Erreur ${response.status}: ${errorData}`)
      }
    } catch (error) {
      console.error("Erreur chargement serveurs:", error)
      setError("Erreur de connexion lors du chargement")
    }
  }

  // Ajouter un serveur
  const addServer = async () => {
    if (!newGameId.trim()) {
      setError("Veuillez entrer un Game ID valide")
      return
    }

    // Vérifier si le serveur existe déjà
    if (servers.some((s) => s.gameId === newGameId.trim())) {
      setError("Ce serveur est déjà dans la whitelist")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const newServer: WhitelistServer = {
        gameId: newGameId.trim(),
        gameName: newGameName.trim() || undefined,
        addedAt: new Date().toISOString(),
      }

      // Ajouter au state local
      const updatedServers = [...servers, newServer]
      setServers(updatedServers)

      setNewGameId("")
      setNewGameName("")
      setSuccess(`Serveur ${newGameId.trim()} ajouté avec succès !`)

      console.log("Serveur ajouté localement:", newServer)
    } catch (error) {
      console.error("Erreur ajout serveur:", error)
      setError("Erreur lors de l'ajout du serveur")
    }
    setLoading(false)
  }

  // Supprimer un serveur
  const removeServer = async (gameId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce serveur ?")) return

    try {
      setError(null)
      setSuccess(null)
      console.log("Suppression du serveur:", gameId)

      // Supprimer du state local
      const updatedServers = servers.filter((s) => s.gameId !== gameId)
      setServers(updatedServers)

      setSuccess(`Serveur ${gameId} supprimé avec succès !`)
    } catch (error) {
      console.error("Erreur suppression serveur:", error)
      setError("Erreur lors de la suppression")
    }
  }

  // Tester un serveur
  const testServer = async (gameId: string) => {
    try {
      setError(null)
      console.log("Test du serveur:", gameId)

      // Simuler le test en vérifiant si le serveur est dans la liste
      const isWhitelisted = servers.some((s) => s.gameId === gameId)

      setTestResults((prev) => ({
        ...prev,
        [gameId]: isWhitelisted,
      }))

      setTimeout(() => {
        setTestResults((prev) => {
          const newResults = { ...prev }
          delete newResults[gameId]
          return newResults
        })
      }, 3000)
    } catch (error) {
      console.error("Erreur test serveur:", error)
      setError("Erreur lors du test du serveur")
    }
  }

  // Exporter les données
  const exportData = () => {
    try {
      const data = {
        servers,
        lastSaved: new Date().toISOString(),
        version: "1.0",
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
      setSuccess("Données exportées avec succès !")
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
        const jsonData = JSON.parse(e.target?.result as string)
        setServers(jsonData.servers || [])
        setSuccess("Données importées avec succès !")
      } catch (error) {
        setError("Fichier JSON invalide")
      }
    }
    reader.readAsText(file)
  }

  // Copier les données pour la variable d'environnement
  const copyEnvironmentData = () => {
    const data = {
      servers,
      lastSaved: new Date().toISOString(),
      version: "1.0",
    }

    const envData = JSON.stringify(data)
    navigator.clipboard.writeText(envData)
    setSuccess("Données copiées ! Ajoutez ceci à la variable WHITELIST_DATA")
  }

  // Copier le script Roblox
  const copyScript = () => {
    const script = `-- Script Obsidian - Vérification Whitelist Serveur
-- À placer dans ServerScriptService

local HttpService = game:GetService("HttpService")

-- CONFIGURATION - Modifiez cette URL avec votre domaine
local API_URL = "https://obsidianac-censur-es-projects.vercel.app/api/whitelist/check"

-- Configuration
local CHECK_INTERVAL = 300 -- Vérifier toutes les 5 minutes
local OBSIDIAN_ENABLED = false

local function logMessage(message, level)
    local prefix = ""
    if level == "success" then
        prefix = "✅ [OBSIDIAN]"
    elseif level == "error" then
        prefix = "❌ [OBSIDIAN]"
    elseif level == "warning" then
        prefix = "⚠️ [OBSIDIAN]"
    else
        prefix = "🔍 [OBSIDIAN]"
    end
    print(prefix .. " " .. message)
end

-- Fonction pour vérifier si le serveur est whitelisté
local function checkServerWhitelist()
    local gameId = tostring(game.GameId)
    
    logMessage("Vérification de la whitelist...", "info")
    logMessage("Game ID: " .. gameId, "info")
    
    local requestUrl = API_URL .. "?gameId=" .. gameId
    
    local success, result = pcall(function()
        local response = HttpService:RequestAsync({
            Url = requestUrl,
            Method = "GET",
            Headers = {
                ["Content-Type"] = "application/json"
            }
        })
        
        if response.StatusCode == 200 then
            return HttpService:JSONDecode(response.Body)
        else
            error("HTTP " .. response.StatusCode)
        end
    end)
    
    if success and result then
        if result.success and result.whitelisted then
            logMessage("🛡️ SERVEUR AUTORISÉ - Obsidian Protection ACTIVÉE", "success")
            OBSIDIAN_ENABLED = true
            return true
        else
            logMessage("🚫 SERVEUR NON AUTORISÉ - Obsidian Protection DÉSACTIVÉE", "error")
            OBSIDIAN_ENABLED = false
            return false
        end
    else
        logMessage("Erreur lors de la vérification: " .. tostring(result), "error")
        OBSIDIAN_ENABLED = false
        return false
    end
end

-- Initialisation
logMessage("=== OBSIDIAN WHITELIST SYSTEM ===", "info")
logMessage("Game ID: " .. tostring(game.GameId), "info")

spawn(function()
    wait(2)
    if checkServerWhitelist() then
        logMessage("🎯 SYSTÈME OBSIDIAN OPÉRATIONNEL", "success")
    else
        logMessage("🔒 SYSTÈME EN ATTENTE D'AUTORISATION", "warning")
    end
end)

-- API publique
_G.ObsidianWhitelist = {
    IsEnabled = function() return OBSIDIAN_ENABLED end,
    ForceCheck = checkServerWhitelist,
    GetGameId = function() return tostring(game.GameId) end
}`

    navigator.clipboard.writeText(script)
    setSuccess("Script copié dans le presse-papiers !")
  }

  // Effacer les messages après 5 secondes
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR")
  }

  return (
    <div className="space-y-6">
      {/* Messages d'erreur et de succès */}
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

      {/* Information sur le stockage */}
      <Card className="bg-blue-900/50 border-blue-700">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-blue-300 font-medium mb-2">💾 Stockage Local Actif</h3>
              <p className="text-blue-200 text-sm mb-2">
                Les données sont sauvegardées dans votre navigateur. Pour une persistance complète en production :
              </p>
              <ol className="text-blue-200 text-sm space-y-1 ml-4 list-decimal">
                <li>Exportez vos données avec le bouton "Exporter"</li>
                <li>Copiez les données d'environnement</li>
                <li>Ajoutez la variable WHITELIST_DATA à votre déploiement</li>
              </ol>
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
                <p className="text-2xl font-bold text-white">{servers.length}</p>
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
                <p className="text-2xl font-bold text-white">{servers.length}</p>
                <p className="text-slate-400">Autorisés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">{servers.filter((s) => s.lastCheck).length}</p>
                <p className="text-slate-400">Vérifiés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ajouter un serveur */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Ajouter un serveur
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Game ID (requis)</label>
              <Input
                type="text"
                placeholder="Ex: 123456789"
                value={newGameId}
                onChange={(e) => setNewGameId(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                onKeyPress={(e) => e.key === "Enter" && addServer()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nom du jeu (optionnel)</label>
              <Input
                type="text"
                placeholder="Ex: Mon Jeu Roblox"
                value={newGameName}
                onChange={(e) => setNewGameName(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                onKeyPress={(e) => e.key === "Enter" && addServer()}
              />
            </div>
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
              onClick={exportData}
              variant="outline"
              className="border-blue-600 text-blue-300 hover:bg-blue-600/20 bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <label className="cursor-pointer">
              <Button
                variant="outline"
                className="border-green-600 text-green-300 hover:bg-green-600/20 bg-transparent"
                asChild
              >
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Importer
                </span>
              </Button>
              <input type="file" accept=".json" onChange={importData} className="hidden" />
            </label>
            <Button
              onClick={copyEnvironmentData}
              variant="outline"
              className="border-yellow-600 text-yellow-300 hover:bg-yellow-600/20 bg-transparent"
            >
              <Database className="h-4 w-4 mr-2" />
              Copier ENV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des serveurs */}
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
                  key={server.gameId}
                  className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-600/30">
                        ID: {server.gameId}
                      </Badge>
                      {testResults[server.gameId] !== undefined && (
                        <Badge
                          variant={testResults[server.gameId] ? "default" : "destructive"}
                          className={testResults[server.gameId] ? "bg-green-600" : "bg-red-600"}
                        >
                          {testResults[server.gameId] ? "✅ Whitelisté" : "❌ Non trouvé"}
                        </Badge>
                      )}
                    </div>
                    {server.gameName && <p className="text-white font-medium mt-1">{server.gameName}</p>}
                    <div className="flex gap-4 text-sm text-slate-400 mt-2">
                      <span>Ajouté: {formatDate(server.addedAt)}</span>
                      {server.lastCheck && <span>Dernière vérif: {formatDate(server.lastCheck)}</span>}
                    </div>
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
            📋 Script Roblox
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
        <CardContent className="space-y-3 text-slate-300">
          <div className="space-y-2">
            <p>
              <strong>1. Ajoutez vos Game IDs</strong> dans la liste ci-dessus
            </p>
            <p>
              <strong>2. Copiez le script Roblox</strong> et placez-le dans ServerScriptService
            </p>
            <p>
              <strong>3. Activez "Allow HTTP Requests"</strong> dans Roblox Studio
            </p>
            <p>
              <strong>4. Le script vérifiera automatiquement</strong> si le serveur est autorisé
            </p>
          </div>
          <div className="bg-slate-700/50 p-3 rounded border border-slate-600">
            <p className="text-sm font-mono text-green-400">
              URL API: {typeof window !== "undefined" ? window.location.origin : ""}/api/whitelist/check
            </p>
            <p className="text-sm font-mono text-blue-400 mt-1">Méthode: GET avec paramètre ?gameId=123456789</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}