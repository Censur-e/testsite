import HeroSection from "@/components/hero-section"
import FeaturesSection from "@/components/features-section"
import DemoSection from "@/components/demo-section"
import BetaSignupSection from "@/components/beta-signup-section"
import Footer from "@/components/footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Obsidian - Accueil",
  description: "Solution anti-cheat nouvelle génération pour Roblox",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#030303]">
      <HeroSection />
      <FeaturesSection />
      <DemoSection />
      <BetaSignupSection />
      <Footer />
    </main>
  )
}

