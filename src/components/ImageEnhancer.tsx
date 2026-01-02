import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Sparkles, Download, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImageEnhancerProps {
  onEnhanced?: (enhancedUrl: string) => void;
}

const ImageEnhancer = ({ onEnhanced }: ImageEnhancerProps) => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setOriginalImage(event.target?.result as string);
      setEnhancedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleEnhance = async () => {
    if (!originalImage) return;

    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-image', {
        body: { 
          imageBase64: originalImage,
          prompt: 'Enhance this food photo to make it look more appetizing and professional. Improve lighting, colors, and make the food look delicious. Keep it realistic.'
        }
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes('Rate limit')) {
          toast.error('Rate limit exceeded. Please try again later.');
        } else {
          throw new Error(data.error);
        }
        return;
      }

      if (data.enhancedImage) {
        setEnhancedImage(data.enhancedImage);
        onEnhanced?.(data.enhancedImage);
        toast.success('Image enhanced successfully!');
      }
    } catch (error: any) {
      console.error('Enhancement error:', error);
      toast.error(error.message || 'Failed to enhance image');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleDownload = () => {
    if (!enhancedImage) return;
    
    const link = document.createElement('a');
    link.href = enhancedImage;
    link.download = 'enhanced-food-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => {
    setOriginalImage(null);
    setEnhancedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="card-base p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg text-foreground">AI Image Enhancer</h3>
      </div>
      <p className="text-muted-foreground text-sm mb-6">
        Upload a food photo and let AI enhance it to look more appetizing and professional.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {!originalImage ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
          >
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-1">Click to upload</p>
            <p className="text-muted-foreground text-sm">or drag and drop your food image</p>
          </motion.div>
        ) : (
          <motion.div
            key="images"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Image */}
              <div className="relative">
                <p className="text-sm font-medium text-muted-foreground mb-2">Original</p>
                <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
                  <img
                    src={originalImage}
                    alt="Original"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Enhanced Image */}
              <div className="relative">
                <p className="text-sm font-medium text-muted-foreground mb-2">Enhanced</p>
                <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
                  {enhancedImage ? (
                    <img
                      src={enhancedImage}
                      alt="Enhanced"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  {isEnhancing && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Enhancing...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleEnhance}
                disabled={isEnhancing}
                variant="hero"
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Enhance Image
                  </>
                )}
              </Button>
              {enhancedImage && (
                <Button onClick={handleDownload} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
              <Button onClick={handleClear} variant="ghost">
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageEnhancer;
