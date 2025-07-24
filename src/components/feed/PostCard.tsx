import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUp, MapPin, Clock } from 'lucide-react';
import { Post } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
  onUpvote?: (postId: string) => void;
  showInteractions?: boolean;
}

export const PostCard = ({ post, onUpvote, showInteractions = true }: PostCardProps) => {
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.profiles?.avatar_url || undefined} />
            <AvatarFallback>
              {post.profiles?.username?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {post.profiles?.username || 'Anonymous User'}
            </p>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{timeAgo}</span>
              {post.location_name && (
                <>
                  <span>•</span>
                  <MapPin className="h-3 w-3" />
                  <span>{post.location_name}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
          <p className="text-muted-foreground">{post.description}</p>
        </div>
        
        {post.image_url && (
          <div className="rounded-lg overflow-hidden">
            <img 
              src={post.image_url} 
              alt={post.title}
              className="w-full h-48 object-cover"
            />
          </div>
        )}
        
        {post.post_tags && post.post_tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.post_tags.map((postTag) => (
              <Badge 
                key={postTag.tags.id} 
                variant="secondary"
                style={{ backgroundColor: postTag.tags.color + '20', color: postTag.tags.color }}
              >
                {postTag.tags.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      
      {showInteractions && (
        <CardFooter className="pt-0">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onUpvote?.(post.id)}
              className="flex items-center space-x-1"
            >
              <ArrowUp className="h-4 w-4" />
              <span>{post.upvotes}</span>
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};