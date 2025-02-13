import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { DashboardHeader } from "@/components/dashboard-header"
import { CourseSection } from "@/components/course-section"
import { ScheduleSection } from "@/components/schedule-section"
import { GoalSection } from "@/components/goal-section"
import { ChatSection } from "@/components/chat-section"

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user's courses
  const { data: courses } = await supabase.from("user_courses").select("*").eq("user_id", user?.id)

  // Fetch user's preferences
  const { data: preferences } = await supabase.from("user_preferences").select("*").eq("user_id", user?.id).single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-300">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Welcome {user?.email?.split("@")[0]}!</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <CourseSection initialCourses={courses || []} />
            <ScheduleSection />
          </div>
          <div className="space-y-8">
            <GoalSection initialPreferences={preferences} />
            <ChatSection />
          </div>
        </div>
      </main>
    </div>
  )
}

