import ServerMonitor from "./ServerMonitor"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Obsidian - Monitoring Serveurs",
  description: "Surveillance en temps réel des serveurs Roblox",
}

export default function ServerPage() {
  return <ServerMonitor />
}
