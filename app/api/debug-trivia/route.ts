import { NextResponse } from "next/server"
import { getNeonClient } from "@/lib/db"

export async function GET() {
  try {
    console.log("=== DEBUG TRIVIA API CALLED ===")

    // Try multiple connection attempts to see if we get different results
    const sql1 = getNeonClient()
    const sql2 = getNeonClient()

    console.log("Testing with first connection...")
    const count1 = await sql1`SELECT COUNT(*) as total FROM trivia_submissions`
    console.log("First connection count:", count1[0].total)

    console.log("Testing with second connection...")
    const count2 = await sql2`SELECT COUNT(*) as total FROM trivia_submissions`
    console.log("Second connection count:", count2[0].total)

    // Get all submissions with more detailed info
    const allSubmissions = await sql1`
      SELECT id, name, score, total_questions, submitted_at, 
             EXTRACT(EPOCH FROM submitted_at) as timestamp,
             answers
      FROM trivia_submissions 
      ORDER BY id ASC
    `

    console.log(
      "All submissions by ID:",
      allSubmissions.map((s) => ({ id: s.id, name: s.name, submitted_at: s.submitted_at })),
    )

    // Try a different query approach
    const rawQuery = await sql1`
      SELECT * FROM trivia_submissions ORDER BY submitted_at DESC
    `

    console.log("Raw query results:", rawQuery.length, "records")

    // Check for any potential issues with the table
    const tableInfo = await sql1`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'trivia_submissions'
      ORDER BY ordinal_position
    `

    console.log("Table structure:", tableInfo)

    return NextResponse.json({
      success: true,
      connection1Count: count1[0].total,
      connection2Count: count2[0].total,
      totalSubmissions: allSubmissions.length,
      rawQueryCount: rawQuery.length,
      submissions: allSubmissions,
      rawSubmissions: rawQuery,
      tableStructure: tableInfo,
      timestamp: new Date().toISOString(),
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