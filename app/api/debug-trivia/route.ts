import { NextResponse } from "next/server"
import { getNeonClient } from "@/lib/db"

export async function GET() {
  try {
    const sql = getNeonClient()

    // Get all submissions with detailed info
    const allSubmissions = await sql`
      SELECT id, name, score, total_questions, submitted_at, 
             EXTRACT(EPOCH FROM submitted_at) as timestamp
      FROM trivia_submissions 
      ORDER BY submitted_at DESC
    `

    // Get count
    const count = await sql`SELECT COUNT(*) as total FROM trivia_submissions`

    console.log("Debug: Total submissions in DB:", count[0].total)
    console.log("Debug: All submissions:", allSubmissions)

    return NextResponse.json({
      success: true,
      totalCount: count[0].total,
      submissions: allSubmissions,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Debug trivia error:", error)
    return NextResponse.json(
      {
        error: "Debug failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
