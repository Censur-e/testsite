"use client"

import { motion } from "framer-motion"
import { useRef } from "react"
import {
  Shield,
  Eye,
  Zap,
  Lock,
  Code,
  Award,
  AlertTriangle,
  Search,
  Cpu,
  Fingerprint,
  Layers,
  Radar,
  ScanEye,
  Table,
  CopyX,
  History,
  ArrowRight,
  Gamepad,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import BackgroundPaths from "@/components/kokonutui/background-paths"

// Remplacer la section Hero par le composant BackgroundPaths
export default function FeaturePageClient() {
  const containerRef = useRef<HTMLDivElement>(null)

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.1 * i,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  }

  const detectionCategories = [
    {
      title: "Détections Basiques",
      icon: <Shield className="h-6 w-6 text-obsidian-100" />,
      description: "Fonctionnalités essentielles pour protéger votre jeu contre les exploits les plus courants.",
      features: [
        {
          name: "Téléportation illégale",
          icon: <Zap className="text-white" size={18} />,
          description: "Détecte les joueurs qui se téléportent à des positions non autorisées ou de manière suspecte.",
        },
        {
          name: "Noclip non autorisé",
          icon: <Layers className="text-white" size={18} />,
          description: "Identifie les joueurs qui traversent les murs ou les objets solides sans permission.",
        },
        {
          name: "Vitesse de déplacement modifiée",
          icon: <Zap className="text-white" size={18} />,
          description: "Repère les joueurs qui se déplacent plus rapidement que les limites définies par le jeu.",
        },
        {
          name: "Puissance de saut excessive",
          icon: <Zap className="text-white" size={18} />,
          description: "Détecte les joueurs qui sautent plus haut ou plus loin que les paramètres normaux.",
        },
        {
          name: "Vol non autorisé",
          icon: <Layers className="text-white" size={18} />,
          description: "Identifie les joueurs qui volent sans avoir accès à cette capacité.",
        },
      ],
    },
    {
      title: "Détections Avancées",
      icon: <Cpu className="h-6 w-6 text-obsidian-300" />,
      description: "Algorithmes sophistiqués pour détecter les méthodes de triche plus subtiles et avancées.",
      features: [
        {
          name: "Auto-clicker",
          icon: <Fingerprint className="text-white" size={18} />,
          description: "Détecte les modèles de clic non humains et les scripts automatisés.",
        },
        {
          name: "Animations illégales",
          icon: <Eye className="text-white" size={18} />,
          description: "Identifie les animations de personnage modifiées ou non standard.",
        },
        {
          name: "Modification de l'espace de travail",
          icon: <Code className="text-white" size={18} />,
          description: "Détecte les tentatives de modification du code ou des ressources du jeu.",
        },
        {
          name: "Spam de messages",
          icon: <AlertTriangle className="text-white" size={18} />,
          description: "Identifie et bloque les tentatives de spam dans le chat ou les systèmes de communication.",
        },
        {
          name: "Détection d'exécuteur",
          icon: <Search className="text-white" size={18} />,
          description: "Repère les logiciels d'injection de scripts et les exécuteurs externes.",
        },
        {
          name: "Détection de vol de map",
          icon: <CopyX className="text-white" size={18} />,
          description: "Identifie directement une methode vol de map.",
        },
        {
          name: "Hook Metatable",
          icon: <Table className="text-white" size={18} />,
          description: "Identifie une action illégal sur une métatable.",
        },
      ],
    },
    {
      title: "NOUVEAU - Détections Injection",
      icon: <ScanEye className="h-6 w-6 text-obsidian-500" />,
      description: "Protection ciblées contre les injections de script et injection d'executeur",
      features: [
        {
          name: "Detection avancée",
          icon: <Shield className="text-white" size={18} />,
          description: "Détecte une injection de script illégal ou bien même une injection d'un executeur.",
        },
      ],
    },
    {
      title: "Détections Spécifiques",
      icon: <Radar className="h-6 w-6 text-obsidian-500" />,
      description: "Protections ciblées contre des exploits spécifiques et des vulnérabilités connues.",
      features: [
        {
          name: "Interfaces utilisateur illégales",
          icon: <Layers className="text-white" size={18} />,
          description: "Détecte les interfaces utilisateur modifiées ou injectées qui donnent un avantage injuste.",
        },
        {
          name: "Explosions ACS non autorisées",
          icon: <AlertTriangle className="text-white" size={18} />,
          description: "Identifie les explosions ou effets spéciaux générés sans autorisation.",
        },
        {
          name: "Musiques exploitées",
          icon: <AlertTriangle className="text-white" size={18} />,
          description: "Détecte la lecture de sons ou de musiques non autorisés qui peuvent perturber le jeu.",
        },
        {
          name: "Contournement du chat",
          icon: <Lock className="text-white" size={18} />,
          description: "Identifie les tentatives de contournement des filtres de chat ou de modération.",
        },
        {
          name: "Manipulation de données",
          icon: <Cpu className="text-white" size={18} />,
          description: "Détecte les tentatives de modification des données du jeu ou des statistiques des joueurs.",
        },
        {
          name: "NOUVEAU -  Changement de la version",
          icon: <History className="text-white" size={18} />,
          description: "Détecte lorsqu'un joueur n'a pas la version officiel actuelle ce qui peut être utiliser pour contrer une mise à jour.",
        },
        {
          name: "NOUVEAU - Emulateur Detection",
          icon: <Gamepad className="text-white" size={18} />,
          description: "Permet de detecter tout joueur qui pourrait jouer sur un logiciel d'émulation ce qui peut être utiliser pour utiliser des executeurs mobiles.",
        },
      ],
    },
  ]

  return (
    <main className="min-h-screen bg-[#030303]">
      {/* Hero Section with BackgroundPaths */}
      <section className="relative">
        <BackgroundPaths title="Protection Complète" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-4 md:px-6 relative z-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.5 }}
              className="mt-32" // Augmenter la marge supérieure de mt-8 à mt-32
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-obsidian-300 to-obsidian-500 hover:from-obsidian-400 hover:to-obsidian-500 text-white border-none"
                asChild
              >
                <Link href="/">
                  <ArrowRight className="mr-2 h-5 w-5 rotate-180" /> Retour à l'accueil
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-100/[0.03] to-obsidian-500/[0.03]" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-obsidian-100/10 to-obsidian-500/10 rounded-2xl p-8 border border-white/[0.08] shadow-xl shadow-obsidian-300/5"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-obsidian-100 to-white">
                Pourquoi la Détection est Cruciale
              </h2>
              <p className="text-white/60 mb-6">
                Les tricheurs peuvent ruiner l'expérience de jeu pour tous les joueurs, entraînant une baisse de
                l'engagement et de la rétention. Obsidian offre une solution complète qui:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <div className="bg-obsidian-100/20 p-2 rounded-lg mr-3 flex-shrink-0">
                    <Eye className="h-5 w-5 text-obsidian-100" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Détection en Temps Réel</h3>
                    <p className="text-white/40">
                      Identifie les comportements suspects instantanément, avant qu'ils n'affectent votre jeu.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-obsidian-200/20 p-2 rounded-lg mr-3 flex-shrink-0">
                    <Zap className="h-5 w-5 text-obsidian-200" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Réponse Automatique</h3>
                    <p className="text-white/40">
                      Prend des mesures immédiates contre les tricheurs, de l'avertissement à l'expulsion.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-obsidian-300/20 p-2 rounded-lg mr-3 flex-shrink-0">
                    <Lock className="h-5 w-5 text-obsidian-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Protection Adaptative</h3>
                    <p className="text-white/40">Évolue constamment pour contrer les nouvelles méthodes de triche.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-obsidian-400/20 p-2 rounded-lg mr-3 flex-shrink-0">
                    <Code className="h-5 w-5 text-obsidian-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Intégration Transparente</h3>
                    <p className="text-white/40">Fonctionne en arrière-plan sans impact sur les performances du jeu.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Detailed Features */}
      <section ref={containerRef} className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-obsidian-500/[0.03] to-obsidian-100/[0.03]" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-obsidian-100 via-white to-obsidian-500">
              Fonctionnalités de Détection Complètes
            </h2>
            <p className="text-white/40 max-w-2xl mx-auto">
              Obsidian offre une suite complète de détections pour protéger votre jeu contre tous les types de triche et
              d'exploitation.
            </p>
          </motion.div>

          <div className="space-y-20">
            {detectionCategories.map((category, categoryIndex) => (
              <motion.div
                key={category.title}
                custom={categoryIndex}
                variants={fadeInUpVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-8 hover:bg-gradient-to-br hover:from-obsidian-100/5 hover:to-obsidian-500/5 transition-all duration-500"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
                  <div className="bg-gradient-to-br from-obsidian-100/20 to-obsidian-500/20 p-4 rounded-lg w-fit">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{category.title}</h3>
                    <p className="text-white/60 max-w-3xl">{category.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.features.map((feature, featureIndex) => (
                    <motion.div
                      key={feature.name}
                      custom={featureIndex + 1}
                      variants={fadeInUpVariants}
                      className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-5 hover:bg-gradient-to-br hover:from-obsidian-100/10 hover:to-obsidian-500/10 hover:border-obsidian-300/30 transition-all duration-300 group"
                    >
                      <div className="flex items-center mb-3">
                        <div
                          className={cn(
                            "p-2 rounded-md mr-3 transition-colors duration-300",
                            "bg-obsidian-100/10 group-hover:bg-obsidian-100/20",
                          )}
                        >
                          <div className="text-obsidian-100 group-hover:text-obsidian-200 transition-colors duration-300">
                            {feature.icon}
                          </div>
                        </div>
                        <h4 className="font-medium text-white group-hover:text-obsidian-100 transition-colors duration-300">
                          {feature.name}
                        </h4>
                      </div>
                      <p className="text-white/40 text-sm group-hover:text-white/60 transition-colors duration-300">
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-100/[0.05] via-transparent to-obsidian-500/[0.05]" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-gradient-to-br from-obsidian-100/10 to-obsidian-500/10 rounded-2xl p-8 md:p-12 border border-white/[0.08] shadow-xl shadow-obsidian-300/5 text-center"
          >
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-obsidian-500/20 mb-6">
              <Award className="w-6 h-6 text-obsidian-100" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-obsidian-100 via-white to-obsidian-500">
              Prêt à Sécuriser Votre Jeu?
            </h2>
            <p className="text-white/60 mb-8 max-w-2xl mx-auto">
              Rejoignez les développeurs qui font confiance à Obsidian pour protéger leurs jeux Roblox contre les
              tricheurs et offrir une expérience équitable à tous les joueurs.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-obsidian-300 to-obsidian-500 hover:from-obsidian-400 hover:to-obsidian-500 text-white border-none"
                asChild
              >
                <Link href="/#beta-signup">Rejoindre la Bêta</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-obsidian-300/50 text-obsidian-100 bg-white/[0.03] backdrop-blur-sm hover:bg-obsidian-500/20 hover:border-obsidian-100 hover:text-white transition-all duration-300"
                asChild
              >
                <Link href="/">En Savoir Plus</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
