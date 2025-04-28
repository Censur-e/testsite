"use client"

import { Shield } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="py-12 bg-[#030303] relative border-t border-white/[0.05]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-6 md:mb-0">
            <div className="bg-gradient-to-r from-obsidian-100/20 to-obsidian-500/20 p-2 rounded-lg mr-3">
              <Shield className="h-6 w-6 text-obsidian-100" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-obsidian-100 via-obsidian-300 to-obsidian-500">
              Obsidian
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-8 mb-6 md:mb-0">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
              className="text-white/40 hover:text-obsidian-100 transition-colors"
            >
              Accueil
            </a>
            <a
              href="#features-section"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" })
              }}
              className="text-white/40 hover:text-obsidian-200 transition-colors"
            >
              Fonctionnalités
            </a>
            <Link href="/feature" className="text-white/40 hover:text-obsidian-200 transition-colors">
              Détections
            </Link>
            <a
              href="#demo-section"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById("demo-section")?.scrollIntoView({ behavior: "smooth" })
              }}
              className="text-white/40 hover:text-obsidian-300 transition-colors"
            >
              Démo
            </a>
            <a
              href="#beta-signup"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById("beta-signup")?.scrollIntoView({ behavior: "smooth" })
              }}
              className="text-white/40 hover:text-obsidian-400 transition-colors"
            >
              Bêta
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-obsidian-500 transition-colors"
            >
              GitHub
            </a>
          </div>

          <div className="flex space-x-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-obsidian-100 transition-colors"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="https://discord.gg/sFcAYQhcXR"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-obsidian-200 transition-colors"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z" />
              </svg>
            </a>
            <a
              href="https://www.roblox.com/fr/games/135185023723160/Obsidian-Anti-Cheat-Test"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-obsidian-300 transition-colors"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5.164 0L.16 18.928l18.836 5.068L23.996 5.068 5.164 0zm8.747 15.354l-6.02-1.62 1.62-6.02 6.02 1.62-1.62 6.02z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/[0.05] text-center text-white/30 text-sm">
          <p>© {new Date().getFullYear()} Obsidian Anti-Cheat. Tous droits réservés.</p>
          <p className="mt-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-obsidian-100 to-obsidian-500 animate-shimmer bg-[length:200%_100%]">
              Sécurisez. Protégez. Jouez équitablement.
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}
