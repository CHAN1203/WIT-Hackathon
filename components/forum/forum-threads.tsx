"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ForumThread } from "@/types/forum"

interface ForumThreadsProps {
  threads?: ForumThread[]
}

export function ForumThreads({ threads = [] }: ForumThreadsProps) {
  const defaultThreads: ForumThread[] = [
    {
      id: "1",
      name: "Python Programming",
      description: "Ask any questions about python programming",
      user_id: "",
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Machine Learning",
      description: "Ask any questions about machine learning",
      user_id: "",
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Exploratory Data Analysis",
      description: "Ask any questions about exploratory data analysis",
      user_id: "",
      created_at: new Date().toISOString(),
    },
  ]

  const displayThreads = threads.length > 0 ? threads : defaultThreads

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Followed Threads</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayThreads.map((thread) => (
          <div key={thread.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <Button variant="link" className="p-0 h-auto font-medium">
                {thread.name}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">{thread.description}</p>
          </div>
        ))}
        {displayThreads.length === 0 && <p className="text-sm text-muted-foreground">No threads followed yet</p>}
      </CardContent>
    </Card>
  )
}

