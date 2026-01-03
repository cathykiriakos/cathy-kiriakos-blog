import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Copy, ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageUploaded?: (url: string) => void;
  onUrlChange?: (url: string) => void;
  currentImageUrl?: string;
  label?: string;
  showUrlInput?: boolean;
}

export const ImageUpload = ({
  onImageUploaded,
  onUrlChange,
  currentImageUrl = '',
  label = 'Image',
  showUrlInput = true,
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be less than 5MB');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      setPreviewUrl(publicUrl);

      if (onImageUploaded) {
        onImageUploaded(publicUrl);
      }
      if (onUrlChange) {
        onUrlChange(publicUrl);
      }

      toast({
        title: 'Success!',
        description: 'Image uploaded successfully.',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadImage(file);
    }
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    setPreviewUrl(url);
    if (onUrlChange) {
      onUrlChange(url);
    }
  };

  const clearImage = () => {
    setImageUrl('');
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onUrlChange) {
      onUrlChange('');
    }
  };

  const copyToClipboard = () => {
    if (imageUrl) {
      navigator.clipboard.writeText(imageUrl);
      toast({
        title: 'Copied!',
        description: 'Image URL copied to clipboard.',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {previewUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearImage}
            className="h-8 text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Image Preview */}
      {previewUrl && (
        <div className="relative rounded-lg border border-border overflow-hidden">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={copyToClipboard}
            className="absolute top-2 right-2"
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy URL
          </Button>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id="image-file-upload"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </>
          )}
        </Button>
      </div>

      {/* URL Input (optional) */}
      {showUrlInput && (
        <div className="space-y-2">
          <Label htmlFor="image-url" className="text-sm text-muted-foreground">
            Or paste image URL
          </Label>
          <Input
            id="image-url"
            value={imageUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-xs text-muted-foreground">
            Tip: Use{' '}
            <a
              href="https://unsplash.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Unsplash
            </a>{' '}
            for free images, or upload your own.
          </p>
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-muted-foreground flex items-start gap-1">
        <ImageIcon className="h-3 w-3 mt-0.5 flex-shrink-0" />
        <span>Supports JPG, PNG, GIF, WebP. Max 5MB.</span>
      </div>
    </div>
  );
};

export default ImageUpload;
