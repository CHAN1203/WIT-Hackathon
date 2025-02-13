import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const FLASK_API_URL = process.env.FLASK_API_URL || "http://localhost:5000"

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

    // Call Flask API for content moderation
    const moderationResponse = await fetch(`${FLASK_API_URL}/api/detect-cyberbullying`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: content }),
    })

    if (!moderationResponse.ok) {
      throw new Error("Failed to moderate content")
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
      .select()
      .single()

    if (insertError) throw insertError

    return NextResponse.json({
      post,
      moderation: moderationData,
    })
  } catch (error) {
    console.error("Content moderation error:", error)
    return NextResponse.json({ error: "Failed to process content" }, { status: 500 })
  }
}

