import { useState, useEffect, useMemo } from 'react';
import { getPosts, getUserById, Post } from '@/lib/storage';
import PostCard from '@/components/PostCard';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [query, setQuery] = useState('');

  const loadPosts = async () => {
    const data = await getPosts();
    setPosts(data);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => {
      const caption = (p.caption || '').toLowerCase();
      const user = getUserById(p.userId);
      const username = (user?.username || '').toLowerCase();
      return caption.includes(q) || username.includes(q);
    });
  }, [posts, query]);

  return (
    <Layout>
      <div className="p-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by caption or username"
          className="mb-3"
        />
      </div>
      <div className="divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <p className="text-muted-foreground">No posts found</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different search term.</p>
          </div>
        ) : (
          filtered.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={loadPosts} />
          ))
        )}
      </div>
    </Layout>
  );
};

export default Feed;
