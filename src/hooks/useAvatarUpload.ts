import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAvatarUpload() {
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return null;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('food-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('food-images')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast.error(error.message || 'Failed to upload avatar');
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploading, uploadAvatar };
}
