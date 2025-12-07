import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, LayoutDashboard, LogIn, Shield, Users } from 'lucide-react';

export const Navigation = () => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAmbassador, setIsAmbassador] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkRoles(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkRoles(session.user.id);
      } else {
        setIsAdmin(false);
        setIsAmbassador(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkRoles = async (userId: string) => {
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    if (roles) {
      setIsAdmin(roles.some(r => r.role === 'admin'));
      setIsAmbassador(roles.some(r => r.role === 'ambassador'));
    }
  };

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
              {isAdmin && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate('/admin/dashboard')}
                  className="flex items-center gap-2 bg-primary"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Button>
              )}
              {isAmbassador && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/ambassador/dashboard')}
                  className="flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
              )}
              {isAmbassador && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/my-leads')}
                  className="flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Leads
                </Button>
              )}
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
