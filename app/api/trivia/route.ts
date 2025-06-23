import { type NextRequest, NextResponse } from "next/server"
import { getNeonClient } from "@/lib/db"
import { checkAnswers } from "@/lib/trivia-data"

export async function POST(request: NextRequest) {
  try {
    console.log("=== TRIVIA SUBMISSION API CALLED ===")
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

    // Check count before insert
    const beforeCount = await sql`SELECT COUNT(*) as total FROM trivia_submissions`
    console.log("Count before insert:", beforeCount[0].total)

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

    // Check count after insert
    const afterCount = await sql`SELECT COUNT(*) as total FROM trivia_submissions`
    console.log("Count after insert:", afterCount[0].total)

    // Verify the record was actually inserted by querying for it
    const verifyInsert = await sql`
      SELECT id, name, score FROM trivia_submissions 
      WHERE id = ${submission[0].id}
    `
    console.log("Verification query result:", verifyInsert)

    const response = NextResponse.json({
      success: true,
      submission: submission[0],
      results,
      debug: {
        beforeCount: beforeCount[0].total,
        afterCount: afterCount[0].total,
        verified: verifyInsert.length > 0,
      },
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
    console.log("=== TRIVIA API GET TEST ===")
    const sql = getNeonClient() // Get a fresh connection

    // Test basic connection
    const connectionTest = await sql`SELECT NOW() as current_time`
    console.log("Database connection test successful:", connectionTest)

    // Test trivia table access with multiple queries
    const triviaCount = await sql`SELECT COUNT(*) as total FROM trivia_submissions`
    console.log("Trivia table count:", triviaCount)

    // Get all IDs to see what we have
    const allIds = await sql`SELECT id, name, submitted_at FROM trivia_submissions ORDER BY id`
    console.log("All submission IDs:", allIds)

    // Get recent submissions
    const recentSubmissions = await sql`
      SELECT * FROM trivia_submissions 
      ORDER BY submitted_at DESC 
      LIMIT 10
    `
    console.log("Recent trivia submissions:", recentSubmissions.length)

    return NextResponse.json({
      success: true,
      message: "Trivia API route is working",
      timestamp: connectionTest[0].current_time,
      totalSubmissions: triviaCount[0].total,
      allIds: allIds,
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