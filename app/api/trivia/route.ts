import { type NextRequest, NextResponse } from "next/server"
import { getNeonClient } from "@/lib/db"
import { checkAnswers } from "@/lib/trivia-data"

export async function POST(request: NextRequest) {
  try {
    const sql = getNeonClient()
    const body = await request.json()

    const { name, answers } = body

    if (!name || !answers) {
      return NextResponse.json({ error: "Name and answers are required" }, { status: 400 })
    }

    // Check the answers and calculate score
    const results = checkAnswers(answers)

    // Store the submission in the database
    const submission = await sql`
      INSERT INTO trivia_submissions (name, score, total_questions, answers, submitted_at)
      VALUES (${name}, ${results.score}, ${results.totalQuestions}, ${JSON.stringify({
        userAnswers: answers,
        results: results.results,
      })}, NOW())
      RETURNING id, name, score, total_questions, submitted_at
    `

    return NextResponse.json({
      success: true,
      submission: submission[0],
      results,
    })
  } catch (error) {
    console.error("Error submitting trivia:", error)
    return NextResponse.json(
      {
        error: "Failed to submit trivia",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
