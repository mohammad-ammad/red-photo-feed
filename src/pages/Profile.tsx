import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Grid3X3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getPostsByUserId, Post } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Layout from '@/components/Layout';

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const load = async () => {
      if (user) {
        const data = await getPostsByUserId(user.id);
        setPosts(data);
      }
    };
    load();
  }, [user]);

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="p-4">
        {/* Profile Header */}
        <div className="flex items-start gap-6 mb-6">
          <Avatar className="w-20 h-20">
            <AvatarImage src={user.avatar} alt={user.username} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-1">{user.username}</h2>
            {user.bio && (
              <p className="text-sm text-muted-foreground mb-3">{user.bio}</p>
            )}
            <div className="flex gap-6 text-sm">
              <div>
                <span className="font-semibold">{posts.length}</span>
                <span className="text-muted-foreground ml-1">posts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <Button
          variant="outline"
          className="w-full mb-6"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>

        {/* Posts Grid */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-center gap-2 mb-4 text-sm">
            <Grid3X3 className="w-4 h-4" />
            <span className="font-medium">Posts</span>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts yet</p>
              {user.role === 'creator' ? (
                <Button
                  variant="link"
                  className="text-primary mt-2"
                  onClick={() => navigate('/create')}
                >
                  Share your first photo
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">Only creators can upload posts.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="aspect-square bg-muted overflow-hidden"
                >
                  <img
                    src={post.imageUrl}
                    alt={post.caption}
                    className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
