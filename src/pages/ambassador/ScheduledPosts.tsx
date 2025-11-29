import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Calendar, Send, XCircle, RotateCw, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ScheduledPost {
  id: string;
  custom_caption: string | null;
  scheduled_time: string;
  posted_at: string | null;
  status: string;
  platforms: string[];
  error_message: string | null;
  content_file_url: string;
  content_thumbnail_url: string | null;
}

export default function ScheduledPosts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pendingPosts, setPendingPosts] = useState<ScheduledPost[]>([]);
  const [postedPosts, setPostedPosts] = useState<ScheduledPost[]>([]);
  const [failedPosts, setFailedPosts] = useState<ScheduledPost[]>([]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Load all scheduled posts
      const { data: posts, error } = await supabase
        .from("scheduled_posts")
        .select("*")
        .eq("ambassador_id", user.id)
        .order("scheduled_time", { ascending: true });

      if (error) throw error;

      // Separate posts by status
      setPendingPosts(posts?.filter(p => p.status === 'pending' || p.status === 'processing' || p.status === 'cancelled') || []);
      setPostedPosts(posts?.filter(p => p.status === 'posted') || []);
      setFailedPosts(posts?.filter(p => p.status === 'failed') || []);
    } catch (error: any) {
      toast({
        title: "Error loading posts",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("scheduled_posts")
        .update({ status: 'cancelled' })
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post cancelled"
      });

      loadPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handlePostNow = async (postId: string) => {
    try {
      // Verify user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in again",
          variant: "destructive"
        });
        navigate("/auth");
        return;
      }

      console.log('Calling send-social-post with postId:', postId);
      
      const { data, error } = await supabase.functions.invoke("send-social-post", {
        body: { postId }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to send post');
      }

      toast({
        title: "Success",
        description: "Post sent to social media"
      });

      loadPosts();
    } catch (error: any) {
      console.error('handlePostNow error:', error);
      toast({
        title: "Failed to send content",
        description: error.message || "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const handleRetry = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("scheduled_posts")
        .update({ status: 'pending', error_message: null })
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post rescheduled"
      });

      loadPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("scheduled_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post deleted successfully"
      });

      loadPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const PostCard = ({ post }: { post: ScheduledPost }) => {
    const imageUrl = post.content_thumbnail_url || post.content_file_url;

    return (
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
            {imageUrl && (
              <img src={imageUrl} alt="Post content" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold line-clamp-1">
                Scheduled Post
              </h3>
              <Badge variant={
                post.status === 'posted' ? 'default' :
                post.status === 'failed' ? 'destructive' :
                'secondary'
              }>
                {post.status}
              </Badge>
            </div>
            
            {post.custom_caption && (
              <div className="mb-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.custom_caption}
                </p>
                <p className="text-xs text-muted-foreground mt-1 italic">
                  + funnel link (added when posting)
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-3">
              {post.platforms.map(platform => (
                <Badge key={platform} variant="outline" className="capitalize">
                  {platform}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(post.scheduled_time), "MMM d, yyyy 'at' h:mm a")}
              </div>
              {post.posted_at && (
                <div className="text-green-600">
                  Posted {format(new Date(post.posted_at), "MMM d, h:mm a")}
                </div>
              )}
            </div>

            {post.error_message && (
              <p className="text-sm text-destructive mb-3">
                Error: {post.error_message}
              </p>
            )}

            <div className="flex gap-2">
              {post.status === 'pending' && (
                <>
                  <Button size="sm" onClick={() => handlePostNow(post.id)}>
                    <Send className="w-4 h-4 mr-1" />
                    Post Now
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleCancel(post.id)}>
                    <XCircle className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </>
              )}
              {post.status === 'cancelled' && (
                <Button size="sm" variant="destructive" onClick={() => handleDelete(post.id)}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              )}
              {post.status === 'failed' && (
                <>
                  <Button size="sm" variant="outline" onClick={() => handleRetry(post.id)}>
                    <RotateCw className="w-4 h-4 mr-1" />
                    Retry
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(post.id)}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/ambassador/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Scheduled Posts</h1>
            <p className="text-muted-foreground">Manage your social media post queue</p>
          </div>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Pending ({pendingPosts.length})
            </TabsTrigger>
            <TabsTrigger value="posted">
              Posted ({postedPosts.length})
            </TabsTrigger>
            <TabsTrigger value="failed">
              Failed ({failedPosts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingPosts.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No pending posts</p>
                <Button onClick={() => navigate("/ambassador/content")}>
                  Schedule Your First Post
                </Button>
              </Card>
            ) : (
              pendingPosts.map(post => <PostCard key={post.id} post={post} />)
            )}
          </TabsContent>

          <TabsContent value="posted" className="space-y-4">
            {postedPosts.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No posts have been published yet</p>
              </Card>
            ) : (
              postedPosts.map(post => <PostCard key={post.id} post={post} />)
            )}
          </TabsContent>

          <TabsContent value="failed" className="space-y-4">
            {failedPosts.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No failed posts</p>
              </Card>
            ) : (
              failedPosts.map(post => <PostCard key={post.id} post={post} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
