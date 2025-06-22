"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, ArrowLeft, Check, Square, CheckSquare, ImageIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface BirthdayPost {
  id: number
  name: string
  message: string
  image_urls: string[]
  created_at: string
}

interface PhotoItem {
  url: string
  postId: number
  posterName: string
  index: number
}

export default function PhotoGallery() {
  const [posts, setPosts] = useState<BirthdayPost[]>([])
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/birthday-posts")
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)

        // Extract all photos from posts
        const allPhotos: PhotoItem[] = []
        data.posts.forEach((post: BirthdayPost) => {
          if (post.image_urls && post.image_urls.length > 0) {
            post.image_urls.forEach((url: string, index: number) => {
              allPhotos.push({
                url,
                postId: post.id,
                posterName: post.name,
                index,
              })
            })
          }
        })
        setPhotos(allPhotos)
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const togglePhotoSelection = (photoUrl: string) => {
    const newSelected = new Set(selectedPhotos)
    if (newSelected.has(photoUrl)) {
      newSelected.delete(photoUrl)
    } else {
      newSelected.add(photoUrl)
    }
    setSelectedPhotos(newSelected)
  }

  const selectAllPhotos = () => {
    const allUrls = new Set(photos.map((photo) => photo.url))
    setSelectedPhotos(allUrls)
  }

  const deselectAllPhotos = () => {
    setSelectedPhotos(new Set())
  }

  const downloadSelectedPhotos = async () => {
    if (selectedPhotos.size === 0) return

    setDownloading(true)

    try {
      for (const photoUrl of selectedPhotos) {
        const photo = photos.find((p) => p.url === photoUrl)
        if (photo) {
          // Create a temporary link to download the image
          const response = await fetch(photoUrl)
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)

          const link = document.createElement("a")
          link.href = url
          link.download = `anne-birthday-photo-${photo.posterName}-${photo.index + 1}.jpg`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)

          // Small delay between downloads to avoid overwhelming the browser
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      }
    } catch (error) {
      console.error("Error downloading photos:", error)
      alert("There was an error downloading some photos. Please try again.")
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
          <p className="text-xl text-gray-600">Loading photos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            href="/"
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Birthday Messages
          </Link>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Anne's Birthday Photos
              </h1>
              <p className="text-gray-600 mt-2">
                {photos.length} photos • {selectedPhotos.size} selected
              </p>
            </div>

            {photos.length > 0 && (
              <div className="flex gap-3">
                <motion.button
                  onClick={selectedPhotos.size === photos.length ? deselectAllPhotos : selectAllPhotos}
                  className="px-4 py-2 border-2 border-green-500 text-green-600 rounded-xl hover:bg-green-50 transition-all duration-300 flex items-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {selectedPhotos.size === photos.length ? (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-4 h-4 mr-2" />
                      Select All
                    </>
                  )}
                </motion.button>

                <motion.button
                  onClick={downloadSelectedPhotos}
                  disabled={selectedPhotos.size === 0 || downloading}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  whileHover={{ scale: selectedPhotos.size > 0 ? 1.02 : 1 }}
                  whileTap={{ scale: selectedPhotos.size > 0 ? 0.98 : 1 }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {downloading ? `Downloading...` : `Download Selected (${selectedPhotos.size})`}
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Photos Grid */}
        {photos.length === 0 ? (
          <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No photos have been uploaded yet.</p>
            <p className="text-gray-500 mt-2">Photos will appear here as people add them to their birthday messages.</p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {photos.map((photo, index) => (
              <motion.div
                key={`${photo.postId}-${photo.index}`}
                className="relative group cursor-pointer"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => togglePhotoSelection(photo.url)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className={`relative aspect-square rounded-2xl overflow-hidden shadow-lg border-4 transition-all duration-300 ${
                    selectedPhotos.has(photo.url)
                      ? "border-green-500 shadow-green-200"
                      : "border-green-100 hover:border-green-300"
                  }`}
                >
                  <Image
                    src={photo.url || "/placeholder.svg"}
                    alt={`Photo from ${photo.posterName}`}
                    fill
                    className="object-cover"
                  />

                  {/* Selection Overlay */}
                  <AnimatePresence>
                    {selectedPhotos.has(photo.url) && (
                      <motion.div
                        className="absolute inset-0 bg-green-500/20 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <motion.div
                          className="bg-green-500 text-white rounded-full p-2"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Check className="w-6 h-6" />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                </div>

                {/* Photo Info */}
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium text-gray-700">{photo.posterName}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
