import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, LayoutDashboard, LogIn, Compass, Calculator } from 'lucide-react';

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
        
        <div className="flex items-center gap-2 md:gap-3">
          {/* Quiz & Calculator - Always visible */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/quiz')}
            className="hidden sm:flex items-center gap-2"
          >
            <Compass className="w-4 h-4" />
            <span className="hidden md:inline">Quiz</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/calculator')}
            className="hidden sm:flex items-center gap-2"
          >
            <Calculator className="w-4 h-4" />
            <span className="hidden md:inline">Savings</span>
          </Button>
          
          <div className="h-6 w-px bg-border hidden sm:block" />
          
          {user ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/my-leads')}
                className="flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden md:inline">My Leads</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Sign Out</span>
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
              <span className="hidden md:inline">Login</span>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};
