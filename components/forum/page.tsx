import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { ForumContent } from "@/components/forum/forum-content"

export default async function ForumPage() {
  const supabase = createServerComponentClient({ cookies })

  // Use getUser() instead of getSession() for secure authentication
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    console.error("Auth error:", error)
    redirect("/auth/login")
  }

  // Add some sample data since the tables might not exist yet
  const samplePosts = [
    {
      id: "1",
      title: "Does anyone understand how to do the coursera lesson 6?",
      content:
        "I'm really confused about why my test cases aren't passing. I'm working on a Python function that processes a list of numbers, and it seems to work fine when I run it manually with print statements, but when I run my test cases, some of them fail...",
      author: "user1",
      likes: 5,
      comments: 3,
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      title: "New Python Library just dropped!!",
      content:
        "Has anyone tried out the new Python library yet? I just came across it, and it looks super promising! Anyone has played around with it? I'd love to hear your thoughts--does it work as well as advertised?",
      author: "user2",
      likes: 10,
      comments: 7,
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      title: "How to implement a Fibonacci sequence using recursion",
      content:
        "Hey everyone, I'm trying to write a recursive function in Python to generate the Fibonacci sequence, but I'm a bit stuck. I know the Fibonacci sequence follows the pattern where each number is the sum of the two preceding ones...",
      author: "user3",
      likes: 8,
      comments: 12,
      created_at: new Date().toISOString(),
    },
  ]

  // Use sample data for now
  const posts = samplePosts
  const followedThreads: any[] = []

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-300">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <ForumContent initialPosts={posts} followedThreads={followedThreads} />
      </main>
    </div>
  )
}

