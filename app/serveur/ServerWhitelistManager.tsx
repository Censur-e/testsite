'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus, RefreshCw, TestTube, Server, Shield, Clock } from 'lucide-react'

interface WhitelistServer {
  gameId: string
  gameName?: string
  addedAt: string
  lastCheck?: string
}

export default function ServerWhitelistManager() {
  const [servers, setServers] = useState<WhitelistServer[]>([])
  const [newGameId, setNewGameId] = useState('')
  const [newGameName, setNewGameName] = useState('')
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})

  // Charger les serveurs
  const loadServers = async () => {
    try {
      const response = await fetch('/api/whitelist')
      if (response.ok) {
        const data = await response.json()
        setServers(data.servers || [])
      }
    } catch (error) {
      console.error('Erreur chargement serveurs:', error)
    }
  }

  // Ajouter un serveur
  const addServer = async () => {
    if (!newGameId.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: newGameId.trim(),
          gameName: newGameName.trim() || undefined
        })
      })

      if (response.ok) {
        setNewGameId('')
        setNewGameName('')
        await loadServers()
      } else {
        const error = await response.json()
        alert('Erreur: ' + error.error)
      }
    } catch (error) {
      console.error('Erreur ajout serveur:', error)
      alert('Erreur lors de l\'ajout du serveur')
    }
    setLoading(false)
  }

  // Supprimer un serveur
  const removeServer = async (gameId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce serveur ?')) return

    try {
      const response = await fetch('/api/whitelist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId })
      })

      if (response.ok) {
        await loadServers()
      }
    } catch (error) {
      console.error('Erreur suppression serveur:', error)
    }
  }

  // Tester un serveur
  const testServer = async (gameId: string) => {
    try {
      const response = await fetch(`/api/whitelist/check?gameId=${gameId}`)
      const data = await response.json()
      
      setTestResults(prev => ({
        ...prev,
        [gameId]: data.whitelisted
      }))

      setTimeout(() => {
        setTestResults(prev => {
          const newResults = { ...prev }
          delete newResults[gameId]
          return newResults
        })
      }, 3000)
    } catch (error) {
      console.error('Erreur test serveur:', error)
    }
  }

  useEffect(() => {
    loadServers()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR')
  }

  return (
    <div className="space-y-6">
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
                <p className="text-2xl font-bold text-white">
                  {servers.filter(s => s.lastCheck).length}
                </p>
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
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Game ID (requis)
              </label>
              <Input
                type="text"
                placeholder="Ex: 123456789"
                value={newGameId}
                onChange={(e) => setNewGameId(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nom du jeu (optionnel)
              </label>
              <Input
                type="text"
                placeholder="Ex: Mon Jeu Roblox"
                value={newGameName}
                onChange={(e) => setNewGameName(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={addServer}
              disabled={loading || !newGameId.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Ajout...' : 'Ajouter'}
            </Button>
            <Button
              onClick={loadServers}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
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
                    {server.gameName && (
                      <p className="text-white font-medium mt-1">{server.gameName}</p>
                    )}
                    <div className="flex gap-4 text-sm text-slate-400 mt-2">
                      <span>Ajouté: {formatDate(server.addedAt)}</span>
                      {server.lastCheck && (
                        <span>Dernière vérif: {formatDate(server.lastCheck)}</span>
                      )}
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

      {/* Instructions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">📋 Instructions d'utilisation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-300">
          <div className="space-y-2">
            <p><strong>1. Ajoutez vos Game IDs</strong> dans la liste ci-dessus</p>
            <p><strong>2. Copiez le script Roblox</strong> et placez-le dans ServerScriptService</p>
            <p><strong>3. Modifiez l'URL</strong> dans le script avec votre domaine</p>
            <p><strong>4. Activez "Allow HTTP Requests"</strong> dans Roblox Studio</p>
          </div>
          <div className="bg-slate-700/50 p-3 rounded border border-slate-600">
            <p className="text-sm font-mono text-green-400">
              URL API: {typeof window !== 'undefined' ? window.location.origin : ''}/api/whitelist/check
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}