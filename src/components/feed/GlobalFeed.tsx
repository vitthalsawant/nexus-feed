import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Post } from '@/types';
import { PostCard } from './PostCard';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const GlobalFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (id, username, avatar_url),
          post_tags (
            tags (id, name, color)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts((data as any) || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (postId: string) => {
    if (!user) return;

    try {
      // Check if user already upvoted
      const { data: existingInteraction } = await supabase
        .from('post_interactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .eq('interaction_type', 'upvote')
        .single();

      if (existingInteraction) {
        // Remove upvote
        await supabase
          .from('post_interactions')
          .delete()
          .eq('id', existingInteraction.id);

        // Decrease upvote count
        await supabase
          .from('posts')
          .update({ upvotes: posts.find(p => p.id === postId)!.upvotes - 1 })
          .eq('id', postId);
      } else {
        // Add upvote
        await supabase
          .from('post_interactions')
          .insert({
            user_id: user.id,
            post_id: postId,
            interaction_type: 'upvote'
          });

        // Increase upvote count
        await supabase
          .from('posts')
          .update({ upvotes: posts.find(p => p.id === postId)!.upvotes + 1 })
          .eq('id', postId);
      }

      // Refresh posts
      fetchPosts();
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
          <p className="text-muted-foreground">No posts yet. Be the first to create one!</p>
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