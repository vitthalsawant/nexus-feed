import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, MapPin, ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CreatePostData } from '@/types';

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated: () => void;
}

export const CreatePostDialog = ({ open, onOpenChange, onPostCreated }: CreatePostDialogProps) => {
  const [formData, setFormData] = useState<CreatePostData>({
    title: '',
    description: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title.trim() || !formData.description.trim()) return;

    setLoading(true);
    try {
      // Create the post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          title: formData.title,
          description: formData.description,
          author_id: user.id,
          image_url: formData.image_url || null,
          location_lat: formData.location_lat || null,
          location_lng: formData.location_lng || null,
          location_name: formData.location_name || null
        })
        .select()
        .single();

      if (postError) throw postError;

      // Handle tags
      if (formData.tags.length > 0) {
        for (const tagName of formData.tags) {
          // First, try to get existing tag or create new one
          let { data: tag, error: tagError } = await supabase
            .from('tags')
            .select('id')
            .eq('name', tagName)
            .single();

          if (tagError || !tag) {
            // Create new tag
            const { data: newTag, error: createTagError } = await supabase
              .from('tags')
              .insert({ name: tagName })
              .select('id')
              .single();

            if (createTagError) throw createTagError;
            tag = newTag;
          }

          // Link tag to post
          const { error: linkError } = await supabase
            .from('post_tags')
            .insert({
              post_id: post.id,
              tag_id: tag.id
            });

          if (linkError) throw linkError;
        }
      }

      toast({
        title: "Success",
        description: "Post created successfully!"
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        tags: []
      });
      onOpenChange(false);
      onPostCreated();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by this browser",
        variant: "destructive"
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          location_lat: position.coords.latitude,
          location_lng: position.coords.longitude,
          location_name: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
        }));
        toast({
          title: "Location added",
          description: "Current location has been added to your post"
        });
      },
      (error) => {
        toast({
          title: "Error",
          description: "Failed to get current location",
          variant: "destructive"
        });
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter post title..."
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What's on your mind?"
              className="min-h-[100px]"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="image">Image URL (optional)</Label>
            <Input
              id="image"
              type="url"
              value={formData.image_url || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="flex space-x-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button
              type="button"
              onClick={getLocation}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <MapPin className="h-4 w-4" />
              <span>Add Location</span>
            </Button>
            
            {formData.location_name && (
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {formData.location_name}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    location_lat: undefined,
                    location_lng: undefined,
                    location_name: undefined
                  }))}
                />
              </Badge>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.title.trim() || !formData.description.trim()}>
              {loading ? 'Creating...' : 'Create Post'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};