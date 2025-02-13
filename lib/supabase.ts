import { createClient } from "@supabase/supabase-js"

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL")
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "supabase.auth.token",
    storage: {
      getItem: (key: string) => {
        if (typeof window === "undefined") {
          return null
        }
        return JSON.parse(window.localStorage.getItem(key) || "null")
      },
      setItem: (key: string, value: any) => {
        if (typeof window === "undefined") {
          return
        }
        window.localStorage.setItem(key, JSON.stringify(value))
      },
      removeItem: (key: string) => {
        if (typeof window === "undefined") {
          return
        }
        window.localStorage.removeItem(key)
      },
    },
  },
})

