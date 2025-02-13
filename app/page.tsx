import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { MainHeader } from "../components/main-header"
import Link from "next/link"

export default async function HomePage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-300">
      <MainHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl font-bold mb-6">Welcome to Zaneta</h1>
          <p className="text-xl mb-8">Your AI-powered learning companion for personalized programming education</p>
          <div className="grid gap-6 md:grid-cols-2">
            <Link
              href="/dashboard"
              className="block p-6 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
            >
              <h2 className="text-2xl font-semibold mb-2">Go to Dashboard</h2>
              <p>Access your personalized learning journey and track your progress</p>
            </Link>
            <Link
              href="/forum"
              className="block p-6 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
            >
              <h2 className="text-2xl font-semibold mb-2">Community Forum</h2>
              <p>Connect with other learners and share your experiences</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

