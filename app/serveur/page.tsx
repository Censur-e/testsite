import { Suspense } from 'react'
import ServerWhitelistManager from './ServerWhitelistManager'

export default function ServeurPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🛡️ Obsidian Server Whitelist
          </h1>
          <p className="text-slate-300 text-lg">
            Gérez les serveurs Roblox autorisés à utiliser Obsidian
          </p>
        </div>
        
        <Suspense fallback={
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        }>
          <ServerWhitelistManager />
        </Suspense>
      </div>
    </div>
  )
}
