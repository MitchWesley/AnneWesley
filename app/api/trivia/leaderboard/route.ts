import { NextResponse } from "next/server"
import { getNeonClient } from "@/lib/db"

export async function GET(request: Request) {
  try {
    console.log("=== TRIVIA LEADERBOARD API CALLED ===")

    // Add a cache-busting query parameter
    const url = new URL(request.url)
    const timestamp = url.searchParams.get("t") || Date.now()
    console.log(`Cache-busting timestamp: ${timestamp}`)

    // Try multiple approaches to get the data
    const sql = getNeonClient()

    // First, check the count
    const countResult = await sql`SELECT COUNT(*) as total FROM trivia_submissions`
    console.log("Total count in leaderboard API:", countResult[0].total)

    // Get submissions with explicit ordering
    const submissions = await sql`
      SELECT id, name, score, total_questions, submitted_at
      FROM trivia_submissions
      ORDER BY score DESC, submitted_at ASC
    `

    console.log("Leaderboard submissions found:", submissions.length)
    console.log(
      "Submission IDs:",
      submissions.map((s) => s.id),
    )

    // Also try without ordering to see if that's the issue
    const allSubmissions = await sql`
      SELECT id, name, score, total_questions, submitted_at
      FROM trivia_submissions
    `

    console.log("All submissions (no ordering):", allSubmissions.length)

    // Add cache-busting headers
    const response = NextResponse.json({
      success: true,
      submissions,
      totalCount: countResult[0].total,
      allSubmissionsCount: allSubmissions.length,
      debug: {
        timestamp: new Date().toISOString(),
        cacheBuster: timestamp,
      },
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
        stack: error instanceof Error ? error.stack : "No stack trace",
      },
      { status: 500 },
    )
  }
}