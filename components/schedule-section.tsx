"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"

const scheduleColors = {
  python: "bg-red-200",
  data: "bg-green-200",
  machine: "bg-blue-200",
}

export function ScheduleSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 31 }).map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-sm border p-1 text-sm ${
                  i % 3 === 0 ? scheduleColors.python : i % 3 === 1 ? scheduleColors.data : scheduleColors.machine
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-red-200" />
              <span className="text-sm">Python Programming</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-green-200" />
              <span className="text-sm">Exploratory Data Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-blue-200" />
              <span className="text-sm">Machine Learning</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

