import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getChatResponse } from "@/lib/perplexity"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { message, context } = await request.json()

    // Get response from Perplexity
    const reply = await getChatResponse(message, context)

    // Store chat history
    await supabase.from("chat_history").insert({
      user_id: session.user.id,
      message,
      response: reply,
      context: context || {},
    })

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("Chat API Error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

