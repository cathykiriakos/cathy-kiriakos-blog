import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import type { User } from '@supabase/supabase-js';

// Comma-separated list of emails allowed into /admin.
// e.g. VITE_ALLOWED_ADMIN_EMAIL="you@gmail.com,admin@yourdomain.com"
const ALLOWED_EMAILS: string[] = (import.meta.env.VITE_ALLOWED_ADMIN_EMAIL ?? '')
  .split(',')
  .map((e: string) => e.trim())
  .filter(Boolean);

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard = ({ children }: AdminGuardProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes (handles OAuth redirect return)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Checking access...</p>
      </div>
    );
  }

  // Not signed in → redirect to login page
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Signed in but not an authorized email → access denied
  if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(user.email ?? '')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md mx-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <svg className="h-6 w-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground text-sm">
            <strong>{user.email}</strong> is not authorized to access this panel.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => supabase.auth.signOut()}
          >
            Sign out and try another account
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;
