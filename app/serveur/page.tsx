import type { Metadata } from "next"
import ServerPageClient from "./ServerPageClient"

export const metadata: Metadata = {
  title: "Obsidian - Serveurs",
  description: "Surveillance des serveurs Roblox connectés à Obsidian",
}

export default function ServerPage() {
  return <ServerPageClient />
}
