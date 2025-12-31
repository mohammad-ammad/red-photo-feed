import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isSignUp) {
      if (!username.trim() || !email.trim() || !password.trim()) {
        toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
        setIsLoading(false);
        return;
      }
    } else {
      if (!email.trim() || !password.trim()) {
        toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
        setIsLoading(false);
        return;
      }
    }

    if (password.length < 4) {
      toast({
        title: 'Error',
        description: 'Password must be at least 4 characters',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const success = await signUp(username.trim(), email.trim(), password);
        if (success) {
          toast({ title: 'Welcome!', description: 'Your account has been created' });
          navigate('/feed');
        } else {
          toast({ title: 'Error', description: 'Username or email already taken', variant: 'destructive' });
        }
      } else {
        const success = await signIn(email.trim(), password);
        if (success) {
          toast({ title: 'Welcome back!', description: 'You have been signed in' });
          navigate('/feed');
        } else {
          toast({ title: 'Error', description: 'Invalid email or password', variant: 'destructive' });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Gallery</h1>
          <p className="text-muted-foreground">Share your moments</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username (display name)"
                className="h-12"
                autoComplete="username"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
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
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 font-semibold"
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>

        {/* Toggle */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <span className="text-primary font-medium">Sign In</span>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <span className="text-primary font-medium">Sign Up</span>
              </>
            )}
          </button>
        </div>

        {/* Demo hint */}
        <div className="text-center text-xs text-muted-foreground bg-secondary/50 rounded-lg p-3">
          <p className="font-medium mb-1">Demo Account</p>
          <p>Email: demo_user@example.com • Password: demo123</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
