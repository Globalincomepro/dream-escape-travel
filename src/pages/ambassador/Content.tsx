import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Upload, Loader2, Trash2, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ContentItem {
  id: string;
  title?: string;
  file_url: string;
  thumbnail_url?: string;
  caption_text?: string;
  caption?: string;
  content_type: string;
  is_featured?: boolean;
}

export default function AmbassadorContent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [libraryContent, setLibraryContent] = useState<ContentItem[]>([]);
  const [myContent, setMyContent] = useState<ContentItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [newCaption, setNewCaption] = useState("");
  const [funnelSlug, setFunnelSlug] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      setUserId(user.id);

      // Load funnel for generating links
      const { data: funnel } = await supabase
        .from("ambassador_funnels")
        .select("funnel_slug")
        .eq("user_id", user.id)
        .single();
      
      if (funnel) {
        setFunnelSlug(funnel.funnel_slug);
      }

      // Load content library
      const { data: library, error: libraryError } = await supabase
        .from("content_library")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (libraryError) throw libraryError;
      setLibraryContent(library || []);

      // Load ambassador's own content
      const { data: myContentData, error: myContentError } = await supabase
        .from("ambassador_content")
        .select("*")
        .eq("ambassador_id", user.id)
        .order("created_at", { ascending: false });

      if (myContentError) throw myContentError;
      setMyContent(myContentData || []);
    } catch (error: any) {
      toast({
        title: "Error loading content",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = async (url: string) => {
    try {
      const { error } = await supabase
        .from("ambassador_content")
        .insert({
          ambassador_id: userId,
          file_url: url,
          content_type: "image",
          caption: newCaption || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content uploaded successfully"
      });

      setNewCaption("");
      loadData();
    } catch (error: any) {
      toast({
        title: "Error saving content",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCopyCaption = (content: ContentItem) => {
    const caption = content.caption_text || content.caption || "";
    const funnelLink = funnelSlug ? `${window.location.origin}/f/${funnelSlug}` : "";
    const fullCaption = caption + (caption && funnelLink ? "\n\n" : "") + (funnelLink ? `🌍 Learn more: ${funnelLink}` : "");
    
    navigator.clipboard.writeText(fullCaption);
    toast({
      title: "Caption Copied!",
      description: "Caption with your funnel link has been copied to clipboard"
    });
  };

  const handleDownloadImage = async (content: ContentItem) => {
    try {
      const imageUrl = content.file_url || content.thumbnail_url;
      if (!imageUrl) {
        toast({
          title: "No image available",
          description: "This content doesn't have an image to download",
          variant: "destructive"
        });
        return;
      }

      // Fetch the image and create a download link
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `travel-content-${content.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started!",
        description: "Your image is being downloaded"
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error downloading the image",
        variant: "destructive"
      });
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('ambassador_content')
        .delete()
        .eq('id', contentId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Content deleted successfully"
      });
      
      // Refresh the content list
      await loadData();
    } catch (error: any) {
      toast({
        title: "Error deleting content",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-3xl font-bold">Content Library</h1>
            <p className="text-muted-foreground">Download images and copy captions to share on your social media</p>
          </div>
        </div>

        <Tabs defaultValue="library" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="library">Content Library</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
            <TabsTrigger value="my-content">My Content</TabsTrigger>
          </TabsList>

          <TabsContent value="library">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {libraryContent.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <img
                      src={item.thumbnail_url || item.file_url}
                      alt={item.title || "Content"}
                      className="w-full h-full object-cover"
                    />
                    {item.is_featured && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
                        Featured
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{item.title || "Untitled"}</h3>
                    {item.caption_text && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {item.caption_text}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button onClick={() => handleCopyCaption(item)} variant="outline" className="flex-1">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Caption
                      </Button>
                      <Button onClick={() => handleDownloadImage(item)} className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upload">
            <Card className="p-6 max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold mb-4">Upload Your Travel Content</h2>
              <div className="space-y-4">
                <ImageUpload
                  bucketName="ambassador-content"
                  currentImageUrl={null}
                  onUploadComplete={handleUploadComplete}
                  label="Upload Photo or Video"
                  maxSizeMB={50}
                  acceptedTypes={["jpg", "jpeg", "png", "gif", "webp", "mp4", "mov"]}
                  aspectRatio="16/9"
                />
                <div>
                  <label className="text-sm font-medium mb-2 block">Caption (Optional)</label>
                  <Textarea
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    placeholder="Add a caption for your content..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your funnel link will be automatically added when you copy the caption
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="my-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myContent.length === 0 ? (
                <Card className="col-span-full p-8 text-center">
                  <p className="text-muted-foreground mb-4">You haven't uploaded any content yet</p>
                  <Button onClick={() => document.querySelector('[value="upload"]')?.dispatchEvent(new MouseEvent('click'))}>
                    Upload Your First Photo
                  </Button>
                </Card>
              ) : (
                myContent.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="aspect-video relative">
                      <img
                        src={item.thumbnail_url || item.file_url}
                        alt="Your content"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      {item.caption && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {item.caption}
                        </p>
                      )}
                      <div className="flex gap-2 mb-2">
                        <Button 
                          onClick={() => handleCopyCaption(item)} 
                          variant="outline"
                          className="flex-1"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                        <Button 
                          onClick={() => handleDownloadImage(item)} 
                          className="flex-1"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="w-full"
                        onClick={() => handleDeleteContent(item.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

    </div>
  );
}
