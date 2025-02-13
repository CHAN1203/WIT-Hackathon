export interface UserPreferences {
    id: string
    user_id: string
    programming_objective: string | null
    skill_level: string | null
    timeframe_weeks: number | null
    created_at: string
    updated_at: string
  }
  
  export interface UserCourse {
    id: string
    user_id: string
    course_name: string
    progress: number
    completed: boolean
    created_at: string
    updated_at: string
  }
  
  export interface ChatHistory {
    id: string
    user_id: string
    message: string
    response: string
    context: Record<string, any> | null
    created_at: string
  }
  
  export interface ForumPost {
    id: string
    title: string
    content: string
    author_id: string
    author_name: string
    thread_id: string
    likes: number
    comments: number
    created_at: string
    updated_at: string
    followed_threads?: {
      name: string
      description: string | null
    }
  }
  
  export interface ForumThread {
    id: string
    name: string
    description: string | null
    created_at: string
    updated_at: string
  }
  
  export interface UserThreadFollow {
    id: string
    user_id: string
    thread_id: string
    created_at: string
  }
  
  // Supabase Database Types
  export type Database = {
    public: {
      Tables: {
        user_preferences: {
          Row: UserPreferences
          Insert: Omit<UserPreferences, "id" | "created_at" | "updated_at">
          Update: Partial<Omit<UserPreferences, "id">>
        }
        user_courses: {
          Row: UserCourse
          Insert: Omit<UserCourse, "id" | "created_at" | "updated_at">
          Update: Partial<Omit<UserCourse, "id">>
        }
        chat_history: {
          Row: ChatHistory
          Insert: Omit<ChatHistory, "id" | "created_at">
          Update: Partial<Omit<ChatHistory, "id">>
        }
        forum_posts: {
          Row: ForumPost
          Insert: Omit<ForumPost, "id" | "created_at" | "updated_at">
          Update: Partial<Omit<ForumPost, "id">>
        }
        followed_threads: {
          Row: ForumThread
          Insert: Omit<ForumThread, "id" | "created_at" | "updated_at">
          Update: Partial<Omit<ForumThread, "id">>
        }
        user_thread_follows: {
          Row: UserThreadFollow
          Insert: Omit<UserThreadFollow, "id" | "created_at">
          Update: Partial<Omit<UserThreadFollow, "id">>
        }
      }
    }
  }
  
  