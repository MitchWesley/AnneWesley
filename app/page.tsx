"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Camera, MessageCircle, Upload, X, Plus, Sparkles, Gift, Images, Brain } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { generateQRCodeURL } from "@/lib/qr-utils"

interface BirthdayPost {
  id: number
  name: string
  message: string
  image_urls: string[]
  created_at: string
}

// Floating balloon component
const FloatingBalloon = ({ delay = 0, color = "bg-green-400" }) => (
  <motion.div
    className={`absolute w-8 h-10 ${color} rounded-full opacity-70`}
    initial={{ y: "100vh", x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 800) }}
    animate={{
      y: "-20vh",
      x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 800),
    }}
    transition={{
      duration: 8 + Math.random() * 4,
      delay,
      repeat: Number.POSITIVE_INFINITY,
      ease: "linear",
    }}
  >
    <div className="w-full h-full rounded-full shadow-lg"></div>
    <div className="absolute bottom-0 left-1/2 w-px h-8 bg-gray-400 transform -translate-x-1/2"></div>
  </motion.div>
)

// Confetti component
const Confetti = () => {
  const confettiPieces = Array.from({ length: 50 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-sm"
      initial={{
        x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 800),
        y: -20,
        rotate: 0,
      }}
      animate={{
        y: (typeof window !== "undefined" ? window.innerHeight : 600) + 20,
        rotate: 360,
        x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 800),
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay: Math.random() * 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      }}
    />
  ))

  return <div className="fixed inset-0 pointer-events-none z-10">{confettiPieces}</div>
}

// Sparkle component
const SparkleEffect = ({ x, y }: { x: number; y: number }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: x, top: y }}
    initial={{ scale: 0, rotate: 0 }}
    animate={{ scale: [0, 1, 0], rotate: 360 }}
    transition={{ duration: 1 }}
  >
    <Sparkles className="w-6 h-6 text-yellow-400" />
  </motion.div>
)

