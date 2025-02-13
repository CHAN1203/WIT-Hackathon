import { DashboardHeader } from "@/components/dashboard-header"
import { CourseSection } from "@/components/course-section"
import { ScheduleSection } from "@/components/schedule-section"
import { GoalSection } from "@/components/goal-section"
import { ChatSection } from "@/components/chat-section"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-300">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Welcome John!</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <CourseSection />
            <ScheduleSection />
          </div>
          <div className="space-y-8">
            <GoalSection />
            <ChatSection />
          </div>
        </div>
      </main>
    </div>
  )
}

