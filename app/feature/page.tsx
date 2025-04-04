import type { Metadata } from "next"
import FeaturePageClient from "./FeaturePageClient"

export const metadata: Metadata = {
  title: "Obsidian - Feature",
  description: "Découvrez les fonctionnalités de détection d'Obsidian",
}

export default function FeaturePage() {
  return <FeaturePageClient />
}

