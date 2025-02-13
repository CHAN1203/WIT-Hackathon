"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { ForumPost } from "./forum-post"
import { ForumSidebar } from "./forum-sidebar"
import { ForumThreads } from "./forum-threads"
import { CreatePostForm } from "./create-post-form"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import type { ForumPost as ForumPostType, ForumThread } from "@/types/forum"

interface ForumContentProps {
  initialPosts?: ForumPostType[]
  followedThreads?: ForumThread[]
}

export function ForumContent({ initialPosts = [], followedThreads = [] }: ForumContentProps) {
  const [posts, setPosts] = useState<ForumPostType[]>(initialPosts)
  const [showCreatePost, setShowCreatePost] = useState(false)

  const handleNewPost = (newPost: ForumPostType) => {
    setPosts((currentPosts) => [newPost, ...currentPosts])
    setShowCreatePost(false)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Python Programming</h2>
              <p className="text-sm text-muted-foreground">Ask any questions about Python programming</p>
            </div>
            <Button onClick={() => setShowCreatePost(!showCreatePost)}>
              {showCreatePost ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </>
              )}
            </Button>
          </div>

          {showCreatePost && (
            <div className="mb-6">
              <CreatePostForm onSuccess={handleNewPost} />
            </div>
          )}

          <div className="space-y-4">
            {posts.length > 0 ? (
              posts.map((post) => <ForumPost key={post.id} post={post} />)
            ) : (
              <p className="text-sm text-muted-foreground">No posts yet. Be the first to create one!</p>
            )}
          </div>
        </Card>
      </div>
      <div className="space-y-6">
        <ForumSidebar />
        <ForumThreads threads={followedThreads} />
      </div>
    </div>
  )
}

