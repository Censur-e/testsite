"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Users, Clock, ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"
import { ServerIcon } from "lucide-react"

interface Server {
  id: string
  name: string
  status: "online" | "offline"
  lastSeen: string
  playerCount: number
  gameId: string
}

interface ApiResponse {
  success: boolean
  servers: Server[]
  stats: {
    total: number
    online: number
    offline: number
  }
}

export default function ServerMonitor() {
  const [servers, setServers] = useState<Server[]>([])
  const [stats, setStats] = useState({ total: 0, online: 0, offline: 0 })
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Fonction pour récupérer les serveurs
  const fetchServers = async () => {
    try {
      const response = await fetch("/api/servers")
      const data: ApiResponse = await response.json()

      if (data.success) {
        setServers(data.servers)
        setStats(data.stats)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error("Erreur lors de la récupération:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour supprimer un serveur
  const deleteServer = async (serverId: string) => {
    try {
      const response = await fetch(`/api/servers?serverId=${serverId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchServers() // Recharger la liste
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
    }
  }

  // Charger les serveurs au démarrage
  useEffect(() => {
    fetchServers()

    // Auto-refresh toutes les 10 secondes
    const interval = setInterval(fetchServers, 10000)
    return () => clearInterval(interval)
  }, [])

  // Fonction pour formater la date
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffMinutes < 1) return "À l'instant"
    if (diffMinutes < 60) return `Il y a ${diffMinutes}min`

    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `Il y a ${diffHours}h`

    return date.toLocaleDateString("fr-FR")
  }

  return (
    <div className="min-h-screen bg-[#030303] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Link>
            </Button>

            <div>
              <h1 className="text-3xl font-bold text-white">Monitoring des Serveurs</h1>
              <p className="text-gray-400">Surveillance en temps réel des serveurs Roblox</p>
            </div>
          </div>

          <Button onClick={fetchServers} disabled={loading} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400 flex items-center">
                <ServerIcon className="mr-2 h-4 w-4" />
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400 flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                En ligne
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{stats.online}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400 flex items-center">
                <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                Hors ligne
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{stats.offline}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400 flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Dernière MAJ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-white">{formatTime(lastUpdate.toISOString())}</div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des serveurs */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400">Chargement des serveurs...</p>
            </div>
          ) : servers.length === 0 ? (
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="text-center py-12">
                <ServerIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-medium text-white mb-2">Aucun serveur</h3>
                <p className="text-gray-400">Les serveurs Roblox connectés apparaîtront ici automatiquement.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servers.map((server) => (
                <Card key={server.id} className="bg-gray-900 border-gray-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white truncate">{server.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={server.status === "online" ? "default" : "secondary"}
                          className={server.status === "online" ? "bg-green-600" : "bg-red-600"}
                        >
                          {server.status === "online" ? "En ligne" : "Hors ligne"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteServer(server.id)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center text-sm text-gray-400">
                      <ServerIcon className="mr-2 h-4 w-4" />
                      ID: {server.id}
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <Users className="mr-2 h-4 w-4" />
                      {server.playerCount} joueur{server.playerCount !== 1 ? "s" : ""}
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <Clock className="mr-2 h-4 w-4" />
                      {formatTime(server.lastSeen)}
                    </div>
                    {server.gameId && <div className="text-xs text-gray-500">Game ID: {server.gameId}</div>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
