import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Post } from '@/types';
import { PostCard } from './PostCard';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const PersonalizedFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPersonalizedPosts();
    }
  }, [user]);

  const fetchPersonalizedPosts = async () => {
    if (!user) return;

    try {
      // Get user's interested tags
      const { data: userInterests } = await supabase
        .from('user_interests')
        .select('tag_id, interest_score')
        .eq('user_id', user.id);

      const interestedTagIds = userInterests?.map(ui => ui.tag_id) || [];

      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles (id, username, avatar_url),
          post_tags (
            tags (id, name, color)
          )
        `)
        .order('created_at', { ascending: false });

      // If user has interests, prioritize posts with those tags
      if (interestedTagIds.length > 0) {
        const { data: personalizedPosts } = await supabase
          .from('posts')
          .select(`
            *,
            profiles (id, username, avatar_url),
            post_tags!inner (
              tags (id, name, color)
            )
          `)
          .in('post_tags.tag_id', interestedTagIds)
          .order('created_at', { ascending: false })
          .limit(10);

        // Get some general posts too
        const { data: generalPosts } = await supabase
          .from('posts')
          .select(`
            *,
            profiles (id, username, avatar_url),
            post_tags (
              tags (id, name, color)
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        // Combine and deduplicate
        const allPosts = [...(personalizedPosts || []), ...(generalPosts || [])];
        const uniquePosts = allPosts.filter((post, index, self) => 
          index === self.findIndex(p => p.id === post.id)
        );

        setPosts(uniquePosts as any);
      } else {
        // No interests yet, show all posts
        const { data, error } = await query;
        if (error) throw error;
        setPosts((data as any) || []);
      }
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
    if (!user) return;

    try {
      // Same upvote logic as GlobalFeed
      const { data: existingInteraction } = await supabase
        .from('post_interactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .eq('interaction_type', 'upvote')
        .single();

      if (existingInteraction) {
        await supabase
          .from('post_interactions')
          .delete()
          .eq('id', existingInteraction.id);

        await supabase
          .from('posts')
          .update({ upvotes: posts.find(p => p.id === postId)!.upvotes - 1 })
          .eq('id', postId);
      } else {
        await supabase
          .from('post_interactions')
          .insert({
            user_id: user.id,
            post_id: postId,
            interaction_type: 'upvote'
          });

        await supabase
          .from('posts')
          .update({ upvotes: posts.find(p => p.id === postId)!.upvotes + 1 })
          .eq('id', postId);

        // Update user interests based on upvoted post tags
        const post = posts.find(p => p.id === postId);
        if (post?.post_tags) {
          for (const postTag of post.post_tags) {
            await supabase
              .from('user_interests')
              .upsert({
                user_id: user.id,
                tag_id: postTag.tags.id,
                interest_score: 1
              }, {
                onConflict: 'user_id,tag_id',
                ignoreDuplicates: false
              });
          }
        }
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