export default function AnneBirthdayPage() {
  const [posts, setPosts] = useState<BirthdayPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sparkles, setSparkles] = useState<{ x: number; y: number; id: number }[]>([])

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    message: "",
  })
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])

  const siteURL = "https://annewesley.vercel.app/"
  const qrCodeURL = generateQRCodeURL(siteURL, 200)
  useEffect(() => {
    fetchPosts()
  }, [])

  // Add sparkles on mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (Math.random() > 0.95) {
      const newSparkle = {
        x: e.clientX,
        y: e.clientY,
        id: Date.now(),
      }
      setSparkles((prev) => [...prev.slice(-10), newSparkle])
      setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => s.id !== newSparkle.id))
      }, 1000)
    }
  }

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/birthday-posts")
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Limit to 5 images
    const newFiles = [...selectedImages, ...files].slice(0, 5)
    setSelectedImages(newFiles)

    // Create preview URLs
    const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file))
    setImagePreviewUrls(newPreviewUrls)
  }

  const removeImage = (index: number) => {
    const newFiles = selectedImages.filter((_, i) => i !== index)
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index)

    setSelectedImages(newFiles)
    setImagePreviewUrls(newPreviewUrls)
  }

  const uploadImages = async (): Promise<string[]> => {
    const uploadPromises = selectedImages.map(async (file) => {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Failed to upload image")

      const data = await response.json()
      return data.url
    })

    return Promise.all(uploadPromises)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Upload images first
      const imageUrls = selectedImages.length > 0 ? await uploadImages() : []

      // Create the post
      const response = await fetch("/api/birthday-posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          message: formData.message,
          imageUrls,
        }),
      })

      if (!response.ok) throw new Error("Failed to create post")

      // Reset form and refresh posts
      setFormData({ name: "", message: "" })
      setSelectedImages([])
      setImagePreviewUrls([])
      setShowForm(false)
      fetchPosts()
    } catch (error) {
      console.error("Error submitting post:", error)
      alert("There was an error submitting your post. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Floating Balloons */}
        {Array.from({ length: 8 }, (_, i) => (
          <FloatingBalloon
            key={i}
            delay={i * 2}
            color={["bg-green-400", "bg-emerald-500", "bg-teal-400", "bg-lime-400", "bg-yellow-400"][i % 5]}
          />
        ))}
      </div>

      {/* Confetti */}
      <Confetti />

      {/* Sparkles */}
      {sparkles.map((sparkle) => (
        <SparkleEffect key={sparkle.id} x={sparkle.x} y={sparkle.y} />
      ))}

      {/* Header Section */}
      <motion.div
        className="text-center py-16 px-4 relative z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Decorative Elements */}
        <motion.div
          className="absolute top-10 left-10 text-6xl"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          🎈
        </motion.div>
        <motion.div
          className="absolute top-20 right-10 text-6xl"
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY }}
        >
          🎂
        </motion.div>
        <motion.div
          className="absolute top-32 left-1/4 text-4xl"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        >
          ✨
        </motion.div>
        <motion.div
          className="absolute top-40 right-1/4 text-4xl"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          🎉
        </motion.div>

        <motion.div
          className="mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <motion.h1
            className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent mb-4 drop-shadow-lg"
            animate={{
              textShadow: [
                "0 0 20px rgba(34, 197, 94, 0.5)",
                "0 0 40px rgba(34, 197, 94, 0.8)",
                "0 0 20px rgba(34, 197, 94, 0.5)",
              ],
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            Happy 60th Birthday
          </motion.h1>
          <motion.h2
            className="text-4xl md:text-6xl font-bold text-green-800 mb-8 relative"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            Anne! 🎉
            <motion.div
              className="absolute -top-4 -right-4 text-3xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              🌟
            </motion.div>
          </motion.h2>
        </motion.div>

        {/* Anne's Photo with Fun Border */}
        <motion.div
          className="relative w-64 h-64 mx-auto mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 150 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 p-2"
            
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <div className="w-full h-full rounded-full overflow-hidden shadow-2xl border-8 border-white bg-white">
              <Image
                src="/AnneMitch.png?height=256&width=256"
                alt="Anne's Birthday Photo"
                width={256}
                height={256}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
          {/* Floating hearts around photo */}
          {Array.from({ length: 6 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              style={{
                top: `${43 + Math.sin((i * Math.PI) / 3) * 50}%`,
                left: `${43 + Math.cos((i * Math.PI) / 3) * 50}%`,
              }}
              animate={{
                y: [0, -10, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2 + i * 0.2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.3,
              }}
            >
              💚
            </motion.div>
          ))}
        </motion.div>

        {/* QR Code Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            className="inline-block p-6 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-green-200 relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
          >
            {/* Animated background pattern */}
            <motion.div
              className="absolute inset-0 opacity-5"
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              style={{
                backgroundImage:
                  'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" fontSize="90">🎈</text></svg>\')',
                backgroundSize: "30px 30px",
              }}
            />

            <div className="relative z-10 text-center">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
              >
                <Image
                  src={qrCodeURL || "/placeholder.svg"}
                  alt="QR Code to Birthday Website"
                  width={200}
                  height={200}
                  className="mx-auto rounded-2xl shadow-lg border-4 border-green-100"
                />
              </motion.div>
              <p className="text-lg font-semibold text-green-700 mt-4 mb-2">📱 Scan to Join the Celebration!</p>
              <p className="text-sm text-gray-600">Share this QR code so everyone can add their birthday wishes</p>
            </div>
          </motion.div>
        </motion.div>
        {/* Info Message with Enhanced Styling */}
        <motion.div
          className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-4 border-green-200 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
        >
          {/* Animated background pattern */}
          <motion.div
            className="absolute inset-0 opacity-10"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            style={{
              backgroundImage:
                'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" fontSize="90">🎈</text></svg>\')',
              backgroundSize: "50px 50px",
            }}
          />

          <div className="relative z-10">
            <motion.div
              className="flex items-center justify-center mb-4"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <Heart className="w-8 h-8 text-green-500 mr-3" />
              <MessageCircle className="w-8 h-8 text-emerald-500 mr-3" />
              <Camera className="w-8 h-8 text-teal-500" />
            </motion.div>
            <p className="text-xl text-gray-700 mb-6 font-medium">
              Leave a post wishing Anne a happy birthday message and share your best/funniest photos with her!
            </p>
            <motion.button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
              <span className="relative z-10 flex items-center">
                <Plus className="w-6 h-6 inline mr-2" />
                Add Your Birthday Message
                <Gift className="w-6 h-6 inline ml-2" />
              </span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* Posts Section */}
      <div className="max-w-4xl mx-auto px-4 pb-16 relative z-20">
        {loading ? (
          <div className="text-center py-12">
            <motion.div
              className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
            <p className="text-xl text-gray-600">Loading birthday messages...</p>
          </div>
        ) : posts.length === 0 ? (
          <motion.div className="text-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}>
              <Heart className="w-16 h-16 text-green-400 mx-auto mb-4" />
            </motion.div>
            <p className="text-xl text-gray-600">Be the first to wish Anne a happy birthday!</p>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border-2 border-green-100 relative overflow-hidden group"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                {/* Animated background gradient */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  animate={{
                    background: [
                      "linear-gradient(45deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))",
                      "linear-gradient(45deg, rgba(16, 185, 129, 0.1), rgba(20, 184, 166, 0.1))",
                      "linear-gradient(45deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                />

                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {post.name.charAt(0).toUpperCase()}
                    </motion.div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-lg text-gray-800">{post.name}</h3>
                      <p className="text-sm text-gray-500">{formatDate(post.created_at)}</p>
                    </div>
                    <motion.div
                      className="ml-auto text-2xl"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                    >
                      🎈
                    </motion.div>
                  </div>

                  <motion.p
                    className="text-gray-700 mb-4 text-lg leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {post.message}
                  </motion.p>

                  {post.image_urls && post.image_urls.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {post.image_urls.map((url, imgIndex) => (
                        <motion.div
                          key={imgIndex}
                          className="relative aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-green-100"
                          whileHover={{ scale: 1.05, rotate: 1 }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: imgIndex * 0.1 }}
                        >
                          <Image
                            src={url || "/placeholder.svg"}
                            alt={`Photo from ${post.name}`}
                            fill
                            className="object-cover"
                          />
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-t from-green-500/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"
                            whileHover={{ opacity: 1 }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-4">
        {/* Photo Gallery Button */}
        <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.5 }}>
          <Link href="/photos">
            <motion.div
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-full shadow-2xl hover:shadow-green-200 transition-all duration-300 group relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Images className="w-6 h-6" />
              <motion.div
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                {posts.reduce((total, post) => total + (post.image_urls?.length || 0), 0)}
              </motion.div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Trivia Button */}
        <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.7 }}>
          <Link href="/trivia">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-200 transition-all duration-300 group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Brain className="w-6 h-6" />
            </motion.div>
          </Link>
        </motion.div>
      </div>

      {/* Form Modal with Enhanced Styling */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-green-200 relative"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
            >
              {/* Decorative elements */}
              <motion.div
                className="absolute top-4 left-4 text-2xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                🎉
              </motion.div>
              <motion.div
                className="absolute top-4 right-16 text-2xl"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              >
                🎈
              </motion.div>

              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Share Your Birthday Message
                </h3>
                <motion.button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full p-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                    placeholder="Enter your name"
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Birthday Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={4}
                    className="w-full p-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                    placeholder="Write your birthday message for Anne..."
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photos (Optional - up to 5)</label>
                  <div className="border-2 border-dashed border-green-300 rounded-xl p-6 text-center bg-green-50/50 hover:bg-green-50 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <motion.label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Upload className="w-12 h-12 text-green-500 mb-2" />
                      <p className="text-green-700 font-medium">Click to upload photos</p>
                    </motion.label>
                  </div>

                  {imagePreviewUrls.length > 0 && (
                    <motion.div
                      className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {imagePreviewUrls.map((url, index) => (
                        <motion.div
                          key={index}
                          className="relative"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Image
                            src={url || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            width={150}
                            height={150}
                            className="w-full h-32 object-cover rounded-xl border-2 border-green-200"
                          />
                          <motion.button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-lg"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <X className="w-4 h-4" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>

                <div className="flex gap-4">
                  <motion.button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-3 px-6 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-xl transition-all duration-300 disabled:opacity-50 font-semibold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center">
                        <motion.div
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        />
                        Posting...
                      </span>
                    ) : (
                      "Post Message 🎉"
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
