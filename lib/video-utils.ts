// Fonction pour formater le nom de fichier vidéo
export function formatVideoFileName(id: number): string {
  return `/videos/${id}.mp4`
}

// Fonction pour charger dynamiquement les métadonnées des vidéos
export async function loadVideoMetadata(videoId: number): Promise<{
  title: string
  description: string
  category: string
} | null> {
  try {
    // Cette fonction pourrait être étendue pour charger les métadonnées depuis une API ou un fichier JSON
    // Pour l'instant, elle retourne des données statiques
    const metadataMap: Record<number, { title: string; description: string; category: string }> = {
      1: {
        title: "Détection des scripts malveillants",
        description: "Voyez comment Obsidian identifie les tentatives de triche instantanément.",
        category: "detection",
      },
      2: {
        title: "Prévention des exploits",
        description: "Découvrez comment Obsidian bloque les tentatives de triche avant qu'elles n'affectent votre jeu.",
        category: "prevention",
      },
      // Ajoutez d'autres métadonnées ici au fur et à mesure que vous ajoutez des vidéos
    }

    return metadataMap[videoId] || null
  } catch (error) {
    console.error("Erreur lors du chargement des métadonnées de la vidéo:", error)
    return null
  }
}
