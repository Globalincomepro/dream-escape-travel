import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Simple, reliable image conversion to JPEG
const convertToJPEG = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Calculate dimensions (max 2048px to keep file size reasonable)
        let width = img.width;
        let height = img.height;
        const maxDimension = 2048;
        
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG at 0.85 quality - one pass, no loops
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Conversion failed'));
              return;
            }

            // Convert blob to File with .jpg extension
            const jpegFile = new File(
              [blob], 
              file.name.replace(/\.[^.]+$/, '.jpg'),
              { type: 'image/jpeg' }
            );
            
            resolve(jpegFile);
          },
          'image/jpeg',
          0.85
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

interface ImageUploadProps {
  bucketName: string;
  currentImageUrl: string | null;
  onUploadComplete: (url: string) => void;
  maxSizeMB: number;
  acceptedTypes: string[];
  aspectRatio?: string;
  label: string;
}

export function ImageUpload({
  bucketName,
  currentImageUrl,
  onUploadComplete,
  maxSizeMB,
  acceptedTypes,
  aspectRatio,
  label
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's an image - convert to JPEG. Otherwise (video), upload directly
    const isImage = file.type.startsWith('image/');
    let fileToUpload = file;

    if (isImage) {
      try {
        toast({
          title: "Converting to JPEG...",
          description: "Optimizing for social media"
        });
        
        const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        fileToUpload = await convertToJPEG(file);
        const finalSizeMB = (fileToUpload.size / (1024 * 1024)).toFixed(2);
        
        console.log(`Image converted: ${originalSizeMB}MB → ${finalSizeMB}MB`);
        
        toast({
          title: "Image ready!",
          description: `${originalSizeMB}MB → ${finalSizeMB}MB JPEG`
        });
      } catch (error) {
        console.error('Conversion failed:', error);
        toast({
          title: "Conversion failed",
          description: "Please try a different image",
          variant: "destructive"
        });
        return;
      }
    }

    // Validate file size (after conversion if applicable)
    const fileSizeMB = fileToUpload.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast({
        title: "File too large",
        description: `Max file size is ${maxSizeMB}MB`,
        variant: "destructive"
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(fileToUpload);

    // Upload to Supabase
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const timestamp = Date.now();
      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${user.id}/${bucketName}-${timestamp}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, fileToUpload, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      onUploadComplete(publicUrl);

      toast({
        title: "Success",
        description: "Image uploaded successfully"
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
      setPreview(currentImageUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploadComplete("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">{label}</label>
      
      {preview ? (
        <div className="relative inline-block">
          <img 
            src={preview} 
            alt="Preview" 
            className="max-w-xs rounded-lg border"
            style={aspectRatio ? { aspectRatio } : undefined}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2"
            onClick={handleRemove}
            disabled={uploading}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-4">
            {aspectRatio && `Recommended aspect ratio: ${aspectRatio}`}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Choose Image
              </>
            )}
          </Button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.map(t => `.${t}`).join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <p className="text-xs text-muted-foreground">
        Max size: {maxSizeMB}MB • Formats: {acceptedTypes.join(', ')}
      </p>
    </div>
  );
}
