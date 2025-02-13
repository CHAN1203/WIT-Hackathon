import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { ForumContent } from "@/components/forum/forum-content"

export default async function ForumPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  try {
    // Fetch forum posts with author information
    const { data: posts, error: postsError } = await supabase
      .from("forum_posts")
      .select(`
        *,
        author:author_id(
          email,
          user_metadata
        )
      `)
      .eq("moderation_status", "approved")
      .order("created_at", { ascending: false })

    if (postsError) {
      console.error("Error fetching posts:", postsError)
    }

    // Fetch user's followed threads
    const { data: followedThreads, error: threadsError } = await supabase
      .from("followed_threads")
      .select("*")
      .eq("user_id", session.user.id)

    if (threadsError) {
      console.error("Error fetching threads:", threadsError)
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-300">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <ForumContent initialPosts={posts || []} followedThreads={followedThreads || []} />
        </main>
      </div>
    )
  } catch (error) {
    console.error("Forum page error:", error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-300">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <ForumContent />
        </main>
      </div>
    )
  }
}

