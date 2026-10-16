'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  CheckSquare,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (!email || !password) {
      setError('Email and password are required');
      setIsLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      const serverMessage = err.response?.data?.message;
      const validationErrors = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : null;
      const fallbackMessage = err.message || 'Invalid email or password';

      setError(serverMessage || validationErrors || fallbackMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle modern ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* Login Card */}
      <Card className="w-full max-w-md border border-border/80 bg-card shadow-2xl backdrop-blur-md relative z-10">
        <CardHeader className="text-center pb-4 pt-6">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md text-white mb-1">
              <CheckSquare className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">TaskFlow</CardTitle>
            <CardDescription className="text-xs text-muted-foreground max-w-xs">
              Welcome back! Sign in to access your tasks and team workspace.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error message */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/15 border border-destructive/30 flex items-start gap-2.5 text-xs text-destructive animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email input */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  disabled={isLoading}
                  className="pl-9 h-10 bg-background text-sm"
                />
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="pl-9 pr-10 h-10 bg-background text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 mt-2 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 pt-2 pb-6 border-t border-border/60">
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-[11px] uppercase tracking-wider">Demo Accounts:</span>
              <span className="text-[11px] text-muted-foreground/75">Click to auto-fill</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-auto py-2 px-2.5 flex flex-col items-start gap-0.5 text-left border-border/80 hover:border-primary/50 hover:bg-muted/40 transition"
                onClick={() => {
                  setEmail('admin@example.com');
                  setPassword('password123');
                }}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <span>Admin</span>
                  <Badge variant="destructive" className="text-[9px] px-1 py-0 h-3.5 uppercase">Admin</Badge>
                </div>
                <span className="text-[11px] text-muted-foreground truncate w-full">admin@example.com</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-auto py-2 px-2.5 flex flex-col items-start gap-0.5 text-left border-border/80 hover:border-primary/50 hover:bg-muted/40 transition"
                onClick={() => {
                  setEmail('john@example.com');
                  setPassword('password123');
                }}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <span>Member</span>
                  <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5 uppercase">Member</Badge>
                </div>
                <span className="text-[11px] text-muted-foreground truncate w-full">john@example.com</span>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Password for all accounts:</span>
              <code className="text-foreground font-mono font-semibold bg-muted/60 px-1.5 py-0.5 rounded text-[11px]">
                password123
              </code>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
