"use client"

import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const courses = [
  {
    id: 1,
    title: "Python Programming",
    image: "/placeholder.svg?height=200&width=150",
    completed: true,
  },
  {
    id: 2,
    title: "Exploratory Data Analysis",
    image: "/placeholder.svg?height=200&width=150",
    completed: true,
  },
  {
    id: 3,
    title: "Machine Learning",
    image: "/placeholder.svg?height=200&width=150",
    completed: false,
  },
]

export function CourseSection() {
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
              <img src={course.image || "/placeholder.svg"} alt={course.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold">{course.title}</h3>
                {course.completed && (
                  <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
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

