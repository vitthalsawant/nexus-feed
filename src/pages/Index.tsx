import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthPage } from '@/components/auth/AuthPage';
import { Header } from '@/components/layout/Header';
import { FeedTabs } from '@/components/feed/FeedTabs';
import { CreatePostDialog } from '@/components/post/CreatePostDialog';

const Index = () => {
  const { user, loading } = useAuth();
  const [showCreatePost, setShowCreatePost] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const handlePostCreated = () => {
    // This will trigger a refresh of the feeds
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onCreatePost={() => setShowCreatePost(true)} />
      
      <main className="container max-w-2xl mx-auto px-4 py-6">
        <FeedTabs />
      </main>
      
      <CreatePostDialog
        open={showCreatePost}
        onOpenChange={setShowCreatePost}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default Index;
