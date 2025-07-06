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
      setSuccess(`Serveur ${newGameId.trim()} ajouté avec suc
