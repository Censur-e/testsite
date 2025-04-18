import fs from "fs"
import path from "path"
import type { ServerData } from "./server-data"

// Utiliser le répertoire /tmp pour les environnements serverless
const DATA_DIR = process.env.NODE_ENV === "production" ? "/tmp" : path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "servers.json")

// Fonction pour s'assurer que le répertoire de données existe
export function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    } catch (error) {
      console.error("Erreur lors de la création du répertoire de données:", error)
      // En cas d'erreur, utiliser /tmp comme fallback
      if (DATA_DIR !== "/tmp") {
        console.log("Utilisation de /tmp comme répertoire de secours")
        return "/tmp"
      }
    }
  }
  return DATA_DIR
}

// Fonction pour lire les données des serveurs depuis le stockage local
export async function getServersFromLocalStorage(): Promise<ServerData[]> {
  const dir = ensureDataDirectory()
  const filePath = path.join(dir, "servers.json")

  try {
    if (!fs.existsSync(filePath)) {
      // Si le fichier n'existe pas, créez-le avec un tableau vide
      fs.writeFileSync(filePath, JSON.stringify([]), "utf8")
      return []
    }

    const data = fs.readFileSync(filePath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Erreur lors de la lecture des données des serveurs:", error)
    return []
  }
}

// Fonction pour enregistrer les données des serveurs dans le stockage local
export async function saveServersToLocalStorage(servers: ServerData[]): Promise<void> {
  const dir = ensureDataDirectory()
  const filePath = path.join(dir, "servers.json")

  try {
    fs.writeFileSync(filePath, JSON.stringify(servers, null, 2), "utf8")
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des données des serveurs:", error)
    throw new Error("Impossible d'enregistrer les données des serveurs")
  }
}
