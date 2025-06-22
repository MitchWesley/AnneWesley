import { NextResponse } from "next/server"
import { getNeonClient } from "@/lib/db"

export async function GET() {
  try {
    const sql = getNeonClient()

    const submissions = await sql`
      SELECT id, name, score, total_questions, submitted_at
      FROM trivia_submissions
      ORDER BY score DESC, submitted_at ASC
    `

    const response = NextResponse.json({
      success: true,
      submissions,
    })

    // Prevent caching
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

    return response
  } catch (error) {
    console.error("Error fetching trivia leaderboard:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
