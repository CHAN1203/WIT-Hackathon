"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, LayoutDashboard, FolderKanban, MessageCircle, User2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function MainHeader() {
  const pathname = usePathname()

  const handleSignOut = async () => {
    try {
      const supabase = createClientComponentClient()
      await supabase.auth.signOut()
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
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 font-medium hover:text-primary ${
                pathname === "/dashboard" ? "text-primary" : "text-gray-600"
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/project"
              className={`flex items-center gap-2 font-medium hover:text-primary ${
                pathname === "/project" ? "text-primary" : "text-gray-600"
              }`}
            >
              <FolderKanban className="h-5 w-5" />
              Project
            </Link>
            <Link
              href="/forum"
              className={`flex items-center gap-2 font-medium hover:text-primary ${
                pathname === "/forum" ? "text-primary" : "text-gray-600"
              }`}
            >
              <MessageCircle className="h-5 w-5" />
              Forum
            </Link>
            <Link
              href="/profile"
              className={`flex items-center gap-2 font-medium hover:text-primary ${
                pathname === "/profile" ? "text-primary" : "text-gray-600"
              }`}
            >
              <User2 className="h-5 w-5" />
              Profile
            </Link>
            <Button variant="ghost" onClick={handleSignOut} className="flex items-center gap-2 hover:bg-gray-100">
              <LogOut className="h-5 w-5" />
              Log Out
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}

