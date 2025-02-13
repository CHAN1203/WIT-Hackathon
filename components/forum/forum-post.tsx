"use client"

import { Heart, MessageSquare, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"

interface Post {
  id: string
  title: string
  content: string
  author: {
    email: string
    user_metadata: {
      name?: string
    }
  }
  likes: number
  comments: number
  created_at: string
}

export function ForumPost({ post }: { post: Post }) {
  const authorName = post.author.user_metadata?.name || post.author.email.split("@")[0]

  return (
    <div className="border-b border-border last:border-0 pb-4 last:pb-0">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-medium">{authorName}</span>
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
        </span>
      </div>
      <h3 className="text-lg font-medium mb-2">{post.title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{post.content}</p>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Heart className="h-4 w-4 mr-2" />
          {post.likes}
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <MessageSquare className="h-4 w-4 mr-2" />
          {post.comments}
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  )
}

