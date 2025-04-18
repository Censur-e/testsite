"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Shield, Save, LogOut, RefreshCw } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [serverId, setServerId] = useState("")
  const [serverName, setServerName] = useState("")
  const [username, setUsername] = useState("")
  const [webhookUrl, setWebhookUrl] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem("obsidian-token")
    const storedServerId = localStorage.getItem("obsidian-server-id")
    const storedUsername = localStorage.getItem("obsidian-username")
    const storedServerName = localStorage.getItem("obsidian-server-name")

    if (!token || !storedServerId || !storedUsername) {
      router.push("/login")
      return
    }

    setServerId(storedServerId)
    setUsername(storedUsername)
    setServerName(storedServerName || "Votre serveur")

    // Charger les informations du serveur
    fetchServerInfo(storedServerId)
  }, [router])

  const fetchServerInfo = async (id: string) => {
    try {
      const response = await fetch(`/api/servers/${id}/webhook`)

      if (response.ok) {
        const data = await response.json()
        setWebhookUrl(data.webhookUrl || "")
      } else {
        setError("Erreur lors du chargement des informations du serveur")
      }
    } catch (error) {
      setError("Erreur lors du chargement des informations du serveur")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateWebhook = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsSaving(true)

    try {
      const password = prompt("Veuillez entrer votre mot de passe pour confirmer la modification:")

      if (!password) {
        setIsSaving(false)
        return
      }

      const response = await fetch(`/api/servers/${serverId}/webhook`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          webhookUrl,
        }),
      })

      if (response.ok) {
        setSuccess("Webhook mis à jour avec succès")
      } else {
        const data = await response.json()
        setError(data.error || "Erreur lors de la mise à jour du webhook")
      }
    } catch (error) {
      setError("Erreur lors de la mise à jour du webhook")
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestWebhook = async () => {
    setError("")
    setSuccess("")
    setIsTesting(true)

    try {
      const response = await fetch("/api/webhook-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          webhookUrl,
          serverId,
          serverName,
        }),
      })

      if (response.ok) {
        setSuccess("Test envoyé avec succès ! Vérifiez votre canal Discord.")
      } else {
        const data = await response.json()
        setError(data.error || "Erreur lors du test du webhook")
      }
    } catch (error) {
      setError("Erreur lors du test du webhook")
    } finally {
      setIsTesting(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("obsidian-token")
    localStorage.removeItem("obsidian-server-id")
    localStorage.removeItem("obsidian-username")
    localStorage.removeItem("obsidian-server-name")
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-white flex flex-col items-center">
          <svg
            className="animate-spin h-10 w-10 text-obsidian-300 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#030303] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <div className="bg-obsidian-300/20 p-2 rounded-full mr-3">
              <Shield className="h-6 w-6 text-obsidian-100" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{serverName}</h1>
              <p className="text-white/60 text-sm">ID: {serverId}</p>
            </div>
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

        <Card className="bg-white/[0.03] border border-white/[0.08] mb-8">
          <CardHeader>
            <CardTitle className="text-white">Configuration du Webhook Discord</CardTitle>
            <CardDescription className="text-white/60">
              Modifiez l'URL du webhook Discord pour recevoir les notifications de triche
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdateWebhook}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl" className="text-white/70">
                  URL du webhook Discord
                </Label>
                <Input
                  id="webhookUrl"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  required
                  className="bg-white/[0.03] border-white/10 text-white"
                  placeholder="https://discord.com/api/webhooks/..."
                />
                <p className="text-white/40 text-xs">
                  Pour créer un webhook Discord, allez dans les paramètres de votre serveur &gt; Intégrations &gt;
                  Webhooks &gt; Nouveau webhook
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto bg-gradient-to-r from-obsidian-300 to-obsidian-500 hover:from-obsidian-400 hover:to-obsidian-500 text-white border-none"
              >
                {isSaving ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Enregistrement...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Save className="mr-2 h-4 w-4" /> Enregistrer
                  </span>
                )}
              </Button>
              <Button
                type="button"
                disabled={isTesting || !webhookUrl}
                variant="outline"
                className="w-full sm:w-auto border-obsidian-300/50 text-obsidian-100 bg-white/[0.03]"
                onClick={handleTestWebhook}
              >
                {isTesting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-obsidian-100"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Test en cours...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <RefreshCw className="mr-2 h-4 w-4" /> Tester le webhook
                  </span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="bg-white/[0.03] border border-white/[0.08]">
          <CardHeader>
            <CardTitle className="text-white">Guide d'intégration</CardTitle>
            <CardDescription className="text-white/60">
              Comment intégrer Obsidian Anti-Cheat dans votre jeu Roblox
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-black/30 p-4 rounded-lg">
                <h3 className="text-white font-medium mb-2">Code Lua pour Roblox</h3>
                <pre className="text-white/70 text-sm overflow-x-auto p-2 bg-black/50 rounded">
                  <code>{`local HttpService = game:GetService("HttpService")

-- Fonction pour signaler un tricheur
local function reportCheater(playerName, cheatType, details)
    local data = {
        auth = "oBsiACdian", -- Clé d'authentification
        embeds = {
            {
                title = "OBSIDIAN - ANTI-CHEAT",
                description = "Nouveau cheateur detecté (cheh à lui !)\\n\\n**Joueur:** " .. playerName .. "\\n**Type:** " .. cheatType,
                footer = "Serveur: ${serverName} (ID: ${serverId})"
            }
        }
    }
    
    -- Ajouter des détails si fournis
    if details then
        data.embeds[1].description = data.embeds[1].description .. "\\n\\n**Détails:** " .. details
    end
    
    local success, response = pcall(function()
        return HttpService:PostAsync(
            "https://votre-domaine.com/api/webhook",
            HttpService:JSONEncode(data),
            Enum.HttpContentType.ApplicationJson
        )
    end)
    
    if success then
        print("Notification de triche envoyée avec succès")
    else
        warn("Échec de l'envoi de la notification:", response)
    end
end

-- Exemple d'utilisation
-- reportCheater("NomJoueur", "SpeedHack", "Vitesse: 50 (normal: 16)")
`}</code>
                </pre>
              </div>

              <div className="space-y-2">
                <h3 className="text-white font-medium">Instructions:</h3>
                <ol className="list-decimal list-inside text-white/70 space-y-2">
                  <li>Copiez le code ci-dessus dans un script serveur de votre jeu Roblox</li>
                  <li>Remplacez l'URL par celle de votre site (https://votre-domaine.com/api/webhook)</li>
                  <li>Utilisez la fonction reportCheater() pour signaler les tricheurs détectés</li>
                  <li>Les notifications seront envoyées au webhook Discord configuré ci-dessus</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
