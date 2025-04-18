// Utilisons une approche différente pour stocker les données
// Puisque l'écriture de fichiers peut être problématique dans certains environnements serverless

// Variable globale pour stocker les données en mémoire
let productCountData: ProductCountData = {
  total: 0,
  remaining: 0,
  lastUpdated: new Date().toISOString(),
}

// Type pour les données de compteur
interface ProductCountData {
  total: number
  remaining: number
  lastUpdated: string
}

// Fonction pour lire les données de compteur
export function getProductCount(): ProductCountData {
  console.log("Lecture des données de compteur:", productCountData)
  return { ...productCountData }
}

// Fonction pour mettre à jour les données de compteur
export function updateProductCount(data: Partial<ProductCountData>): ProductCountData {
  try {
    // Mettre à jour les données en mémoire
    productCountData = {
      ...productCountData,
      ...data,
      lastUpdated: new Date().toISOString(),
    }

    // Assurez-vous que les valeurs sont des nombres
    productCountData.total = Number(productCountData.total)
    productCountData.remaining = Number(productCountData.remaining)

    console.log("Données mises à jour en mémoire:", productCountData)

    return { ...productCountData }
  } catch (error) {
    console.error("Erreur lors de la mise à jour des données de compteur:", error)
    throw error
  }
}

// Fonction pour décrémenter le compteur (quand quelqu'un s'inscrit)
export function decrementRemainingCount(): ProductCountData {
  if (productCountData.remaining > 0) {
    return updateProductCount({ remaining: productCountData.remaining - 1 })
  }
  return { ...productCountData }
}
