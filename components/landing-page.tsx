"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-300">
      <header className="border-b bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              Zaneta
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Sign up</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h1 className="text-5xl font-bold mb-6">Welcome to Zaneta</h1>
          <p className="text-xl mb-8">
            Your AI-powered learning companion for personalized programming education and digital safety
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10">
                Already have an account?
              </Button>
            </Link>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">Personalized Learning</h2>
              <p>Tailored programming education path based on your goals and skill level</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">AI-Powered Support</h2>
              <p>Get instant help and guidance from our AI assistant</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">Community Forum</h2>
              <p>Connect with other learners and share your programming journey</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

