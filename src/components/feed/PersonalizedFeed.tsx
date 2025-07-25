import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Post } from '@/types';
import { PostCard } from './PostCard';
import { useToast } from '@/hooks/use-toast';

export const PersonalizedFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPersonalizedPosts();
  }, []);

  const fetchPersonalizedPosts = async () => {
    try {
      // For demo purposes, show posts ordered by upvotes (most popular first)
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (id, username, avatar_url),
          post_tags (
            tags (id, name, color)
          )
        `)
        .order('upvotes', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts((data as any) || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load personalized feed",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (postId: string) => {
    try {
      // For demo purposes without auth, just increment the upvote count
      const currentPost = posts.find(p => p.id === postId);
      if (currentPost) {
        await supabase
          .from('posts')
          .update({ upvotes: currentPost.upvotes + 1 })
          .eq('id', postId);
      }
      
      fetchPersonalizedPosts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update upvote",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No personalized posts yet. Interact with posts to improve your recommendations!
          </p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            onUpvote={handleUpvote}
          />
        ))
      )}
    </div>
  );
};