import { useEffect, useState } from 'react';
import { supabase, type Post, type Comment, type User } from '../lib/supabase';

interface PostItemProps {
  post: Post;
  currentUser: User;
  onUpdate: () => void;
}

export function PostItem({ post, currentUser, onUpdate }: PostItemProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [post.id]);

  const loadComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, users(*)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });

    setComments(data || []);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const { error } = await supabase.from('comments').insert([
      {
        post_id: post.id,
        user_id: currentUser.id,
        content: newComment.trim(),
      },
    ]);

    if (!error) {
      setNewComment('');
      loadComments();
    }

    setIsSubmitting(false);
  };

  const handleDeletePost = async () => {
    if (!confirm('Delete this post?')) return;

    const { error } = await supabase.from('posts').delete().eq('id', post.id);

    if (!error) {
      onUpdate();
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    const { error } = await supabase.from('comments').delete().eq('id', commentId);

    if (!error) {
      loadComments();
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = post.status === 'open' ? 'resolved' : 'open';

    const { error } = await supabase
      .from('posts')
      .update({ status: newStatus })
      .eq('id', post.id);

    if (!error) {
      onUpdate();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getCategoryColor = () => {
    switch (post.category) {
      case 'question':
        return 'category-question';
      case 'announcement':
        return 'category-announcement';
      default:
        return 'category-update';
    }
  };

  return (
    <div className="post-item">
      <div className="post-header">
        <div className="post-meta">
          <span className="post-author">{post.users?.name || 'Unknown'}</span>
          <span className="post-date">{formatDate(post.created_at)}</span>
          <span className={`post-category ${getCategoryColor()}`}>
            {post.category}
          </span>
          {post.marketplace && (
            <span className="post-marketplace">{post.marketplace}</span>
          )}
          {post.status && (
            <span className={`post-status status-${post.status}`}>
              {post.status}
            </span>
          )}
        </div>
        {post.user_id === currentUser.id && (
          <button onClick={handleDeletePost} className="delete-btn" title="Delete post">
            ×
          </button>
        )}
      </div>

      <div className="post-content">{post.content}</div>

      <div className="post-actions">
        <button onClick={() => setShowComments(!showComments)} className="action-btn">
          💬 {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </button>
        {post.category === 'question' && post.user_id === currentUser.id && (
          <button onClick={handleToggleStatus} className="action-btn">
            {post.status === 'open' ? '✓ Mark Resolved' : '↻ Reopen'}
          </button>
        )}
      </div>

      {showComments && (
        <div className="comments-section">
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <span className="comment-author">{comment.users?.name || 'Unknown'}</span>
                  <span className="comment-date">{formatDate(comment.created_at)}</span>
                  {comment.user_id === currentUser.id && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="delete-btn"
                      title="Delete comment"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="comment-content">{comment.content}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="comment-form">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              disabled={isSubmitting}
            />
            <button type="submit" disabled={isSubmitting || !newComment.trim()}>
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
