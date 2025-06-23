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

    // Get all IDs (same as working endpoint) - THIS WORKS AND SHOWS 6
    const allIds = await sql`SELECT id, name, submitted_at FROM trivia_submissions ORDER BY id`
    console.log("All IDs found:", allIds.length)
    console.log(
      "All ID details:",
      allIds.map((s) => ({ id: s.id, name: s.name })),
    )

    // Let's try different approaches to the leaderboard query
    console.log("=== TESTING DIFFERENT LEADERBOARD QUERIES ===")

    // Try 1: Simple query without ORDER BY
    const simpleQuery = await sql`
      SELECT id, name, score, total_questions, submitted_at
      FROM trivia_submissions
    `
    console.log("Simple query (no ORDER BY):", simpleQuery.length, "results")
    console.log(
      "Simple query IDs:",
      simpleQuery.map((s) => s.id),
    )

    // Try 2: Query with just score ordering
    const scoreOnlyOrder = await sql`
      SELECT id, name, score, total_questions, submitted_at
      FROM trivia_submissions
      ORDER BY score DESC
    `
    console.log("Score-only ORDER BY:", scoreOnlyOrder.length, "results")
    console.log(
      "Score-only IDs:",
      scoreOnlyOrder.map((s) => s.id),
    )

    // Try 3: Query with just date ordering
    const dateOnlyOrder = await sql`
      SELECT id, name, score, total_questions, submitted_at
      FROM trivia_submissions
      ORDER BY submitted_at ASC
    `
    console.log("Date-only ORDER BY:", dateOnlyOrder.length, "results")
    console.log(
      "Date-only IDs:",
      dateOnlyOrder.map((s) => s.id),
    )

    // Try 4: Original problematic query
    const originalQuery = await sql`
      SELECT id, name, score, total_questions, submitted_at
      FROM trivia_submissions
      ORDER BY score DESC, submitted_at ASC
    `
    console.log("Original query (score DESC, date ASC):", originalQuery.length, "results")
    console.log(
      "Original query IDs:",
      originalQuery.map((s) => s.id),
    )

    // Try 5: Check for NULL values that might cause issues
    const nullCheck = await sql`
      SELECT id, name, score, total_questions, submitted_at,
             CASE WHEN score IS NULL THEN 'NULL_SCORE' ELSE 'HAS_SCORE' END as score_status,
             CASE WHEN submitted_at IS NULL THEN 'NULL_DATE' ELSE 'HAS_DATE' END as date_status
      FROM trivia_submissions
      ORDER BY id
    `
    console.log("NULL check results:", nullCheck.length)
    console.log(
      "NULL check details:",
      nullCheck.map((s) => ({
        id: s.id,
        name: s.name,
        score_status: s.score_status,
        date_status: s.date_status,
      })),
    )

    // Use the simple query (no ORDER BY) as our result since it works
    const submissions = simpleQuery.sort((a, b) => {
      // Sort by score descending, then by date ascending
      if (b.score !== a.score) {
        return b.score - a.score
      }
      return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
    })

    console.log("Final sorted submissions:", submissions.length)
    console.log(
      "Final submission IDs:",
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
        simpleQueryCount: simpleQuery.length,
        scoreOnlyCount: scoreOnlyOrder.length,
        dateOnlyCount: dateOnlyOrder.length,
        originalQueryCount: originalQuery.length,
        finalCount: submissions.length,
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