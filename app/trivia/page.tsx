"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Trophy, Send, Brain } from "lucide-react"
import Link from "next/link"
import { triviaQuestions } from "@/lib/trivia-data"

export default function TriviaPage() {
  const [answers, setAnswers] = useState<Record<number, string | number>>({})
  const [showNameForm, setShowNameForm] = useState(false)
  const [name, setName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleAnswerChange = (questionId: number, answer: string | number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleSubmit = () => {
    // Check if all questions are answered
    const unansweredQuestions = triviaQuestions.filter((q) => !(q.id in answers))
    if (unansweredQuestions.length > 0) {
      alert(`Please answer all questions. Missing: ${unansweredQuestions.length} questions.`)
      return
    }
    setShowNameForm(true)
  }

  const submitTrivia = async () => {
    if (!name.trim()) {
      alert("Please enter your name or team name.")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/trivia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          answers,
        }),
      })

      if (!response.ok) throw new Error("Failed to submit trivia")

      const data = await response.json()
      setResults(data.results)
    } catch (error) {
      console.error("Error submitting trivia:", error)
      alert("There was an error submitting your answers. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const totalPoints = triviaQuestions.reduce((sum, q) => sum + q.points, 0)
  const answeredCount = Object.keys(answers).length

  if (results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-4 border-green-200 mb-8"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>

              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                Thank You!
              </h1>

              <div className="text-xl text-gray-600 mb-6">Your trivia answers have been submitted successfully!</div>

              <div className="text-lg text-gray-700 mb-6">
                Thanks for testing your knowledge about Anne.
                <br />
                Results will be revealed at the party! 🎊
              </div>

              <Link href="/">
                <motion.button
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Back to Birthday Celebration
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Footer for results page */}
          <motion.footer
            className="max-w-2xl mx-auto mt-8 text-center pb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="text-gray-600">
              Created by{" "}
              <span
                className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive" }}
              >
                Teressa Wesley
              </span>
            </div>
          </motion.footer>
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

          <div className="text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              className="text-6xl mb-4"
            >
              🧠
            </motion.div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Anne's Birthday Trivia
            </h1>
            <p className="text-xl text-gray-600 mb-2">How well do you know Anne?</p>
            <div className="text-lg text-gray-500">
              {answeredCount} of {triviaQuestions.length} questions answered • {totalPoints} total points
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          className="max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white/50 rounded-full h-3 overflow-hidden shadow-inner">
            <motion.div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(answeredCount / triviaQuestions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Questions */}
        <div className="max-w-2xl mx-auto space-y-6">
          {triviaQuestions.map((question, index) => (
            <motion.div
              key={question.id}
              className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border-2 border-green-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start mb-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{question.question}</h3>
                  <div className="text-sm text-gray-500">
                    {question.points} point{question.points !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {question.type === "multiple-choice" ? (
                <div className="space-y-2 ml-12">
                  {question.options?.map((option, optionIndex) => (
                    <motion.label
                      key={optionIndex}
                      className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                        answers[question.id] === optionIndex
                          ? "bg-green-100 border-2 border-green-300"
                          : "bg-gray-50 border-2 border-transparent hover:bg-green-50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={optionIndex}
                        checked={answers[question.id] === optionIndex}
                        onChange={() => handleAnswerChange(question.id, optionIndex)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                          answers[question.id] === optionIndex ? "border-green-500 bg-green-500" : "border-gray-300"
                        }`}
                      >
                        {answers[question.id] === optionIndex && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className="text-gray-700">{option}</span>
                    </motion.label>
                  ))}
                </div>
              ) : (
                <div className="ml-12">
                  <input
                    type="text"
                    value={answers[question.id] || ""}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full p-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Submit Button */}
        <motion.div
          className="max-w-2xl mx-auto mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            onClick={handleSubmit}
            disabled={answeredCount < triviaQuestions.length}
            className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: answeredCount === triviaQuestions.length ? 1.05 : 1 }}
            whileTap={{ scale: answeredCount === triviaQuestions.length ? 0.95 : 1 }}
          >
            <Brain className="w-6 h-6 inline mr-2" />
            Submit Trivia ({answeredCount}/{triviaQuestions.length})
          </motion.button>
        </motion.div>

        {/* Footer for main trivia page */}
        <motion.footer
          className="max-w-2xl mx-auto mt-16 text-center pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="text-gray-600">
            Created by{" "}
            <span
              className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
              style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive" }}
            >
              Teressa Wesley
            </span>
          </div>
        </motion.footer>
      </div>

      {/* Name Form Modal */}
      <AnimatePresence>
        {showNameForm && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border-4 border-green-200"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
            >
              <div className="text-center mb-6">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Almost Done!
                </h3>
                <p className="text-gray-600 mt-2">Enter your name or team name to submit your answers</p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name or team name"
                  className="w-full p-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  onKeyPress={(e) => e.key === "Enter" && submitTrivia()}
                />

                <div className="flex gap-3">
                  <motion.button
                    onClick={() => setShowNameForm(false)}
                    className="flex-1 py-3 px-6 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={submitTrivia}
                    disabled={submitting || !name.trim()}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 font-semibold"
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
                        Submitting...
                      </span>
                    ) : (
                      <>
                        <Send className="w-5 h-5 inline mr-2" />
                        Submit Answers
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}