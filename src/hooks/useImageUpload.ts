import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseImageUploadOptions {
  bucket?: string;
  folder?: string;
  maxSizeMB?: number;
}

interface UseImageUploadResult {
  uploading: boolean;
  uploadImage: (file: File) => Promise<string | null>;
  uploadBase64: (base64: string, fileName: string) => Promise<string | null>;
}

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadResult {
  const {
    bucket = 'food-images',
    folder = '',
    maxSizeMB = 5,
  } = options;

  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) return null;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return null;
    }

    // Validate file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(`Image must be smaller than ${maxSizeMB}MB`);
      return null;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast.error(error.message || 'Failed to upload image');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadBase64 = async (base64: string, fileName: string): Promise<string | null> => {
    setUploading(true);
    try {
      // Convert base64 to blob
      const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
      const mimeType = base64.includes(',') 
        ? base64.split(',')[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
        : 'image/jpeg';
      
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      const fileExt = mimeType.split('/')[1] || 'jpg';
      const filePath = folder 
        ? `${folder}/${fileName}.${fileExt}` 
        : `${fileName}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: true,
          contentType: mimeType,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Base64 upload error:', error);
      toast.error(error.message || 'Failed to upload image');
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    uploadImage,
    uploadBase64,
  };
}
