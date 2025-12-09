import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Trash2, ChevronUp, ChevronDown, Image as ImageIcon } from "lucide-react";

interface GalleryImage {
  id: string;
  image_url: string;
  location: string;
  caption: string;
  sort_order: number;
}

interface GallerySettingsTabProps {
  funnelId: string;
}

export const GallerySettingsTab = ({ funnelId }: GallerySettingsTabProps) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadGalleryImages();
  }, [funnelId]);

  const loadGalleryImages = async () => {
    try {
      const { data, error } = await supabase
        .from("funnel_gallery_images")
        .select("*")
        .eq("funnel_id", funnelId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error("Error loading gallery images:", error);
      toast({
        title: "Error",
        description: "Failed to load gallery images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 5) {
      toast({
        title: "File too large",
        description: "Maximum size is 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/gallery-${timestamp}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("gallery-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("gallery-images")
        .getPublicUrl(fileName);

      // Add to database
      const newSortOrder = images.length > 0 ? Math.max(...images.map(img => img.sort_order)) + 1 : 0;
      
      const { data, error } = await supabase
        .from("funnel_gallery_images")
        .insert({
          funnel_id: funnelId,
          image_url: publicUrl,
          location: "New Location",
          caption: "Add a caption for this image",
          sort_order: newSortOrder,
        })
        .select()
        .single();

      if (error) throw error;

      setImages([...images, data]);
      setEditingImage(data.id);
      
      toast({
        title: "Success",
        description: "Image added to gallery",
      });
    } catch (error: any) {
      console.error("Error adding image:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add image to gallery",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUpdateImage = async (id: string, updates: Partial<GalleryImage>) => {
    try {
      const { error } = await supabase
        .from("funnel_gallery_images")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      setImages(images.map(img => img.id === id ? { ...img, ...updates } : img));
      
      toast({
        title: "Success",
        description: "Image updated",
      });
    } catch (error) {
      console.error("Error updating image:", error);
      toast({
        title: "Error",
        description: "Failed to update image",
        variant: "destructive",
      });
    }
  };

  const handleDeleteImage = async (id: string, imageUrl: string) => {
    try {
      const { error: dbError } = await supabase
        .from("funnel_gallery_images")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      // Try to delete from storage (don't fail if it doesn't exist)
      const urlPath = imageUrl.split('/').slice(-2).join('/');
      await supabase.storage.from("gallery-images").remove([urlPath]);

      setImages(images.filter(img => img.id !== id));
      
      toast({
        title: "Success",
        description: "Image deleted",
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  const moveImage = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = images.findIndex(img => img.id === id);
    if ((direction === 'up' && currentIndex === 0) || 
        (direction === 'down' && currentIndex === images.length - 1)) {
      return;
    }

    const newImages = [...images];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [newImages[currentIndex], newImages[targetIndex]] = [newImages[targetIndex], newImages[currentIndex]];

    // Update sort orders
    const updates = newImages.map((img, index) => ({
      id: img.id,
      sort_order: index,
    }));

    try {
      setSaving(true);
      for (const update of updates) {
        await supabase
          .from("funnel_gallery_images")
          .update({ sort_order: update.sort_order })
          .eq("id", update.id);
      }

      setImages(newImages.map((img, index) => ({ ...img, sort_order: index })));
      
      toast({
        title: "Success",
        description: "Gallery order updated",
      });
    } catch (error) {
      console.error("Error reordering images:", error);
      toast({
        title: "Error",
        description: "Failed to reorder images",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Gallery Images</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload and manage the travel images that appear on your funnel page. Recommended: 4-6 high-quality images.
        </p>
      </div>

      <div className="border-2 border-dashed rounded-lg p-6">
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Add Gallery Image
            </>
          )}
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Max size: 5MB • JPG, PNG, WEBP
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {images.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No gallery images yet. Upload your first image above!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {images.map((image, index) => (
            <Card key={image.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-32 h-32 flex-shrink-0">
                    <img
                      src={image.image_url}
                      alt={image.location}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    {editingImage === image.id ? (
                      <>
                        <Input
                          value={image.location}
                          onChange={(e) => handleUpdateImage(image.id, { location: e.target.value })}
                          placeholder="Location"
                        />
                        <Textarea
                          value={image.caption}
                          onChange={(e) => handleUpdateImage(image.id, { caption: e.target.value })}
                          placeholder="Caption"
                          rows={2}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingImage(null)}
                        >
                          Done Editing
                        </Button>
                      </>
                    ) : (
                      <>
                        <h4 className="font-semibold">{image.location}</h4>
                        <p className="text-sm text-muted-foreground">{image.caption}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingImage(image.id)}
                        >
                          Edit Details
                        </Button>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => moveImage(image.id, 'up')}
                      disabled={index === 0 || saving}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => moveImage(image.id, 'down')}
                      disabled={index === images.length - 1 || saving}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteImage(image.id, image.image_url)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
