"use client"

import Link from "next/link"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

export function DashboardHeader() {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      const supabase = createClientComponentClient()
      await supabase.auth.signOut()
      // Force a hard navigation after sign out
      window.location.href = "/auth/login"
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <header className="border-b bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            Zaneta
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="font-medium text-gray-600 hover:text-primary">
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
            <Button variant="ghost" onClick={handleSignOut} className="flex items-center gap-2 hover:bg-gray-100">
              <LogOut className="h-5 w-5" />
              <span>Log out</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}

