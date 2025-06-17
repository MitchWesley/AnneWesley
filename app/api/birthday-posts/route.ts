import { type NextRequest, NextResponse } from "next/server"
import { getNeonClient } from "@/lib/db"

export async function GET() {
  try {
    console.log("API route called")
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL)

    const sql = getNeonClient()
    console.log("Database client created")

    const posts = await sql`
      SELECT id, name, message, image_urls, created_at
      FROM birthday_posts
      ORDER BY created_at DESC
    `

    console.log("Posts fetched successfully:", posts.length)

    const response = NextResponse.json({
      success: true,
      posts,
    })

    // Prevent caching
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

    return response
  } catch (error) {
    console.error("Detailed error in birthday-posts API:", error)
    console.error("Error message:", error instanceof Error ? error.message : "Unknown error")
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        error: "Failed to fetch posts",
        details: error instanceof Error ? error.message : "Unknown error",
        hasDatabase: !!process.env.DATABASE_URL,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST API route called")
    const sql = getNeonClient()
    const body = await request.json()

    const { name, message, imageUrls } = body

    if (!name || !message) {
      return NextResponse.json({ error: "Name and message are required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO birthday_posts (name, message, image_urls, created_at)
      VALUES (${name}, ${message}, ${imageUrls || []}, NOW())
      RETURNING id, name, message, image_urls, created_at
    `

    return NextResponse.json({
      success: true,
      post: result[0],
    })
  } catch (error) {
    console.error("Error creating birthday post:", error)
    return NextResponse.json(
      {
        error: "Failed to create post",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}