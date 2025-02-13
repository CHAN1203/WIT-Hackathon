"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"

type Course = {
  id: string
  course_name: string
  progress: number
  completed: boolean
}

export function CourseSection({ initialCourses = [] }: { initialCourses: Course[] }) {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>(initialCourses)

  useEffect(() => {
    const channel = supabase
      .channel("course_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_courses",
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setCourses((current) => 
              current.map((course) => 
                course.id === payload.new.id ? (payload.new as Course) : course
              )
            );
            
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  return (
    <section className="space-y-4"> 
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Relevant Courses</h2>
        <div className="flex gap-2">
          <Button variant="secondary" size="icon">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous courses</span>
          </Button>
          <Button variant="secondary" size="icon">
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next courses</span>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <CardContent className="p-0">
              <img
                src="/placeholder.svg?height=200&width=150"
                alt={course.course_name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold">{course.course_name}</h3>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: `${course.progress}%` }} />
                </div>
                {course.completed && (
                  <span className="inline-block px-2 py-1 mt-2 text-xs bg-green-100 text-green-800 rounded-full">
                    Completed
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

