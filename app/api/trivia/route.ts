import { type NextRequest, NextResponse } from "next/server"
import { getNeonClient } from "@/lib/db"
import { checkAnswers } from "@/lib/trivia-data"

export async function POST(request: NextRequest) {
  try {
    console.log("Trivia submission API route called")
    const sql = getNeonClient() // Get a fresh connection
    const body = await request.json()

    const { name, answers } = body

    if (!name || !answers) {
      return NextResponse.json({ error: "Name and answers are required" }, { status: 400 })
    }

    console.log("Processing trivia submission for:", name)
    console.log("Answers received:", Object.keys(answers).length, "questions")

    // Check the answers and calculate score
    const results = checkAnswers(answers)
    console.log("Score calculated:", results.score, "out of", results.totalQuestions)

    // Store the submission in the database
    const submission = await sql`
      INSERT INTO trivia_submissions (name, score, total_questions, answers, submitted_at)
      VALUES (${name}, ${results.score}, ${results.totalQuestions}, ${JSON.stringify({
        userAnswers: answers,
        results: results.results,
      })}, NOW())
      RETURNING id, name, score, total_questions, submitted_at
    `

    console.log("Trivia submission stored successfully:", submission[0])

    // Get updated submissions count immediately after insert
    const updatedCount = await sql`
      SELECT COUNT(*) as total FROM trivia_submissions
    `

    console.log("Total trivia submissions after insert:", updatedCount[0].total)

    const response = NextResponse.json({
      success: true,
      submission: submission[0],
      results,
    })

    // Add cache-busting headers to prevent caching
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
    response.headers.set("Surrogate-Control", "no-store")

    return response
  } catch (error) {
    console.error("Detailed error in trivia submission API:", error)
    console.error("Error message:", error instanceof Error ? error.message : "Unknown error")
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        error: "Failed to submit trivia",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Add a GET method for testing the API connection
export async function GET() {
  try {
    const sql = getNeonClient() // Get a fresh connection
    console.log("Testing trivia API connection...")

    // Test basic connection
    const connectionTest = await sql`SELECT NOW() as current_time`
    console.log("Database connection test successful:", connectionTest)

    // Test trivia table access
    const triviaTest = await sql`SELECT COUNT(*) as total FROM trivia_submissions`
    console.log("Trivia table test:", triviaTest)

    // Get recent submissions
    const recentSubmissions = await sql`
      SELECT * FROM trivia_submissions 
      ORDER BY submitted_at DESC 
      LIMIT 5
    `
    console.log("Recent trivia submissions:", recentSubmissions)

    return NextResponse.json({
      success: true,
      message: "Trivia API route is working",
      timestamp: connectionTest[0].current_time,
      totalSubmissions: triviaTest[0].total,
      recentSubmissions: recentSubmissions,
    })
  } catch (error) {
    console.error("Trivia database connection test failed:", error)
    return NextResponse.json(
      {
        error: "Database connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
