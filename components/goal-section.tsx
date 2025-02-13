"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Lock } from "lucide-react"

type Preferences = {
  programming_objective: string
  skill_level: string
  timeframe_weeks: number
}

export function GoalSection({ initialPreferences }: { initialPreferences?: Preferences }) {
  const goals = [
    {
      id: 1,
      name: "Python Programming",
      completed: true,
    },
    {
      id: 2,
      name: "Exploratory Data Analysis",
      completed: true,
    },
    {
      id: 3,
      name: "Machine Learning",
      completed: false,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>GOAL:</CardTitle>
        <p className="text-sm text-muted-foreground">
          {initialPreferences?.programming_objective || "To be proficient in data analysis"}
        </p>
        {initialPreferences?.timeframe_weeks && (
          <p className="text-sm text-muted-foreground">Timeline: {initialPreferences.timeframe_weeks} weeks</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.id} className="flex items-center gap-2">
            <div className={`rounded-full p-1 ${goal.completed ? "bg-green-100" : "bg-gray-100"}`}>
              {goal.completed ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Lock className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <span className={goal.completed ? "line-through text-muted-foreground" : ""}>{goal.name}</span>
          </div>
        ))}
        <Button className="w-full" variant="destructive" disabled={!goals.every((g) => g.completed)}>
          Start Project
        </Button>
      </CardContent>
    </Card>
  )
}

