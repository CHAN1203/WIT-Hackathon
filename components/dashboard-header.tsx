"use client"

import Link from "next/link"
import { LogOut } from "lucide-react"
import { Button } from "../components/ui/button"

export function DashboardHeader() {
  return (
    <header className="border-b bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            Zaneta
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="font-medium text-primary">
              Dashboard
            </Link>
            <Link href="/project" className="font-medium text-gray-600 hover:text-primary">
              Project
            </Link>
            <Link href="/forum" className="font-medium text-gray-600 hover:text-primary">
              Forum
            </Link>
            <Link href="/profile" className="font-medium text-gray-600 hover:text-primary">
              Profile
            </Link>
            <Button variant="ghost" size="icon">
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Log out</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}

