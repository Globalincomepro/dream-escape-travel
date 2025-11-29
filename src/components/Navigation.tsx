import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, LayoutDashboard, LogIn } from 'lucide-react';

export const Navigation = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="w-full py-4 px-6 bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h2 className="text-xl font-bold text-foreground cursor-pointer" onClick={() => navigate('/')}>
          Earth Resonance Wellness
        </h2>
        
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/my-leads')}
                className="flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                My Leads
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};
