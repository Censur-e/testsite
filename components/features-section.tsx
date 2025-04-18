"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { cn } from "@/lib/utils"
import { Shield, Eye, Zap, Lock, Code, Award } from "lucide-react"

const features = [
  {
    icon: <Shield className="h-6 w-6 text-obsidian-100" />,
    title: "Protection Avancée",
    description: "Détection des exploits et des scripts malveillants en temps réel.",
  },
  {
    icon: <Eye className="h-6 w-6 text-obsidian-200" />,
    title: "Surveillance Invisible",
    description: "Fonctionne en arrière-plan sans impact sur les performances du jeu ou l'expérience utilisateur.",
  },
  {
    icon: <Zap className="h-6 w-6 text-obsidian-300" />,
    title: "Réponse Instantanée",
    description: "Neutralise les menaces dès leur détection pour maintenir l'intégrité de votre jeu.",
  },
  {
    icon: <Lock className="h-6 w-6 text-obsidian-400" />,
    title: "Sécurité Renforcée",
    description: "Script Obfuscer et protéger avec un algorithme de protection.",
  },
  {
    icon: <Code className="h-6 w-6 text-obsidian-500" />,
    title: "Intégration Facile",
    description: "Installation simple avec un plugin qui permet une installation encore plus facile.",
  },
  {
    icon: <Award className="h-6 w-6 text-obsidian-100" />,
    title: "100% Gratuit",
    description: "Toutes les fonctionnalités premium sans aucun coût, pour les développeurs de toutes tailles.",
  },
]

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [100, 0, 0, 100])

  return (
    <section id="features-section" ref={sectionRef} className="py-20 bg-[#030303] relative">
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian-100/[0.03] to-obsidian-500/[0.03]" />

      <motion.div style={{ opacity, y }} className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-obsidian-100 via-white to-obsidian-500">
            Fonctionnalités Exceptionnelles
          </h2>
          <p className="text-white/40 max-w-2xl mx-auto">
            Obsidian offre une suite complète d'outils de protection pour garantir que votre jeu Roblox reste équitable
            et sécurisé.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{
                scale: 1.03,
                y: -5,
                transition: { type: "spring", stiffness: 400, damping: 10 },
              }}
              className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 hover:bg-gradient-to-br hover:from-obsidian-100/20 hover:to-obsidian-500/20 hover:border-obsidian-300/50 transition-all duration-200 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-obsidian-100/10 to-obsidian-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-0"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-obsidian-100 to-obsidian-500 rounded-xl blur-md opacity-0 group-hover:opacity-20 transition-opacity duration-200 group-hover:duration-400 z-0"></div>
              <div className="relative z-10">
                <div
                  className={cn(
                    "bg-gradient-to-br p-3 rounded-lg w-fit mb-4",
                    "from-obsidian-100/20 to-obsidian-500/20",
                    "group-hover:from-obsidian-100/40 group-hover:to-obsidian-500/40",
                    "transition-all duration-200",
                  )}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-obsidian-100 transition-colors duration-200">
                  {feature.title}
                </h3>
                <p className="text-white/40 group-hover:text-white/60 transition-colors duration-200">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
