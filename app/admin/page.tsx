"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Shield, Plus, Trash, LogOut } from "lucide-react"

interface Server {
  id: string
  name: string
  webhookUrl: string
  owner: {
    username: string
  }
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [servers, setServers] = useState<Server[]>([])
  const [newServer, setNewServer] = useState({
    id: "",
    name: "",
    webhookUrl: "",
    ownerUsername: "",
    ownerPassword: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Fonction pour se connecter
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/admin/servers", {
        headers: {
          Authorization: `Basic ${btoa(`${username}:${password}`)}`,
        },
      })

      if (response.ok) {
        setIsAuthenticated(true)
        loadServers()
      } else {
        setError("Authentification échouée")
      }
    } catch (error) {
      setError("Erreur lors de l'authentification")
    }
  }

  // Fonction pour charger les serveurs
  const loadServers = async () => {
    try {
      const response = await fetch("/api/admin/servers", {
        headers: {
          Authorization: `Basic ${btoa(`${username}:${password}`)}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setServers(data)
      } else {
        setError("Erreur lors du chargement des serveurs")
      }
    } catch (error) {
      setError("Erreur lors du chargement des serveurs")
    }
  }

  // Fonction pour ajouter un nouveau serveur
  const handleAddServer = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/admin/servers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(`${username}:${password}`)}`,
        },
        body: JSON.stringify(newServer),
      })

      if (response.ok) {
        setSuccess("Serveur ajouté avec succès")
        setNewServer({
          id: "",
          name: "",
          webhookUrl: "",
          ownerUsername: "",
          ownerPassword: "",
        })
        loadServers()
      } else {
        const data = await response.json()
        setError(data.error || "Erreur lors de l'ajout du serveur")
      }
    } catch (error) {
      setError("Erreur lors de l'ajout du serveur")
    }
  }

  // Fonction pour se déconnecter
  const handleLogout = () => {
    setIsAuthenticated(false)
    setUsername("")
    setPassword("")
    setServers([])
  }

  // Ajouter cette fonction dans le composant AdminPage

  const handleDeleteServer = async (serverId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce serveur ?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/servers/${serverId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${btoa(`${username}:${password}`)}`,
        },
      })

      if (response.ok) {
        setSuccess("Serveur supprimé avec succès")
        loadServers()
      } else {
        const data = await response.json()
        setError(data.error || "Erreur lors de la suppression du serveur")
      }
    } catch (error) {
      setError("Erreur lors de la suppression du serveur")
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/[0.03] border border-white/[0.08]">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-obsidian-300/20 p-3 rounded-full">
                <Shield className="h-6 w-6 text-obsidian-100" />
              </div>
            </div>
            <CardTitle className="text-center text-white">Administration Obsidian</CardTitle>
            <CardDescription className="text-center text-white/60">
              Connectez-vous pour gérer les serveurs
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg">{error}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white/70">
                  Nom d'utilisateur
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-white/[0.03] border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/70">
                  Mot de passe
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/[0.03] border-white/10 text-white"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-obsidian-300 to-obsidian-500 hover:from-obsidian-400 hover:to-obsidian-500 text-white border-none"
              >
                Se connecter
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#030303] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <div className="bg-obsidian-300/20 p-2 rounded-full mr-3">
              <Shield className="h-6 w-6 text-obsidian-100" />
            </div>
            <h1 className="text-2xl font-bold text-white">Administration Obsidian</h1>
          </div>
          <Button
            variant="outline"
            className="border-obsidian-300/50 text-obsidian-100 bg-white/[0.03]"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Déconnexion
          </Button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg mb-6">{error}</div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-200 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-white/[0.03] border border-white/[0.08]">
              <CardHeader>
                <CardTitle className="text-white">Serveurs enregistrés</CardTitle>
                <CardDescription className="text-white/60">Liste des serveurs avec leurs propriétaires</CardDescription>
              </CardHeader>
              <CardContent>
                {servers.length === 0 ? (
                  <div className="text-center py-8 text-white/40">Aucun serveur enregistré</div>
                ) : (
                  <div className="space-y-4">
                    {servers.map((server) => (
                      <div key={server.id} className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium text-white">{server.name}</h3>
                            <p className="text-white/60 text-sm">ID: {server.id}</p>
                            <p className="text-white/60 text-sm">Propriétaire: {server.owner.username}</p>
                            <p className="text-white/40 text-xs mt-2 break-all">Webhook: {server.webhookUrl}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            onClick={() => handleDeleteServer(server.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-white/[0.03] border border-white/[0.08]">
              <CardHeader>
                <CardTitle className="text-white">Ajouter un serveur</CardTitle>
                <CardDescription className="text-white/60">
                  Créer un nouveau serveur avec son propriétaire
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleAddServer}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="serverId" className="text-white/70">
                      ID du serveur
                    </Label>
                    <Input
                      id="serverId"
                      value={newServer.id}
                      onChange={(e) => setNewServer({ ...newServer, id: e.target.value })}
                      required
                      className="bg-white/[0.03] border-white/10 text-white"
                      placeholder="123456789"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serverName" className="text-white/70">
                      Nom du serveur
                    </Label>
                    <Input
                      id="serverName"
                      value={newServer.name}
                      onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                      required
                      className="bg-white/[0.03] border-white/10 text-white"
                      placeholder="Mon Serveur Roblox"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl" className="text-white/70">
                      URL du webhook Discord
                    </Label>
                    <Input
                      id="webhookUrl"
                      value={newServer.webhookUrl}
                      onChange={(e) => setNewServer({ ...newServer, webhookUrl: e.target.value })}
                      required
                      className="bg-white/[0.03] border-white/10 text-white"
                      placeholder="https://discord.com/api/webhooks/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerUsername" className="text-white/70">
                      Nom d'utilisateur du propriétaire
                    </Label>
                    <Input
                      id="ownerUsername"
                      value={newServer.ownerUsername}
                      onChange={(e) => setNewServer({ ...newServer, ownerUsername: e.target.value })}
                      required
                      className="bg-white/[0.03] border-white/10 text-white"
                      placeholder="fondateur"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerPassword" className="text-white/70">
                      Mot de passe du propriétaire
                    </Label>
                    <Input
                      id="ownerPassword"
                      type="password"
                      value={newServer.ownerPassword}
                      onChange={(e) => setNewServer({ ...newServer, ownerPassword: e.target.value })}
                      required
                      className="bg-white/[0.03] border-white/10 text-white"
                      placeholder="••••••••"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-obsidian-300 to-obsidian-500 hover:from-obsidian-400 hover:to-obsidian-500 text-white border-none"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Ajouter le serveur
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
