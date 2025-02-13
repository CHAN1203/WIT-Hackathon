"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export function LandingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError(null)

      // Verify Supabase client is initialized
      if (!supabase || !supabase.auth) {
        throw new Error("Supabase client not properly initialized")
      }

      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (signInError) {
        console.error("Auth Error:", signInError)
        throw signInError
      }

      if (!data) {
        throw new Error("No data returned from auth request")
      }
    } catch (err) {
      console.error("Sign in error:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-300">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h1 className="text-5xl font-bold mb-6">Welcome to Zaneta</h1>
          <p className="text-xl mb-8">Your AI-powered learning companion for personalized programming education</p>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-medium">Error: {error}</p>
              <p className="text-sm mt-1">Please try again or contact support if the problem persists.</p>
            </div>
          )}
          <Button
            size="lg"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="bg-white text-primary hover:bg-white/90"
          >
            {loading ? "Loading..." : "Continue with Google"}
          </Button>
          <p className="mt-4 text-sm text-white/80">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}

