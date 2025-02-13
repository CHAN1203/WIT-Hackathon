import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const FLASK_API_URL = process.env.FLASK_API_URL

if (!FLASK_API_URL) {
  throw new Error("FLASK_API_URL environment variable is not set")
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, content } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    // Call Flask API for content moderation
    try {
      const moderationResponse = await fetch(`${FLASK_API_URL}/api/moderate-content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: content }),
      })

      if (!moderationResponse.ok) {
        throw new Error("Content moderation service unavailable")
      }

      const moderationData = await moderationResponse.json()

      // Insert post with moderation results
      const { data: post, error: insertError } = await supabase
        .from("forum_posts")
        .insert({
          title,
          content,
          author_id: session.user.id,
          moderation_status: moderationData.isSafe ? "approved" : "rejected",
          moderation_confidence: moderationData.confidence,
          moderation_message: moderationData.message,
        })
        .select(`
          *,
          author:author_id (
            email,
            user_metadata
          )
        `)
        .single()

      if (insertError) {
        console.error("Database insert error:", insertError)
        throw new Error("Failed to save post")
      }

      return NextResponse.json({
        post,
        moderation: moderationData,
      })
    } catch (error) {
      console.error("Moderation service error:", error)
      return NextResponse.json({ error: "Content moderation service unavailable" }, { status: 503 })
    }
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

