import { NextResponse } from "next/server"
import { getNeonClient } from "@/lib/db"

export async function GET() {
  try {
    console.log("=== DEBUG TRIVIA API CALLED ===")
    const sql = getNeonClient() // Get a fresh connection - EXACT same as working endpoint
    console.log("Testing database connection...")

    // Use EXACT same queries as the working /api/trivia GET endpoint
    // Test basic connection
    const connectionTest = await sql`SELECT NOW() as current_time`
    console.log("Database connection test successful:", connectionTest)

    // Test trivia table access
    const rsvpTest = await sql`SELECT COUNT(*) as total FROM trivia_submissions`
    console.log("Trivia table test:", rsvpTest)

    // Get recent submissions - EXACT same query as working endpoint
    const recentSubmissions = await sql`
      SELECT * FROM trivia_submissions 
      ORDER BY submitted_at DESC 
      LIMIT 10
    `
    console.log("Recent trivia submissions:", recentSubmissions)

    // Get all IDs to see what we have - EXACT same query as working endpoint
    const allIds = await sql`SELECT id, name, submitted_at FROM trivia_submissions ORDER BY id`
    console.log("All submission IDs:", allIds)

    // Get leaderboard data using simple query
    const submissions = await sql`
      SELECT id, name, score, total_questions, submitted_at
      FROM trivia_submissions
      ORDER BY submitted_at DESC 
      LIMIT 10
    `
    console.log("Leaderboard-style query results:", submissions.length)

    return NextResponse.json({
      success: true,
      message: "Debug trivia API - using EXACT same pattern as working /api/trivia",
      timestamp: connectionTest[0].current_time,
      totalSubmissions: rsvpTest[0].total,
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