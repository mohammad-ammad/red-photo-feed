import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImagePlus } from 'lucide-react';
import { createPost } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';

const CreatePost = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [peoplePresent, setPeoplePresent] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an image URL',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const post = await createPost(
      imageUrl.trim(), 
      caption.trim(), 
      location.trim() || undefined,
      peoplePresent.trim() || undefined,
      rating > 0 ? rating : undefined
    );

    if (post) {
      toast({
        title: 'Posted!',
        description: 'Your photo has been shared',
      });
      navigate('/feed');
    } else {
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    <Layout>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-6">Create Post</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Preview */}
          <div className="aspect-square bg-secondary rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-border">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => {
                  toast({
                    title: 'Invalid image',
                    description: 'Could not load image from URL',
                    variant: 'destructive',
                  });
                }}
              />
            ) : (
              <div className="text-center text-muted-foreground p-4">
                <ImagePlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Enter an image URL below</p>
              </div>
            )}
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="h-12"
            />
            <p className="text-xs text-muted-foreground">
              Tip: Use images from Unsplash (right-click → Copy image address)
            </p>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location (optional)</Label>
            <Input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add a location..."
              className="h-12"
            />
          </div>

          {/* People Present */}
          <div className="space-y-2">
            <Label htmlFor="peoplePresent">People Present (optional)</Label>
            <Input
              id="peoplePresent"
              type="text"
              value={peoplePresent}
              onChange={(e) => setPeoplePresent(e.target.value)}
              placeholder="Tag people..."
              className="h-12"
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label htmlFor="rating">Rating (optional)</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(rating === star ? 0 : star)}
                  className="text-3xl transition-all hover:scale-110"
                >
                  {star <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 font-semibold"
            disabled={isLoading || !imageUrl.trim()}
          >
            {isLoading ? 'Posting...' : 'Share Post'}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default CreatePost;
