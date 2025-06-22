import { NextResponse } from "next/server"
import { getNeonClient } from "@/lib/db"

export async function GET(request: Request) {
  try {
    console.log("Fetching trivia leaderboard...")
    const sql = getNeonClient() // Get a fresh connection

    // Add a cache-busting query parameter
    const url = new URL(request.url)
    const timestamp = url.searchParams.get("t") || Date.now()
    console.log(`Cache-busting timestamp: ${timestamp}`)

    const submissions = await sql`
      SELECT id, name, score, total_questions, submitted_at
      FROM trivia_submissions
      ORDER BY score DESC, submitted_at ASC
    `

    console.log("Trivia submissions result:", submissions.length, "records")

    // Add cache-busting headers
    const response = NextResponse.json({
      success: true,
      submissions,
    })

    // Prevent caching
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
    response.headers.set("Surrogate-Control", "no-store")

    return response
  } catch (error) {
    console.error("Error fetching trivia leaderboard:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch leaderboard",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
