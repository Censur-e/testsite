"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Shield, Sparkles, Users, ArrowRight, Check, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

interface ProductCountData {
  total: number
  remaining: number
  lastUpdated: string
}

export default function BetaSignupSection() {
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [experience, setExperience] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [productData, setProductData] = useState<ProductCountData>({
    total: 100,
    remaining: 100,
    lastUpdated: new Date().toISOString(),
  })
  const [isLoadingCount, setIsLoadingCount] = useState(true)

  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.9, 1, 1, 0.9])

  useEffect(() => {
    // Charger le compteur de produits au chargement de la page
    fetchProductCount()
  }, [])

  // Update the fetchProductCount function to handle errors better
  const fetchProductCount = async () => {
    setIsLoadingCount(true)
    try {
      const timestamp = new Date().getTime() // Ajouter un timestamp pour éviter le cache
      const response = await fetch(`/api/product-count?t=${timestamp}`)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Expected JSON response but got ${contentType}`)
      }

      const data = await response.json()
      console.log("Données du compteur récupérées:", data)
      setProductData(data)
    } catch (error) {
      console.error("Erreur lors de la récupération du compteur:", error)
      // Use default values if there's an error
      setProductData({
        total: 100,
        remaining: 100,
        lastUpdated: new Date().toISOString(),
      })
    } finally {
      setIsLoadingCount(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState("submitting")
    setErrorMessage("")

    // Vérifier s'il reste des places
    if (productData.remaining <= 0) {
      setFormState("error")
      setErrorMessage("Désolé, toutes les places pour la bêta ont été attribuées.")
      return
    }

    try {
      // Envoyer les données au webhook Discord
      const response = await fetch("/api/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          experience,
        }),
      })

      if (!response.ok) {
        throw new Error(`Erreur lors de l'envoi (${response.status})`)
      }

      // Mettre à jour le compteur local
      const data = await response.json()
      if (data.remaining !== undefined) {
        setProductData((prev) => ({
          ...prev,
          remaining: data.remaining,
        }))
      }

      setFormState("success")
      // Réinitialiser le formulaire
      setUsername("")
      setEmail("")
      setExperience("")
    } catch (error) {
      console.error("Erreur lors de l'envoi du formulaire:", error)
      setFormState("error")
      setErrorMessage(error instanceof Error ? error.message : "Une erreur est survenue")
    }
  }

  // Calculer le pourcentage de places prises
  const percentageTaken = ((productData.total - productData.remaining) / productData.total) * 100

  return (
    <section id="beta-signup" ref={sectionRef} className="py-20 bg-[#030303] relative">
      <div className="absolute inset-0 bg-gradient-to-br from-obsidian-100/[0.05] via-transparent to-obsidian-500/[0.05]" />

      <motion.div style={{ opacity, scale }} className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-1.5 rounded-full bg-obsidian-500/20 mb-4">
              <Sparkles className="w-5 h-5 text-obsidian-100" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-obsidian-100 via-white to-obsidian-500">
              Rejoignez la Bêta Exclusive
            </h2>
            <p className="text-white/40 max-w-2xl mx-auto">
              Soyez parmi les premiers à tester Obsidian et à contribuer à son développement. Les places sont limitées !
            </p>

            {!isLoadingCount && (
              <div className="mt-6 max-w-md mx-auto">
                <div className="flex justify-between text-sm text-white/60 mb-2">
                  <span>Places disponibles</span>
                  <span className="font-medium text-obsidian-100">
                    {productData.remaining} / {productData.total}
                  </span>
                </div>
                <Progress value={percentageTaken} className="h-2 bg-white/10" />
                {productData.remaining <= 10 && (
                  <p className="text-amber-400 text-sm mt-2">
                    {productData.remaining === 0
                      ? "Toutes les places ont été attribuées !"
                      : `Plus que ${productData.remaining} place${productData.remaining > 1 ? "s" : ""} disponible${productData.remaining > 1 ? "s" : ""} !`}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-br from-obsidian-100/20 to-obsidian-500/20 p-2 rounded-lg mr-3">
                    <Shield className="h-5 w-5 text-obsidian-100" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Accès Anticipé</h3>
                </div>
                <p className="text-white/60 mb-4">
                  Obtenez un accès exclusif aux dernières fonctionnalités avant tout le monde et façonnez l'avenir
                  d'Obsidian.
                </p>
                <ul className="space-y-2">
                  {[
                    "Accès à toutes les fonctionnalités premium",
                    "Support prioritaire de l'équipe",
                    "Influence sur le développement futur",
                    "Badge exclusif de testeur bêta",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-obsidian-300 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-white/60">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-br from-obsidian-100/20 to-obsidian-500/20 p-2 rounded-lg mr-3">
                    <Users className="h-5 w-5 text-obsidian-200" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Communauté Exclusive</h3>
                </div>
                <p className="text-white/60">
                  Rejoignez notre serveur Discord privé pour échanger avec d'autres testeurs et l'équipe de
                  développement d'Obsidian.
                </p>
              </div>
            </div>

            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-obsidian-100/10 to-obsidian-500/10 rounded-2xl p-8 border border-white/[0.08] shadow-xl shadow-obsidian-300/5 backdrop-blur-sm"
              >
                {formState === "success" ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-obsidian-100/30 to-obsidian-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check className="h-8 w-8 text-obsidian-100" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Inscription Réussie !</h3>
                    <p className="text-white/60 mb-6">
                      Merci de votre intérêt pour Obsidian. Nous vous contacterons bientôt avec les détails d'accès à la
                      bêta.
                    </p>
                    <Button
                      onClick={() => setFormState("idle")}
                      variant="outline"
                      className="border-obsidian-300/50 text-obsidian-100 bg-white/[0.03] hover:bg-obsidian-500/20 hover:border-obsidian-100 hover:text-white transition-all duration-300"
                    >
                      Retour au formulaire
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Demande d'accès à la bêta</h3>

                    {formState === "error" && (
                      <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg flex items-start">
                        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <p>{errorMessage || "Une erreur est survenue. Veuillez réessayer."}</p>
                      </div>
                    )}

                    {productData.remaining <= 0 ? (
                      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 px-4 py-3 rounded-lg">
                        <p>
                          Toutes les places pour la bêta ont été attribuées. Inscrivez-vous pour être informé des
                          futures opportunités. Rejoignez-nous sur 
                          <a href="https://discord.gg/sFcAYQhcXR" style="color: #5865F2; text-decoration: underline;">Discord</a> !
                        </p>
                      </div>
                    ) : null}

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="username" className="block text-sm font-medium text-white/70 mb-1">
                          Nom d'utilisateur Roblox
                        </label>
                        <Input
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Votre nom d'utilisateur Roblox"
                          required
                          className="bg-white/[0.03] border-white/10 focus:border-obsidian-300 text-white placeholder:text-white/30"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1">
                          Email
                        </label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="votre@email.com"
                          required
                          className="bg-white/[0.03] border-white/10 focus:border-obsidian-300 text-white placeholder:text-white/30"
                        />
                      </div>

                      <div>
                        <label htmlFor="experience" className="block text-sm font-medium text-white/70 mb-1">
                          Expérience avec Roblox
                        </label>
                        <Textarea
                          id="experience"
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          placeholder="Décrivez brièvement votre expérience avec le développement Roblox et pourquoi vous souhaitez tester Obsidian."
                          required
                          className="bg-white/[0.03] border-white/10 focus:border-obsidian-300 text-white placeholder:text-white/30 min-h-[120px]"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={formState === "submitting" || productData.remaining <= 0}
                        className="w-full bg-gradient-to-r from-obsidian-300 to-obsidian-500 hover:from-obsidian-400 hover:to-obsidian-500 text-white border-none relative overflow-hidden group"
                      >
                        <span
                          className={cn(
                            "inline-flex items-center transition-transform duration-300",
                            formState === "submitting" ? "translate-y-10" : "translate-y-0",
                          )}
                        >
                          Rejoindre la Bêta{" "}
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </span>

                        {formState === "submitting" && (
                          <span className="absolute inset-0 flex items-center justify-center -translate-y-10 animate-in fade-in slide-in-from-bottom duration-300">
                            <svg
                              className="animate-spin h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          </span>
                        )}
                      </Button>
                    </div>

                    <p className="text-white/40 text-xs text-center">
                      En vous inscrivant, vous acceptez de recevoir des communications concernant la bêta d'Obsidian.
                      Nous ne partagerons jamais vos informations avec des tiers.
                    </p>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
