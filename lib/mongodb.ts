import { MongoClient, ServerApiVersion } from "mongodb"

// Vérification plus souple de la variable d'environnement
const uri = process.env.MONGODB_URI || ""
if (!uri) {
  console.error("Avertissement: MONGODB_URI n'est pas défini")
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Ajouter des options de timeout
  connectTimeoutMS: 5000, // 5 secondes
  socketTimeoutMS: 30000, // 30 secondes
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect().catch((err) => {
      console.error("Erreur de connexion à MongoDB:", err)
      throw err
    })
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect().catch((err) => {
    console.error("Erreur de connexion à MongoDB:", err)
    throw err
  })
}

export default clientPromise
