"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Server, Shield, AlertCircle, Copy, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ServerEntry {
  gameId: string
  gameName?: string
  addedAt: string
  lastCheck?: string
}

export default function ServerWhitelistManager() {
  const [servers, setServers] = useState<ServerEntry[]>([])
  const [newGameId, setNewGameId] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const { toast } = useToast()

  // Charger la liste des serveurs au démarrage
  useEffect(() => {
    fetchServers()
  }, [])

  const fetchServers = async () => {
    try {
      const response = await fetch("/api/whitelist")
      if (response.ok) {
        const data = await response.json()
        setServers(data.servers || [])
        console.log("Serveurs chargés:", data.servers)
      } else {
        console.error("Erreur lors du chargement:", response.status)
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error)
    } finally {
      setFetching(false)
    }
  }

  const addServer = async () => {
    if (!newGameId.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un Game ID valide",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/whitelist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gameId: newGameId.trim() }),
      })

      const data = await response.json()
      console.log("Réponse ajout:", data)

      if (response.ok) {
        setServers(data.servers)
        setNewGameId("")
        toast({
          title: "Succès",
          description: `Serveur ${newGameId} ajouté à la whitelist`,
        })
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Erreur lors de l'ajout",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur ajout:", error)
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const removeServer = async (gameId: string) => {
    try {
      const response = await fetch("/api/whitelist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gameId }),
      })

      const data = await response.json()

      if (response.ok) {
        setServers(data.servers)
        toast({
          title: "Succès",
          description: `Serveur ${gameId} retiré de la whitelist`,
        })
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Erreur lors de la suppression",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive",
      })
    }
  }

  const testServer = async (gameId: string) => {
    try {
      const response = await fetch("/api/whitelist/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gameId }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: data.whitelisted ? "✅ Serveur Autorisé" : "❌ Serveur Refusé",
          description: `Game ID: ${gameId} - ${data.whitelisted ? "Dans la whitelist" : "Pas dans la whitelist"}`,
          variant: data.whitelisted ? "default" : "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur de test",
        description: "Impossible de tester le serveur",
        variant: "destructive",
      })
    }
  }

  const copyScript = () => {
    const script = `-- Script Obsidian Whitelist
-- À placer dans ServerScriptService

local HttpService = game:GetService("HttpService")

-- CONFIGURATION - Modifiez cette URL avec votre domaine
local API_URL = "https://obsidianac-censur-es-projects.vercel.app/api/whitelist/check"

local function checkServerWhitelist()
    local gameId = tostring(game.GameId)
    
    print("🔍 [OBSIDIAN] Vérification Game ID:", gameId)
    print("🔗 [OBSIDIAN] API URL:", API_URL)
    
    local success, result = pcall(function()
        local response = HttpService:RequestAsync({
            Url = API_URL,
            Method = "POST",
            Headers = {
                ["Content-Type"] = "application/json"
            },
            Body = HttpService:JSONEncode({
                gameId = gameId
            })
        })
        
        print("📡 [OBSIDIAN] Réponse HTTP:", response.StatusCode)
        print("📄 [OBSIDIAN] Corps réponse:", response.Body)
        
        return HttpService:JSONDecode(response.Body)
    end)
    
    if success and result then
        if result.whitelisted then
            print("✅ [OBSIDIAN] Serveur AUTORISÉ - Protection activée")
            return true
        else
            print("❌ [OBSIDIAN] Serveur NON AUTORISÉ - Protection désactivée")
            return false
        end
    else
        print("⚠️ [OBSIDIAN] Erreur de vérification:", result)
        return false
    end
end

-- Test au démarrage
spawn(function()
    wait(2)
    if checkServerWhitelist() then
        print("🛡️ [OBSIDIAN] SYSTÈME ACTIVÉ")
    else
        print("🚫 [OBSIDIAN] SYSTÈME DÉSACTIVÉ")
    end
end)`

    navigator.clipboard.writeText(script)
    toast({
      title: "Script copié !",
      description: "Le script a été copié dans le presse-papiers",
    })
  }

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Server className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{servers.length}</p>
                <p className="text-slate-400">Serveurs Autorisés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">Actif</p>
                <p className="text-slate-400">Système</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">API</p>
                <p className="text-slate-400">Disponible</p>
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
            Ajouter un Serveur à la Whitelist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Game ID (ex: 123456789)"
              value={newGameId}
              onChange={(e) => setNewGameId(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              onKeyPress={(e) => e.key === "Enter" && addServer()}
            />
            <Button onClick={addServer} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
              {loading ? "Ajout..." : "Ajouter"}
            </Button>
            <Button onClick={fetchServers} variant="outline" className="border-slate-600 bg-transparent">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-slate-400 text-sm mt-2">
            Le Game ID se trouve dans l'URL de votre jeu Roblox ou via game.GameId dans le script
          </p>
        </CardContent>
      </Card>

      {/* Liste des serveurs */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Serveurs Whitelistés ({servers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {servers.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Aucun serveur dans la whitelist</p>
          ) : (
            <div className="space-y-3">
              {servers.map((server) => (
                <div key={server.gameId} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                      {server.gameId}
                    </Badge>
                    {server.gameName && <span className="text-slate-300">{server.gameName}</span>}
                    <span className="text-slate-500 text-sm">
                      Ajouté le {new Date(server.addedAt).toLocaleDateString("fr-FR")}
                    </span>
                    {server.lastCheck && (
                      <span className="text-green-400 text-sm">
                        Dernière vérif: {new Date(server.lastCheck).toLocaleString("fr-FR")}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testServer(server.gameId)}
                      className="border-slate-600 text-slate-300"
                    >
                      Test
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => removeServer(server.gameId)}>
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
            Script Roblox
            <Button onClick={copyScript} variant="outline" size="sm" className="border-slate-600 bg-transparent">
              <Copy className="h-4 w-4 mr-2" />
              Copier
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-slate-300">
            <p>Instructions d'installation :</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Copiez le script ci-dessus</li>
              <li>Placez-le dans ServerScriptService de votre jeu</li>
              <li>Activez "Allow HTTP Requests" dans les paramètres du jeu</li>
              <li>Le script vérifiera automatiquement si le serveur est autorisé</li>
            </ol>
            <div className="bg-slate-900/50 p-4 rounded-lg mt-4">
              <p className="text-sm text-slate-400">
                <strong>URL de l'API :</strong> <code className="text-purple-300">/api/whitelist/check</code>
              </p>
              <p className="text-sm text-slate-400 mt-1">
                <strong>Méthode :</strong> <code className="text-purple-300">POST</code>
              </p>
              <p className="text-sm text-slate-400 mt-1">
                <strong>Données :</strong> <code className="text-purple-300">{`{"gameId": "123456789"}`}</code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}