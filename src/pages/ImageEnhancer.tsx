import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Wand2, Download, ArrowLeft, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const ImageEnhancer = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setEnhancedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnhance = async () => {
    if (!selectedImage) return;

    setIsEnhancing(true);
    try {
      const base64Data = selectedImage.split(',')[1];
      
      const { data, error } = await supabase.functions.invoke('enhance-image', {
        body: { imageBase64: base64Data }
      });

      if (error) throw error;

      if (data.enhancedImage) {
        setEnhancedImage(data.enhancedImage);
        toast({
          title: "Image Enhanced!",
          description: "Your food photo has been enhanced successfully",
        });
      }
    } catch (error) {
      console.error('Error enhancing image:', error);
      toast({
        title: "Enhancement Failed",
        description: "Could not enhance the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleDownload = () => {
    if (!enhancedImage) return;

    const link = document.createElement('a');
    link.href = enhancedImage;
    link.download = 'enhanced-food-photo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setEnhancedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            AI Image Enhancer
          </h1>
          <p className="text-muted-foreground">
            Enhance your food photos with AI to make them look more appetizing
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Original Image
                </CardTitle>
                <CardDescription>
                  Upload a food photo to enhance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {selectedImage ? (
                  <div className="space-y-4">
                    <div className="relative aspect-square rounded-lg overflow-hidden border border-border">
                      <img
                        src={selectedImage}
                        alt="Selected"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleReset}
                        className="flex-1"
                      >
                        Choose Another
                      </Button>
                      <Button
                        onClick={handleEnhance}
                        disabled={isEnhancing}
                        className="flex-1"
                      >
                        {isEnhancing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Enhancing...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4 mr-2" />
                            Enhance
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    <div className="p-4 rounded-full bg-primary/10">
                      <ImageIcon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-foreground">Click to upload</p>
                      <p className="text-sm text-muted-foreground">PNG, JPG up to 5MB</p>
                    </div>
                  </button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Result Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Enhanced Image
                </CardTitle>
                <CardDescription>
                  AI-enhanced version of your photo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {enhancedImage ? (
                  <div className="space-y-4">
                    <div className="relative aspect-square rounded-lg overflow-hidden border border-border">
                      <img
                        src={enhancedImage}
                        alt="Enhanced"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      onClick={handleDownload}
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Enhanced Image
                    </Button>
                  </div>
                ) : (
                  <div className="w-full aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-4">
                    {isEnhancing ? (
                      <>
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <p className="text-muted-foreground">Enhancing your image...</p>
                      </>
                    ) : (
                      <>
                        <div className="p-4 rounded-full bg-muted">
                          <Wand2 className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground text-center">
                          Enhanced image will appear here
                        </p>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Tips for Best Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Use well-lit photos for best enhancement
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Avoid blurry or low-resolution images
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Center the food in the frame
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Natural lighting works best
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ImageEnhancer;
