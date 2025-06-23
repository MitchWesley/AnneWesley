import { NextResponse } from "next/server"
import { getNeonClient } from "@/lib/db"

export async function GET(request: Request) {
  try {
    console.log("=== TRIVIA LEADERBOARD API CALLED ===")

    // Add a cache-busting query parameter
    const url = new URL(request.url)
    const timestamp = url.searchParams.get("t") || Date.now()
    console.log(`Cache-busting timestamp: ${timestamp}`)

    // Use the EXACT same connection pattern as the working /api/trivia GET endpoint
    const sql = getNeonClient()

    // First, do the exact same queries that work in /api/trivia GET
    console.log("Testing with same pattern as working /api/trivia...")

    // Test basic connection (same as working endpoint)
    const connectionTest = await sql`SELECT NOW() as current_time`
    console.log("Connection test successful:", connectionTest)

    // Count query (same as working endpoint)
    const triviaCount = await sql`SELECT COUNT(*) as total FROM trivia_submissions`
    console.log("Total count:", triviaCount[0].total)

    // Get all IDs (same as working endpoint)
    const allIds = await sql`SELECT id, name, submitted_at FROM trivia_submissions ORDER BY id`
    console.log("All IDs found:", allIds.length)

    // Get recent submissions (same as working endpoint)
    const recentSubmissions = await sql`
      SELECT * FROM trivia_submissions 
      ORDER BY submitted_at DESC 
      LIMIT 10
    `
    console.log("Recent submissions found:", recentSubmissions.length)

    // Now try the leaderboard query
    const submissions = await sql`
      SELECT id, name, score, total_questions, submitted_at
      FROM trivia_submissions
      ORDER BY score DESC, submitted_at ASC
    `

    console.log("Leaderboard query results:", submissions.length)
    console.log(
      "Submission IDs from leaderboard query:",
      submissions.map((s) => s.id),
    )

    // Add cache-busting headers
    const response = NextResponse.json({
      success: true,
      submissions,
      debug: {
        timestamp: new Date().toISOString(),
        cacheBuster: timestamp,
        totalCount: triviaCount[0].total,
        allIdsCount: allIds.length,
        recentCount: recentSubmissions.length,
        leaderboardCount: submissions.length,
        connectionTime: connectionTest[0].current_time,
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