import { NextResponse } from "next/server"
import { getNeonClient } from "@/lib/db"

export async function GET() {
  try {
    console.log("=== DEBUG TRIVIA API CALLED ===")

    // Use the EXACT same pattern as the working /api/trivia GET endpoint
    const sql = getNeonClient() // Single connection like the working endpoint

    // Test basic connection first
    const connectionTest = await sql`SELECT NOW() as current_time`
    console.log("Database connection test successful:", connectionTest)

    // Use the EXACT same query pattern as /api/trivia GET
    const triviaCount = await sql`SELECT COUNT(*) as total FROM trivia_submissions`
    console.log("Trivia table count:", triviaCount[0].total)

    // Get all IDs exactly like /api/trivia does
    const allIds = await sql`SELECT id, name, submitted_at FROM trivia_submissions ORDER BY id`
    console.log("All submission IDs:", allIds.length, "records")

    // Get recent submissions exactly like /api/trivia does
    const recentSubmissions = await sql`
      SELECT * FROM trivia_submissions 
      ORDER BY submitted_at DESC 
      LIMIT 10
    `
    console.log("Recent trivia submissions:", recentSubmissions.length)

    // Now get the full data for leaderboard (same as leaderboard API should do)
    const submissions = await sql`
      SELECT id, name, score, total_questions, submitted_at
      FROM trivia_submissions
      ORDER BY score DESC, submitted_at ASC
    `
    console.log("Leaderboard-style query results:", submissions.length)

    return NextResponse.json({
      success: true,
      message: "Debug trivia API - using same pattern as working /api/trivia",
      timestamp: connectionTest[0].current_time,
      totalSubmissions: triviaCount[0].total,
      allIds: allIds,
      recentSubmissions: recentSubmissions,
      leaderboardSubmissions: submissions,
      debug: {
        allIdsCount: allIds.length,
        recentCount: recentSubmissions.length,
        leaderboardCount: submissions.length,
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