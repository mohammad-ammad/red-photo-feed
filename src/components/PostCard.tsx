import { useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { Post, toggleLike, addComment, getUserById, getCurrentUser } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PostCardProps {
  post: Post;
  onUpdate: () => void;
}

const PostCard = ({ post, onUpdate }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  const currentUser = getCurrentUser();
  const postUser = getUserById(post.userId);
  const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;

  const handleLike = async () => {
    if (!currentUser) return;
    setIsLikeAnimating(true);
    await toggleLike(post.id);
    await onUpdate();
    setTimeout(() => setIsLikeAnimating(false), 300);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;
    await addComment(post.id, commentText.trim());
    setCommentText('');
    await onUpdate();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <article className="bg-card border-b border-border">
      {/* Header */}
      <div className="p-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={postUser?.avatar} alt={postUser?.username} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {postUser?.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm">{postUser?.username}</span>
        </div>
        {post.location && (
          <div className="text-xs text-muted-foreground mt-1 ml-11">
            📍 {post.location}
          </div>
        )}
      </div>

      {/* Image */}
      <div className="aspect-square bg-muted">
        <img
          src={post.imageUrl}
          alt={post.caption}
          className="w-full h-full object-cover"
          onDoubleClick={handleLike}
        />
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={handleLike}
            className={`transition-transform ${isLikeAnimating ? 'animate-heart' : ''}`}
          >
            <Heart
              className={`w-6 h-6 transition-colors ${
                isLiked ? 'fill-primary text-primary' : 'text-foreground hover:text-muted-foreground'
              }`}
            />
          </button>
          <button onClick={() => setShowComments(!showComments)}>
            <MessageCircle className="w-6 h-6 text-foreground hover:text-muted-foreground transition-colors" />
          </button>
        </div>

        {/* Likes */}
        {post.likes.length > 0 && (
          <p className="font-semibold text-sm mb-1">
            {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
          </p>
        )}

        {/* Caption */}
        <p className="text-sm">
          <span className="font-medium mr-2">{postUser?.username}</span>
          {post.caption}
        </p>

        {/* People Present */}
        {post.peoplePresent && (
          <p className="text-xs text-muted-foreground mt-1">
            👥 With {post.peoplePresent}
          </p>
        )}

        {/* Rating */}
        {post.rating && post.rating > 0 && (
          <div className="text-sm mt-1">
            {'⭐'.repeat(post.rating)}
          </div>
        )}

        {/* Comments preview */}
        {post.comments.length > 0 && !showComments && (
          <button
            onClick={() => setShowComments(true)}
            className="text-muted-foreground text-sm mt-1"
          >
            View all {post.comments.length} comments
          </button>
        )}

        {/* Comments section */}
        {showComments && (
          <div className="mt-3 space-y-2">
            {post.comments.map((comment) => {
              const commentUser = getUserById(comment.userId);
              return (
                <p key={comment.id} className="text-sm">
                  <span className="font-medium mr-2">{commentUser?.username}</span>
                  {comment.text}
                </p>
              );
            })}
          </div>
        )}

        {/* Add comment */}
        <form onSubmit={handleComment} className="flex gap-2 mt-3">
          <Input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 h-9 text-sm border-0 bg-secondary"
          />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="text-primary font-semibold hover:text-primary/80"
            disabled={!commentText.trim()}
          >
            Post
          </Button>
        </form>

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground mt-2">{formatDate(post.createdAt)}</p>
      </div>
    </article>
  );
};

export default PostCard;
