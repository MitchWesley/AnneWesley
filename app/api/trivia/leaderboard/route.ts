import { NextResponse } from "next/server"
import { getFreshNeonClient } from "@/lib/db"

export async function GET(request: Request) {
  try {
    console.log("=== TRIVIA LEADERBOARD API CALLED ===")

    // Use fresh connection to avoid stale data
    const sql = getFreshNeonClient()
    console.log("Using fresh database connection...")

    // Add cache-busting query parameter
    const url = new URL(request.url)
    const timestamp = url.searchParams.get("t") || Date.now()
    console.log(`Cache-busting timestamp: ${timestamp}`)

    // Add a small delay to ensure write consistency
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Test basic connection
    const connectionTest = await sql`SELECT NOW() as current_time`
    console.log("Database connection test successful:", connectionTest)

    // Force fresh count query
    const triviaTest = await sql`SELECT COUNT(*) as total FROM trivia_submissions`
    console.log("Fresh trivia table count:", triviaTest[0].total)

    // Get all IDs with fresh query
    const allIds = await sql`SELECT id, name, submitted_at FROM trivia_submissions ORDER BY id DESC`
    console.log("Fresh all submission IDs:", allIds.length)
    console.log(
      "Latest submission IDs:",
      allIds.slice(0, 3).map((s) => s.id),
    )

    // Get recent submissions
    const recentSubmissions = await sql`
      SELECT * FROM trivia_submissions 
      ORDER BY submitted_at DESC 
      LIMIT 10
    `
    console.log("Fresh recent trivia submissions:", recentSubmissions.length)

    // Get leaderboard data with fresh query
    const submissions = await sql`
      SELECT id, name, score, total_questions, submitted_at
      FROM trivia_submissions
      ORDER BY score DESC, submitted_at ASC
    `

    console.log("Fresh leaderboard query results:", submissions.length)
    console.log(
      "Fresh submission IDs from leaderboard:",
      submissions.map((s) => s.id),
    )

    // Add cache-busting headers
    const response = NextResponse.json({
      success: true,
      submissions,
      debug: {
        timestamp: new Date().toISOString(),
        cacheBuster: timestamp,
        totalCount: triviaTest[0].total,
        allIdsCount: allIds.length,
        recentCount: recentSubmissions.length,
        leaderboardCount: submissions.length,
        connectionTime: connectionTest[0].current_time,
        latestIds: allIds.slice(0, 5).map((s) => s.id),
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