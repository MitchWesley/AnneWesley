import { type NextRequest, NextResponse } from "next/server"
import { getNeonClient } from "@/lib/db"

export async function GET() {
  try {
    const sql = getNeonClient()

    const posts = await sql`
      SELECT id, name, message, image_urls, created_at
      FROM birthday_posts
      ORDER BY created_at DESC
    `

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
    console.error("Error fetching birthday posts:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}
