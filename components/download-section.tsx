"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Download, Github, ArrowRight, Shield } from "lucide-react"

export default function DownloadSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.9, 1, 1, 0.9])

  return (
    <section ref={sectionRef} className="py-20 bg-[#030303] relative">
      <div className="absolute inset-0 bg-gradient-to-br from-obsidian-100/[0.05] via-transparent to-obsidian-500/[0.05]" />

      <motion.div style={{ opacity, scale }} className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-obsidian-100/10 to-obsidian-500/10 rounded-2xl p-8 md:p-12 border border-white/[0.08] shadow-xl shadow-obsidian-300/5">
          <div className="text-center mb-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-obsidian-100 via-white to-obsidian-500"
            >
              Prêt à Sécuriser Votre Jeu?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-white/40 max-w-2xl mx-auto"
            >
              Téléchargez Obsidian gratuitement et commencez à protéger votre jeu Roblox contre les tricheurs dès
              aujourd'hui.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 hover:bg-gradient-to-br hover:from-obsidian-100/10 hover:to-obsidian-500/10 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-2 text-white flex items-center">
                <Download className="h-5 w-5 mr-2 text-obsidian-100" />
                Installation Directe
              </h3>
              <p className="text-white/40 mb-4">
                Téléchargez le module et importez-le directement dans votre jeu Roblox Studio.
              </p>
              <Button className="w-full bg-gradient-to-r from-obsidian-300 to-obsidian-500 hover:from-obsidian-400 hover:to-obsidian-500 text-white border-none">
                Télécharger v1.0.0
              </Button>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 hover:bg-gradient-to-br hover:from-obsidian-100/10 hover:to-obsidian-500/10 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-2 text-white flex items-center">
                <Github className="h-5 w-5 mr-2 text-obsidian-200" />
                Code Source
              </h3>
              <p className="text-white/40 mb-4">
                Accédez au code source sur GitHub pour personnaliser l'anti-cheat selon vos besoins.
              </p>
              <Button
                variant="outline"
                className="w-full border-obsidian-300/50 text-obsidian-100 bg-white/[0.03] backdrop-blur-sm hover:bg-obsidian-500/20 hover:border-obsidian-100 hover:text-white transition-all duration-300 shadow-lg shadow-obsidian-500/10 hover:shadow-obsidian-300/20 group"
              >
                <Github className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" /> Voir sur GitHub
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 hover:bg-gradient-to-br hover:from-obsidian-100/10 hover:to-obsidian-500/10 transition-all duration-300"
          >
            <h3 className="text-xl font-semibold mb-4 text-white flex items-center">
              <Shield className="h-5 w-5 mr-2 text-obsidian-300" />
              Détections Avancées
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-obsidian-100">Détections Basiques</h4>
                <ul className="text-white/60 text-sm space-y-1">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-obsidian-200 mr-2"></div>
                    Téléportation illégale
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-obsidian-200 mr-2"></div>
                    Noclip non autorisé
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-obsidian-200 mr-2"></div>
                    Vitesse de déplacement modifiée
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-obsidian-200 mr-2"></div>
                    Puissance de saut excessive
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-obsidian-200 mr-2"></div>
                    Vol non autorisé
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-obsidian-100">Détections Avancées</h4>
                <ul className="text-white/60 text-sm space-y-1">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-obsidian-300 mr-2"></div>
                    Auto-clicker
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-obsidian-300 mr-2"></div>
                    Animations illégales
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-obsidian-300 mr-2"></div>
                    Modification de l'espace de travail
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-obsidian-300 mr-2"></div>
                    Spam de messages
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-obsidian-300 mr-2"></div>
                    Détection d'exécuteur
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <h4 className="font-medium text-obsidian-100">Détections Spécifiques</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="text-white/60 text-sm space-y-1">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-obsidian-400 mr-2"></div>
                    Interfaces utilisateur illégales
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-obsidian-400 mr-2"></div>
                    Explosions ACS non autorisées
                  </li>
                </ul>
                <ul className="text-white/60 text-sm space-y-1">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-obsidian-400 mr-2"></div>
                    Musiques exploitées
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-obsidian-400 mr-2"></div>
                    Contournement du chat
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button variant="link" className="text-obsidian-100 hover:text-obsidian-200 p-0 h-auto">
                Voir toutes les détections <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
