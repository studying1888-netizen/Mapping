import { type Post, type User } from '../lib/supabase';
import { PostItem } from './PostItem';

interface PostListProps {
  posts: Post[];
  currentUser: User;
  onUpdate: () => void;
}

export function PostList({ posts, currentUser, onUpdate }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="empty-state">
        <p>No posts yet. Be the first to share an update!</p>
      </div>
    );
  }

  return (
    <div className="post-list">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} currentUser={currentUser} onUpdate={onUpdate} />
      ))}
    </div>
  );
}
