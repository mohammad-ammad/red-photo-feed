import { useState, useEffect } from 'react';
import { getPosts, Post } from '@/lib/storage';
import PostCard from '@/components/PostCard';
import Layout from '@/components/Layout';

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  const loadPosts = async () => {
    const data = await getPosts();
    setPosts(data);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <Layout>
      <div className="divide-y divide-border">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <p className="text-muted-foreground">No posts yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Be the first to share something!
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={loadPosts} />
          ))
        )}
      </div>
    </Layout>
  );
};

export default Feed;
