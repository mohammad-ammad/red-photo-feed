import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const AdminAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signInAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!email.trim() || !password.trim()) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    try {
      const success = await signInAdmin(email.trim(), password);
      if (success) {
        toast({ title: 'Welcome, creator!', description: 'You have been signed in' });
        navigate('/admin/create');
      } else {
        toast({ title: 'Error', description: 'Invalid credentials or not a creator', variant: 'destructive' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Admin Login</h1>
          <p className="text-muted-foreground">Creators login here to upload posts</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your admin email"
              className="h-12"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="h-12"
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 font-semibold"
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground bg-secondary/50 rounded-lg p-3">
          <p className="font-medium mb-1">Creator Demo</p>
          <p>Email: demo_user@example.com • Password: demo123</p>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
