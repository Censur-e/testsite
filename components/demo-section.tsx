"use client"

import { useState, useRef, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VideoData {
  id: number
  src: string
  title: string
  description: string
  category: "detection" | "prevention" | "analytique"
}

// Données des vidéos
const videosData: VideoData[] = [
  {
    id: 1,
    src: "/videos/1.mp4",
    title: "Detection d'Emote Illégal",
    description: "Voyez comment Obsidian identifie les émotes qu'il considère comme illégal.",
    category: "detection",
  },
  {
    id: 2,
    src: "/videos/2.mp4",
    title: "Detection d'injection de script",
    description: "Découvrez comment Obsidian detecte avec un algorithme les injections de script illégals.",
    category: "detection",
  },
  {
    id: 3,
    src: "/videos/3.mp4",
    title: "Analyse des changement de Workspace",
    description: "Voyez comment Obsidian Workspace pour evitez toute modification illégal.",
    category: "analytique"
  },
  {
    id: 4,
    src: "/videos/4.mp4",
    title: "Detection Mode God",
    description: "Découvrez comment Obsidian detecte le God ( PV = Infini ).",
    category: "detection"
  },
  {
    id: 5,
    src: "/videos/5.mp4",
    title: "Detection ESP",
    description: "Voyez comment Obsidian arrive à detecter la plupart des ESP.",
    category: "detection"
  },
  {
    id: 6,
    src: "/videos/6.mp4",
    title: "Prévention de Copy de Map",
    description: "Voyez comment Obsidian préviens au copy de Map ( SaveInstance ).",
    category: "prevention"
  },
  {
    id: 7,
    src: "/videos/7.mp4",
    title: "Detection Injection Executeur",
    description: "Découvrez comment Obsidian detecte l'injection d'un executeur en jeu.",
    category: "detection"
  },
  {
    id: 8,
    src: "/videos/8.mp4",
    title: "Analyse des cliques",
    description: "Voyez comment Obsidian vérifie les cliques pour prévenir un potentiel auto-clicker.",
    category: "analytique"
  },
  {
    id: 9,
    src: "/videos/9.mp4",
    title: "Detection Freecam",
    description: "Voyez comment Obsidian detecte les freecams d'exploiteurs.",
    category: "detection"
  },
]

export default function DemoSection() {
  const [activeTab, setActiveTab] = useState<"detection" | "prevention" | "analytique">("detection")
  const [activeVideoId, setActiveVideoId] = useState<number>(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8])

  // Filtrer les vidéos par catégorie active
  const filteredVideos = videosData.filter((video) => video.category === activeTab)

  // Trouver la vidéo active
  const activeVideo = videosData.find((video) => video.id === activeVideoId) || filteredVideos[0]

  // Gérer le changement d'onglet
  useEffect(() => {
    // Sélectionner la première vidéo de la catégorie
    const firstVideoInCategory = filteredVideos[0]
    if (firstVideoInCategory) {
      setActiveVideoId(firstVideoInCategory.id)
    }

    // Pause la vidéo
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [activeTab])

  // Gérer le changement de vidéo
  useEffect(() => {
    // Pause la vidéo
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }, [activeVideoId])

  // Gérer la lecture/pause de la vidéo
  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Navigation entre les vidéos
  const goToNextVideo = () => {
    const currentIndex = filteredVideos.findIndex((v) => v.id === activeVideoId)
    if (currentIndex < filteredVideos.length - 1) {
      setActiveVideoId(filteredVideos[currentIndex + 1].id)
    } else {
      // Revenir à la première vidéo
      setActiveVideoId(filteredVideos[0].id)
    }
  }

  const goToPrevVideo = () => {
    const currentIndex = filteredVideos.findIndex((v) => v.id === activeVideoId)
    if (currentIndex > 0) {
      setActiveVideoId(filteredVideos[currentIndex - 1].id)
    } else {
      // Aller à la dernière vidéo
      setActiveVideoId(filteredVideos[filteredVideos.length - 1].id)
    }
  }

  return (
    <section id="demo-section" ref={sectionRef} className="py-20 bg-[#030303] relative">
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian-100/[0.03] to-obsidian-500/[0.03]" />

      <motion.div style={{ opacity, scale }} className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-obsidian-100 via-white to-obsidian-500">
            Voyez Obsidian en Action
          </h2>
          <p className="text-white/40 max-w-2xl mx-auto">
            Découvrez comment notre anti-cheat détecte et neutralise les menaces en temps réel pour protéger votre jeu
            Roblox.
          </p>
          <a
            href="https://www.roblox.com/fr/games/135185023723160/Obsidian-Anti-Cheat-Test"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-obsidian-100 hover:text-obsidian-200 transition-colors"
          >
            Essayez notre jeu de test Obsidian Anti-Cheat sur Roblox →
          </a>
        </div>

        <div className="max-w-5xl mx-auto">
          <Tabs
            defaultValue="detection"
            className="w-full"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "detection" | "prevention" | "analytique")}
          >
            <TabsList className="grid w-full grid-cols-3 bg-white/[0.03] border border-white/[0.08] rounded-lg mb-8">
              <TabsTrigger
                value="detection"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-obsidian-100/20 data-[state=active]:to-obsidian-500/20"
              >
                Détection
              </TabsTrigger>
              <TabsTrigger
                value="prevention"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-obsidian-100/20 data-[state=active]:to-obsidian-500/20"
              >
                Prévention
              </TabsTrigger>
              <TabsTrigger
                value="analytique"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-obsidian-100/20 data-[state=active]:to-obsidian-500/20"
              >
                Analytique
              </TabsTrigger>
            </TabsList>

            <div className="relative">
              <motion.div
                key={activeVideoId} // Pour réinitialiser l'animation lors du changement de vidéo
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative aspect-video bg-gradient-to-br from-obsidian-100/20 to-obsidian-500/20 rounded-xl overflow-hidden border border-white/[0.08]"
              >
                {activeVideo && (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      src={activeVideo.src}
                      muted
                      playsInline
                      loop
                      onEnded={() => setIsPlaying(false)}
                    />

                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] transition-opacity duration-300"
                      style={{ opacity: isPlaying ? 0 : 1 }}
                    >
                      <div
                        className={cn(
                          "w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center cursor-pointer",
                          "hover:bg-gradient-to-r hover:from-obsidian-100/30 hover:to-obsidian-500/30 transition-all duration-300",
                        )}
                        onClick={toggleVideo}
                      >
                        {isPlaying ? (
                          <Pause className="w-8 h-8 text-white" />
                        ) : (
                          <Play className="w-8 h-8 text-white ml-1" />
                        )}
                      </div>
                    </div>

                    <div
                      className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent"
                      style={{ opacity: isPlaying ? 0.7 : 1 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-medium text-white">{activeVideo.title}</h3>

                        {/* Indicateur de vidéo actuelle */}
                        {filteredVideos.length > 1 && (
                          <div className="flex items-center space-x-1">
                            {filteredVideos.map((video, index) => (
                              <div
                                key={video.id}
                                className={cn(
                                  "w-2 h-2 rounded-full transition-all duration-300",
                                  video.id === activeVideoId
                                    ? "bg-obsidian-100 w-4"
                                    : "bg-white/30 hover:bg-white/50 cursor-pointer",
                                )}
                                onClick={() => setActiveVideoId(video.id)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-white/70 text-sm">{activeVideo.description}</p>
                    </div>

                    {/* Bouton flottant pour pause quand la vidéo est en lecture */}
                    {isPlaying && (
                      <div
                        className="absolute bottom-4 right-4 p-3 rounded-full bg-obsidian-500/50 backdrop-blur-sm cursor-pointer hover:bg-obsidian-400/60 transition-all duration-300"
                        onClick={toggleVideo}
                      >
                        <Pause className="w-5 h-5 text-white" />
                      </div>
                    )}

                    {/* Navigation entre les vidéos */}
                    {filteredVideos.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-obsidian-500/40 backdrop-blur-sm rounded-full w-10 h-10"
                          onClick={goToPrevVideo}
                        >
                          <ChevronLeft className="h-6 w-6 text-white" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-obsidian-500/40 backdrop-blur-sm rounded-full w-10 h-10"
                          onClick={goToNextVideo}
                        >
                          <ChevronRight className="h-6 w-6 text-white" />
                        </Button>
                      </>
                    )}
                  </>
                )}

                {/* Affichage pour l'onglet "Soon" */}
                {/*{activeTab === "analytique" && (*/}
                {/*  <div className="absolute inset-0 flex flex-col items-center justify-center">*/}
                {/*    <div className="bg-obsidian-500/20 p-4 rounded-full mb-4">*/}
                {/*      <svg*/}
                {/*        className="w-12 h-12 text-obsidian-100"*/}
                {/*        xmlns="http://www.w3.org/2000/svg"*/}
                {/*        fill="none"*/}
                {/*        viewBox="0 0 24 24"*/}
                {/*        stroke="currentColor"*/}
                {/*      >*/}
                {/*        <path*/}
                {/*          strokeLinecap="round"*/}
                {/*          strokeLinejoin="round"*/}
                {/*          strokeWidth={1.5}*/}
                {/*          d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"*/}
                {/*        />*/}
                {/*      </svg>*/}
                {/*    </div>*/}
                {/*    <h3 className="text-xl font-medium text-white mb-2">Tableau de bord analytique</h3>*/}
                {/*    <p className="text-white/60 text-center max-w-md px-4">*/}
                {/*      Cette fonctionnalité sera bientôt disponible. Restez à l'affût pour des analyses détaillées et des*/}
                {/*      statistiques sur les tentatives de triche.*/}
                {/*    </p>*/}
                {/*  </div>*/}
                {/*)}*/}
              </motion.div>
            </div>
          </Tabs>
        </div>
      </motion.div>
    </section>
  )
}

