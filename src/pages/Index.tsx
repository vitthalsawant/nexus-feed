import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { FeedTabs } from '@/components/feed/FeedTabs';
import { CreatePostDialog } from '@/components/post/CreatePostDialog';

const Index = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);

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
