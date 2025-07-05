"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Users, Shield, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WhitelistEntry {
  id: string
  username?: string
  addedAt: string
}

export default function WhitelistManager() {
  const [whitelistIds, setWhitelistIds] = useState<WhitelistEntry[]>([])
  const [newId, setNewId] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const { toast } = useToast()

  // Charger la whitelist au démarrage
  useEffect(() => {
    fetchWhitelist()
  }, [])

  const fetchWhitelist = async () => {
    try {
      const response = await fetch("/api/whitelist")
      if (response.ok) {
        const data = await response.json()
        setWhitelistIds(data.whitelist || [])
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error)
    } finally {
      setFetching(false)
    }
  }

  const addToWhitelist = async () => {
    if (!newId.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un ID Roblox valide",
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
        body: JSON.stringify({ userId: newId.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setWhitelistIds(data.whitelist)
        setNewId("")
        toast({
          title: "Succès",
          description: `ID ${newId} ajouté à la whitelist`,
        })
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Erreur lors de l'ajout",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const removeFromWhitelist = async (userId: string) => {
    try {
      const response = await fetch("/api/whitelist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (response.ok) {
        setWhitelistIds(data.whitelist)
        toast({
          title: "Succès",
          description: `ID ${userId} retiré de la whitelist`,
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
              <Users className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{whitelistIds.length}</p>
                <p className="text-slate-400">IDs Whitelistés</p>
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

      {/* Ajouter un ID */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Ajouter un ID à la Whitelist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="ID Roblox (ex: 123456789)"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              onKeyPress={(e) => e.key === "Enter" && addToWhitelist()}
            />
            <Button onClick={addToWhitelist} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
              {loading ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des IDs */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">IDs Whitelistés</CardTitle>
        </CardHeader>
        <CardContent>
          {whitelistIds.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Aucun ID dans la whitelist</p>
          ) : (
            <div className="space-y-3">
              {whitelistIds.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                      {entry.id}
                    </Badge>
                    {entry.username && <span className="text-slate-300">{entry.username}</span>}
                    <span className="text-slate-500 text-sm">
                      Ajouté le {new Date(entry.addedAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => removeFromWhitelist(entry.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions pour Roblox */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Instructions Roblox</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-slate-300">
            <p>Pour utiliser cette whitelist dans Roblox :</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Copiez le script fourni dans ServerScriptService</li>
              <li>Modifiez l'URL de l'API avec votre domaine</li>
              <li>Activez "Allow HTTP Requests" dans les paramètres du jeu</li>
              <li>Le script vérifiera automatiquement chaque joueur qui rejoint</li>
            </ol>
            <div className="bg-slate-900/50 p-4 rounded-lg mt-4">
              <p className="text-sm text-slate-400">
                <strong>URL de l'API :</strong> <code className="text-purple-300">/api/whitelist/check</code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
