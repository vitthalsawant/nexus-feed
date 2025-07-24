export interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  description: string;
  author_id: string;
  image_url: string | null;
  location_lat: number | null;
  location_lng: number | null;
  location_name: string | null;
  upvotes: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile | null;
  post_tags?: { tags: Tag }[];
}

export interface PostTag {
  id: string;
  post_id: string;
  tag_id: string;
  tags: Tag;
}

export interface UserInterest {
  id: string;
  user_id: string;
  tag_id: string;
  interest_score: number;
  created_at: string;
  tags: Tag;
}

export interface PostInteraction {
  id: string;
  user_id: string;
  post_id: string;
  interaction_type: 'view' | 'upvote' | 'bookmark';
  created_at: string;
}

export interface CreatePostData {
  title: string;
  description: string;
  tags: string[];
  image_url?: string;
  location_lat?: number;
  location_lng?: number;
  location_name?: string;
}