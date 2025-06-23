"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Trophy, Medal, Award, ArrowLeft, RefreshCw, Bug } from "lucide-react"
import Link from "next/link"

interface TriviaSubmission {
  id: number
  name: string
  score: number
  total_questions: number
  submitted_at: string
}

export default function TriviaResults() {
  const [submissions, setSubmissions] = useState<TriviaSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [apiTestInfo, setApiTestInfo] = useState<any>(null)

  const fetchResults = async (silent = false) => {
    if (!silent) setLoading(true)
    if (silent) setRefreshing(true)

    try {
      // Add cache-busting timestamp and random number
      const timestamp = Date.now()
      const random = Math.random()
      console.log(`Fetching trivia results with timestamp: ${timestamp}`)

      const response = await fetch(`/api/trivia/leaderboard?t=${timestamp}&r=${random}`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Received trivia leaderboard data:", data)
        setSubmissions(data.submissions || [])
      } else {
        console.error("Failed to fetch trivia results:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Error fetching trivia results:", error)
    } finally {
      if (!silent) setLoading(false)
      if (silent) setRefreshing(false)
    }
  }

  const fetchDebugInfo = async () => {
    try {
      const response = await fetch(`/api/debug-trivia?t=${Date.now()}`)
      if (response.ok) {
        const data = await response.json()
        setDebugInfo(data)
        console.log("Debug info:", data)
      }
    } catch (error) {
      console.error("Error fetching debug info:", error)
    }
  }

  const fetchApiTestInfo = async () => {
    try {
      const response = await fetch(`/api/trivia?t=${Date.now()}`)
      if (response.ok) {
        const data = await response.json()
        setApiTestInfo(data)
        console.log("API test info:", data)
      }
    } catch (error) {
      console.error("Error fetching API test info:", error)
    }
  }

  useEffect(() => {
    fetchResults()

    // Set up more frequent polling for real-time updates
    const interval = setInterval(() => {
      fetchResults(true)
    }, 15000) // Poll every 15 seconds

    return () => clearInterval(interval)
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <div className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">{index + 1}</div>
    }
  }

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "from-yellow-400 to-yellow-600"
      case 1:
        return "from-gray-300 to-gray-500"
      case 2:
        return "from-amber-400 to-amber-600"
      default:
        return "from-green-400 to-emerald-500"
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
          <p className="text-xl text-gray-600">Loading trivia results...</p>
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
            Back to Birthday Celebration
          </Link>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-center flex-1">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                className="text-6xl mb-4"
              >
                🏆
              </motion.div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                Trivia Leaderboard
              </h1>
              <p className="text-xl text-gray-600">
                {submissions.length} participant{submissions.length !== 1 ? "s" : ""} • Anne's Birthday Trivia
              </p>
            </div>

            <div className="flex gap-2">
              <motion.button
                onClick={fetchApiTestInfo}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl flex items-center transition-colors text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Test API
              </motion.button>

              <motion.button
                onClick={fetchDebugInfo}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bug className="w-5 h-5 mr-2" />
                Debug
              </motion.button>

              <motion.button
                onClick={() => fetchResults(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl flex items-center transition-colors"
                disabled={refreshing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Debug Info */}
        {(debugInfo || apiTestInfo) && (
          <motion.div
            className="max-w-4xl mx-auto mb-8 bg-blue-50 border-2 border-blue-200 rounded-2xl p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="font-bold text-blue-800 mb-2">Debug Information:</h3>

            {apiTestInfo && (
              <div className="mb-4 p-3 bg-purple-100 rounded-lg">
                <h4 className="font-semibold text-purple-800">API Test (/api/trivia):</h4>
                <p className="text-purple-700">Total: {apiTestInfo.totalSubmissions}</p>
                <p className="text-purple-700">All IDs: {apiTestInfo.allIds?.length || 0} records</p>
                <p className="text-purple-700">Recent: {apiTestInfo.recentSubmissions?.length || 0} records</p>
              </div>
            )}

            {debugInfo && (
              <div className="p-3 bg-blue-100 rounded-lg">
                <h4 className="font-semibold text-blue-800">Debug API (/api/debug-trivia):</h4>
                <p className="text-blue-700">Total: {debugInfo.totalSubmissions}</p>
                <p className="text-blue-700">All IDs: {debugInfo.debug?.allIdsCount || 0} records</p>
                <p className="text-blue-700">Recent: {debugInfo.debug?.recentCount || 0} records</p>
                <p className="text-blue-700">Leaderboard: {debugInfo.debug?.leaderboardCount || 0} records</p>
              </div>
            )}

            <div className="mt-3 p-3 bg-green-100 rounded-lg">
              <h4 className="font-semibold text-green-800">Current Display:</h4>
              <p className="text-green-700">Showing: {submissions.length} submissions</p>
            </div>
          </motion.div>
        )}

        {/* Rest of the component remains the same... */}
        {/* Leaderboard */}
        {submissions.length === 0 ? (
          <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No trivia submissions yet.</p>
            <p className="text-gray-500 mt-2">Results will appear here as people complete the trivia.</p>
          </motion.div>
        ) : (
          <motion.div
            className="max-w-4xl mx-auto space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {submissions.map((submission, index) => (
              <motion.div
                key={submission.id}
                className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border-2 border-green-100 relative overflow-hidden"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                {/* Rank gradient background */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${getRankColor(index)} opacity-5`}
                  animate={{
                    opacity: [0.05, 0.1, 0.05],
                  }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                />

                <div className="relative z-10 flex items-center">
                  {/* Rank */}
                  <motion.div className="mr-6 flex items-center justify-center" whileHover={{ scale: 1.1, rotate: 5 }}>
                    {getRankIcon(index)}
                  </motion.div>

                  {/* Participant Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{submission.name}</h3>
                    <div className="flex items-center text-gray-600 text-sm">
                      <span>
                        ID: {submission.id} • Submitted {formatDate(submission.submitted_at)}
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600 mb-1">{submission.score}</div>
                    <div className="text-sm text-gray-500">
                      {Math.round((submission.score / (submission.total_questions * 2)) * 100)}% correct
                    </div>
                  </div>
                </div>

                {/* Top 3 special effects */}
                {index < 3 && (
                  <motion.div
                    className="absolute top-2 right-2"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    {index === 0 && <span className="text-2xl">👑</span>}
                    {index === 1 && <span className="text-2xl">🥈</span>}
                    {index === 2 && <span className="text-2xl">🥉</span>}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Stats */}
        {submissions.length > 0 && (
          <motion.div
            className="max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl border-2 border-green-100">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {submissions.length > 0 ? Math.max(...submissions.map((s) => s.score)) : 0}
              </div>
              <div className="text-gray-600">Highest Score</div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl border-2 border-green-100">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {submissions.length > 0
                  ? Math.round(submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length)
                  : 0}
              </div>
              <div className="text-gray-600">Average Score</div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl border-2 border-green-100">
              <div className="text-3xl font-bold text-green-600 mb-2">{submissions.length}</div>
              <div className="text-gray-600">Total Participants</div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}