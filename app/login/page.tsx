"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Shield, LogIn } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [serverId, setServerId] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ serverId, username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Stocker le token dans le localStorage
        localStorage.setItem("obsidian-token", data.token)
        localStorage.setItem("obsidian-server-id", data.serverId)
        localStorage.setItem("obsidian-username", data.username)
        localStorage.setItem("obsidian-server-name", data.serverName)

        // Rediriger vers le tableau de bord
        router.push("/dashboard")
      } else {
        setError(data.error || "Erreur lors de la connexion")
      }
    } catch (error) {
      setError("Erreur lors de la connexion")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/[0.03] border border-white/[0.08]">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-obsidian-300/20 p-3 rounded-full">
              <Shield className="h-6 w-6 text-obsidian-100" />
            </div>
          </div>
          <CardTitle className="text-center text-white">Connexion Obsidian</CardTitle>
          <CardDescription className="text-center text-white/60">
            Connectez-vous pour gérer votre webhook Discord
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="serverId" className="text-white/70">
                ID du serveur
              </Label>
              <Input
                id="serverId"
                value={serverId}
                onChange={(e) => setServerId(e.target.value)}
                required
                className="bg-white/[0.03] border-white/10 text-white"
                placeholder="123456789"
              />
            </div>
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
              disabled={isLoading}
              className="w-full bg-gradient-to-rrom-obsidian-300 to-obsidian-500 hover:from-obsidian-400 hover:to-obsidian-500 text-white border-none relative"
            >
              {isLoading ? (
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
                  Connexion...
                </span>
              ) : (
                <span className="flex items-center">
                  <LogIn className="mr-2 h-4 w-4" /> Se connecter
                </span>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
