export interface ForumThread {
    id: string
    name: string
    description: string
    user_id: string
    created_at: string
  }
  
  export interface ForumPost {
    id: string
    title: string
    content: string
    author_id: string
    author: {
      email: string
      user_metadata: {
        name?: string
      }
    }
    likes: number
    comments: number
    created_at: string
    moderation_status: "pending" | "approved" | "rejected"
    moderation_confidence?: number
    moderation_message?: string
  }
  
  