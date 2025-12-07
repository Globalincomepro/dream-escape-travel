import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Eye, Users, TrendingUp, Copy, ExternalLink, LogOut, Settings, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

type AmbassadorFunnel = {
  id: string;
  funnel_slug: string;
};

const AmbassadorDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [funnel, setFunnel] = useState<AmbassadorFunnel | null>(null);
  const [stats, setStats] = useState({
    pageViews: 0,
    leads: 0,
    conversions: 0
  });
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Load profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', user.id)
      .single();
    setProfile(profileData);
    
    // Load funnel
    const { data: funnelData } = await supabase
      .from('ambassador_funnels')
      .select('id, funnel_slug')
      .eq('user_id', user.id)
      .single();
    setFunnel(funnelData);
    
    // Load stats
    const [views, leads, conversions] = await Promise.all([
      supabase
        .from('funnel_analytics')
        .select('*', { count: 'exact', head: true })
        .eq('ambassador_id', user.id)
        .eq('event_type', 'page_view'),
      
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('ambassador_id', user.id),
      
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('ambassador_id', user.id)
        .in('status', ['guest', 'vip', 'ambassador'])
    ]);
    
    setStats({
      pageViews: views.count || 0,
      leads: leads.count || 0,
      conversions: conversions.count || 0
    });
  };
  
  const copyFunnelURL = () => {
    if (funnel) {
      const url = `${window.location.origin}/f/${funnel.funnel_slug}`;
      navigator.clipboard.writeText(url);
      toast({
        title: 'Copied!',
        description: 'Your funnel URL has been copied to clipboard'
      });
    }
  };
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback>{profile?.full_name?.[0] || 'A'}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name}!</h1>
              <p className="text-muted-foreground">Here's your ambassador performance</p>
            </div>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Page Views</p>
                <p className="text-3xl font-bold">{stats.pageViews}</p>
              </div>
              <Eye className="w-8 h-8 text-primary" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Leads Captured</p>
                <p className="text-3xl font-bold">{stats.leads}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Conversions</p>
                <p className="text-3xl font-bold">{stats.conversions}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </Card>
        </div>
        
        {/* Funnel URL Card */}
        {funnel && (
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Your Personal Funnel</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-muted px-4 py-3 rounded-md font-mono text-sm">
                {window.location.origin}/f/{funnel.funnel_slug}
              </div>
              <Button onClick={copyFunnelURL} variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button onClick={() => window.open(`/f/${funnel.funnel_slug}`, '_blank')}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>
          </Card>
        )}
        
        {/* Content Library */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Content Library</h3>
          <p className="text-muted-foreground mb-4">
            Browse ready-to-use travel images and captions. Download images and copy captions to share on your social media!
          </p>
          <Button onClick={() => navigate('/ambassador/content')}>
            <Share2 className="w-4 h-4 mr-2" />
            Browse Content
          </Button>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Customize Your Funnel</h3>
            <p className="text-muted-foreground mb-4">
              Edit your profile, headline, images, and more
            </p>
            <Button onClick={() => navigate('/ambassador/settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Funnel Settings
            </Button>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Share Your Funnel</h3>
            <p className="text-muted-foreground mb-4">
              Copy your unique link and share it on social media, email, or with friends
            </p>
            <Button onClick={copyFunnelURL}>
              Copy Funnel Link
            </Button>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Track Your Progress</h3>
            <p className="text-muted-foreground mb-4">
              Monitor how many people view your funnel and become leads
            </p>
            <Button variant="outline" onClick={() => navigate('/my-leads')}>
              View My Leads
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AmbassadorDashboard;
