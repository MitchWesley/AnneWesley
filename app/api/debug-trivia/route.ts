import { NextResponse } from "next/server"
import { getFreshNeonClient } from "@/lib/db"

export async function GET() {
  try {
    console.log("=== DEBUG TRIVIA API CALLED ===")

    // Use fresh connection to avoid stale data
    const sql = getFreshNeonClient()
    console.log("Using fresh database connection...")

    // Add a small delay to ensure write consistency
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Test basic connection
    const connectionTest = await sql`SELECT NOW() as current_time`
    console.log("Database connection test successful:", connectionTest)

    // Force a fresh count query
    const triviaTest = await sql`SELECT COUNT(*) as total FROM trivia_submissions`
    console.log("Fresh trivia table count:", triviaTest[0].total)

    // Get all IDs with fresh query
    const allIds = await sql`SELECT id, name, submitted_at FROM trivia_submissions ORDER BY id DESC`
    console.log("Fresh all submission IDs:", allIds.length)
    console.log(
      "Latest submission IDs:",
      allIds.slice(0, 3).map((s) => s.id),
    )

    // Get recent submissions with fresh query
    const recentSubmissions = await sql`
      SELECT * FROM trivia_submissions 
      ORDER BY submitted_at DESC 
      LIMIT 10
    `
    console.log("Fresh recent trivia submissions:", recentSubmissions.length)

    // Get leaderboard data
    const submissions = await sql`
      SELECT id, name, score, total_questions, submitted_at
      FROM trivia_submissions
      ORDER BY submitted_at DESC 
      LIMIT 10
    `
    console.log("Fresh leaderboard query results:", submissions.length)

    return NextResponse.json({
      success: true,
      message: "Debug trivia API - using FRESH connection",
      timestamp: connectionTest[0].current_time,
      totalSubmissions: triviaTest[0].total,
      allIds: allIds,
      recentSubmissions: recentSubmissions,
      leaderboardSubmissions: submissions,
      debug: {
        allIdsCount: allIds.length,
        recentCount: recentSubmissions.length,
        leaderboardCount: submissions.length,
        latestIds: allIds.slice(0, 5).map((s) => s.id),
      },
    })
  } catch (error) {
    console.error("Debug trivia error:", error)
    return NextResponse.json(
      {
        error: "Debug failed",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace",
      },
      { status: 500 },
    )
  }
}
