import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

type AppRole = 'prospect' | 'guest' | 'vip' | 'ambassador' | 'admin';

export const ProtectedRoute = ({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactNode;
  requiredRole: AppRole;
}) => {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  
  useEffect(() => {
    checkAccess();
  }, []);
  
  const checkAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setHasAccess(false);
      setLoading(false);
      return;
    }
    
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    
    const userHasRole = roles?.some(r => r.role === requiredRole);
    setHasAccess(!!userHasRole);
    setLoading(false);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!hasAccess) return <Navigate to="/auth" />;
  
  return <>{children}</>;
};
