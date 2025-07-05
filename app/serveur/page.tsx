import type { Metadata } from "next"
import ServerWhitelistManager from "./ServerWhitelistManager"

export const metadata: Metadata = {
  title: "Gestion Serveurs - Obsidian",
  description: "Interface d'administration pour gérer la whitelist des serveurs Roblox",
}

export default function ServerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🛡️ Gestion des Serveurs Obsidian</h1>
          <p className="text-slate-300 text-lg">
            Interface d'administration pour gérer la whitelist des serveurs Roblox
          </p>
        </div>

        <ServerWhitelistManager />
      </div>
    </div>
  )
}