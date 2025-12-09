import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  
  const isAmbassadorSignup = searchParams.get('type') === 'ambassador';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    applicationNote: ''
  });
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName
          },
          emailRedirectTo: redirectUrl
        }
      });
      
      if (signUpError) throw signUpError;
      
      if (authData.user && isAmbassadorSignup) {
        // Update profile with additional info
        await supabase.from('profiles').update({
          full_name: formData.fullName,
          phone: formData.phone
        }).eq('id', authData.user.id);
        
        // Call promote_to_ambassador function
        const { data: result, error: promoteError } = await supabase
          .rpc('promote_to_ambassador', { _user_id: authData.user.id });
        
        if (promoteError) throw promoteError;
        
        const promotionResult = result as { status: string; message: string };
        
        // Add application note if provided and user is pending
        if (formData.applicationNote && promotionResult.status === 'pending') {
          await supabase.from('pending_ambassadors').update({
            application_note: formData.applicationNote
          }).eq('user_id', authData.user.id);
        }
        
        if (promotionResult.status === 'approved') {
          toast({
            title: 'Welcome, Ambassador!',
            description: "Your account is ready. Let's set up your funnel.",
          });
          navigate('/ambassador/dashboard');
        } else {
          toast({
            title: 'Application Submitted',
            description: "Your application is under review. We'll notify you once approved.",
          });
          navigate('/pending');
        }
      } else {
        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account.',
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      
      if (error) throw error;
      
      // Check user role and redirect
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        
        if (roles?.some(r => r.role === 'admin')) {
          navigate('/admin/dashboard');
        } else if (roles?.some(r => r.role === 'ambassador')) {
          navigate('/ambassador/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isAmbassadorSignup ? 'Become an Ambassador' : mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-muted-foreground">
            {isAmbassadorSignup 
              ? 'Start earning income by sharing luxury travel opportunities' 
              : mode === 'signup' 
              ? 'Join Earth Resonance Wellness' 
              : 'Sign in to your account'}
          </p>
        </div>
        
        <form onSubmit={mode === 'signup' ? handleSignUp : handleSignIn} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          
          {mode === 'signup' && isAmbassadorSignup && (
            <>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="applicationNote">Why do you want to become an ambassador? (Optional)</Label>
                <Textarea
                  id="applicationNote"
                  rows={3}
                  placeholder="Share your passion for travel and helping others..."
                  value={formData.applicationNote}
                  onChange={(e) => setFormData({ ...formData, applicationNote: e.target.value })}
                />
              </div>
            </>
          )}
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
            {mode === 'signup' 
              ? (isAmbassadorSignup ? 'Apply as Ambassador' : 'Create Account')
              : 'Sign In'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
            className="text-sm text-primary hover:underline"
          >
            {mode === 'signup' ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
