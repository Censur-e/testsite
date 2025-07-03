"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Shield, Server, Users, Clock, RefreshCw, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ServerData {
  id: string
  name: string
  status: "connected" | "disconnected"
  lastSeen: string
  playerCount?: number
  gameId?: string
}

export default function ServerPageClient() {
  const [servers, setServers] = useState<ServerData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Fonction pour récupérer les serveurs
  const fetchServers = async () => {
    try {
      const response = await fetch("/api/servers")
      if (response.ok) {
        const data = await response.json()
        setServers(data.servers || [])
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des serveurs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Charger les serveurs au montage du composant
  useEffect(() => {
    fetchServers()

    // Actualiser toutes les 5 secondes
    const interval = setInterval(fetchServers, 5000)

    return () => clearInterval(interval)
  }, [])

  // Fonction pour formater la date
  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)

    if (diffSeconds < 60) {
      return "À l'instant"
    } else if (diffMinutes < 60) {
      return `Il y a ${diffMinutes} min`
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`
    } else {
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  }

  const connectedServers = servers.filter((s) => s.status === "connected")
  const disconnectedServers = servers.filter((s) => s.status === "disconnected")

  return (
    <main className="min-h-screen bg-[#030303] relative">
      <div className="absolute inset-0 bg-gradient-to-br from-obsidian-100/[0.05] via-transparent to-obsidian-500/[0.05]" />

      <div className="container mx-auto px-4 md:px-6 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              className="border-obsidian-300/50 text-obsidian-100 bg-white/[0.03] hover:bg-obsidian-500/20"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour
              </Link>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-obsidian-100/20 to-obsidian-500/20 p-3 rounded-lg">
                <Server className="h-6 w-6 text-obsidian-100" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-obsidian-100 via-white to-obsidian-500">
                  Surveillance des Serveurs
                </h1>
                <p className="text-white/60 text-sm">État en temps réel des serveurs Roblox connectés à Obsidian</p>
              </div>
            </div>
          </div>

          <Button
            onClick={fetchServers}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="border-obsidian-300/50 text-obsidian-100 bg-white/[0.03] hover:bg-obsidian-500/20"
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
            Actualiser
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-white/60 flex items-center">
                <Server className="mr-2 h-4 w-4" />
                Total des serveurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{servers.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-white/60 flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                Serveurs connectés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{connectedServers.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-white/60 flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Dernière mise à jour
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-white/80">{formatLastSeen(lastUpdate.toISOString())}</div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des serveurs */}
        <div className="space-y-6">
          {/* Serveurs connectés */}
          {connectedServers.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-green-400 mb-4 flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                Serveurs Connectés ({connectedServers.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connectedServers.map((server, index) => (
                  <motion.div
                    key={server.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/30 backdrop-blur-sm hover:from-green-500/15 hover:to-green-600/10 transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white font-medium truncate">{server.name}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs text-green-400 font-medium">EN LIGNE</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center text-sm text-white/60">
                          <Shield className="mr-2 h-4 w-4 text-green-400" />
                          ID: {server.id}
                        </div>
                        {server.playerCount !== undefined && (
                          <div className="flex items-center text-sm text-white/60">
                            <Users className="mr-2 h-4 w-4 text-obsidian-200" />
                            {server.playerCount} joueur{server.playerCount !== 1 ? "s" : ""}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-white/60">
                          <Clock className="mr-2 h-4 w-4 text-obsidian-300" />
                          {formatLastSeen(server.lastSeen)}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Serveurs déconnectés */}
          {disconnectedServers.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                Serveurs Déconnectés ({disconnectedServers.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {disconnectedServers.map((server, index) => (
                  <motion.div
                    key={server.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/30 backdrop-blur-sm hover:from-red-500/15 hover:to-red-600/10 transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white/80 font-medium truncate">{server.name}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className="text-xs text-red-400 font-medium">HORS LIGNE</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center text-sm text-white/40">
                          <Shield className="mr-2 h-4 w-4 text-red-400" />
                          ID: {server.id}
                        </div>
                        <div className="flex items-center text-sm text-white/40">
                          <Clock className="mr-2 h-4 w-4 text-obsidian-300" />
                          {formatLastSeen(server.lastSeen)}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Aucun serveur */}
          {servers.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="bg-obsidian-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Server className="h-8 w-8 text-obsidian-200" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Aucun serveur détecté</h3>
              <p className="text-white/60 max-w-md mx-auto">
                Les serveurs Roblox connectés à Obsidian apparaîtront ici automatiquement.
              </p>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 text-obsidian-200 animate-spin mx-auto mb-4" />
              <p className="text-white/60">Chargement des serveurs...</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
