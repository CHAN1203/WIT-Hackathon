"use client"

import { Home, TrendingUp, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"

export function ForumSidebar() {
  const threads = [
    {
      id: "1",
      name: "Python Programming",
      description: "Ask any questions about python programming",
    },
    {
      id: "2",
      name: "Machine Learning",
      description: "Ask any questions about machine learning",
    },
    {
      id: "3",
      name: "Exploratory Data Analysis",
      description: "Ask any questions about exploratory data analysis",
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-white/90 backdrop-blur-sm">
        <nav className="space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent">
            <Home className="h-4 w-4" />
            Home
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent">
            <TrendingUp className="h-4 w-4" />
            Popular
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent">
            <Clock className="h-4 w-4" />
            Recent Posts
          </a>
        </nav>
      </Card>
      <Card className="p-4 bg-white/90 backdrop-blur-sm">
        <h3 className="font-semibold mb-4">Followed Threads</h3>
        <div className="space-y-4">
          {threads.map((thread) => (
            <div key={thread.id} className="space-y-1">
              <h4 className="font-medium text-sm">{thread.name}</h4>
              <p className="text-xs text-muted-foreground">{thread.description}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

