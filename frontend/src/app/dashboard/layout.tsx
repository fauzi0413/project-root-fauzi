'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, Menu, LayoutDashboard, CheckSquare, Sparkles, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm text-white">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold tracking-tight text-foreground leading-none">TaskFlow</span>
                <span className="text-[11px] text-muted-foreground font-medium mt-0.5">Task Management</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-3 border-l border-border/60">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold text-sm">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground leading-none">{user?.name}</span>
                  <Badge variant={user?.role === 'admin' ? 'destructive' : 'secondary'} className="text-[10px] px-1.5 py-0 h-4 uppercase tracking-wider font-semibold">
                    {user?.role}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground mt-0.5">{user?.email}</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 border-r border-border bg-card/40 backdrop-blur-sm p-4 flex flex-col justify-between shrink-0 transition-all duration-200">
            <div className="space-y-6">
              <div>
                <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Navigation
                </p>
                <nav className="space-y-1">
                  <a
                    href="/dashboard"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/20 transition-colors shadow-xs"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </a>
                </nav>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border/60 bg-muted/30">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Real-time Sync Active</span>
              </div>
            </div>
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
