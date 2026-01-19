import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Sparkles, Camera, X, Loader2, Check, 
  Calculator, Edit2, Image as ImageIcon, Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useAICalories } from '@/hooks/useAICalories';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FoodItemFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  calories: number;
  is_popular: boolean;
  is_available: boolean;
  image: string;
}

interface FoodItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: FoodItemFormData) => Promise<void>;
  initialData?: Partial<FoodItemFormData>;
  isEditing?: boolean;
}

const FoodItemModal = ({ 
  open, 
  onOpenChange, 
  onSave, 
  initialData,
  isEditing = false 
}: FoodItemModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, uploadImage, uploadBase64 } = useImageUpload({ folder: 'menu-items' });
  const { estimating, estimate, estimateCalories, clearEstimate } = useAICalories();

  const [formData, setFormData] = useState<FoodItemFormData>({
    name: '',
    description: '',
    price: 0,
    category: '',
    calories: 0,
    is_popular: false,
    is_available: true,
    image: '',
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [calorieMode, setCalorieMode] = useState<'manual' | 'ai'>('manual');
  const [saving, setSaving] = useState(false);

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          description: initialData.description || '',
          price: initialData.price || 0,
          category: initialData.category || '',
          calories: initialData.calories || 0,
          is_popular: initialData.is_popular || false,
          is_available: initialData.is_available ?? true,
          image: initialData.image || '',
        });
        if (initialData.image) {
          setPreviewImage(initialData.image);
        }
      }
    } else {
      // Reset everything when closing
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: '',
        calories: 0,
        is_popular: false,
        is_available: true,
        image: '',
      });
      setPreviewImage(null);
      setOriginalImage(null);
      setEnhancedImage(null);
      setCalorieMode('manual');
      clearEstimate();
    }
  }, [open, initialData, clearEstimate]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPreviewImage(base64);
      setOriginalImage(base64);
      setEnhancedImage(null);
    };
    reader.readAsDataURL(file);

    // Upload immediately
    const url = await uploadImage(file);
    if (url) {
      setFormData(prev => ({ ...prev, image: url }));
      toast.success('Image uploaded successfully!');
    }
  };

  const handleEnhanceImage = async () => {
    if (!originalImage) {
      toast.error('Please upload an image first');
      return;
    }

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
        setPreviewImage(data.enhancedImage);
        
        // Upload enhanced image
        const fileName = `enhanced-${Date.now()}`;
        const url = await uploadBase64(data.enhancedImage, fileName);
        if (url) {
          setFormData(prev => ({ ...prev, image: url }));
          toast.success('Image enhanced and uploaded!');
        }
      }
    } catch (error: any) {
      console.error('Enhancement error:', error);
      toast.error(error.message || 'Failed to enhance image');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleUseOriginal = async () => {
    if (!originalImage) return;
    setPreviewImage(originalImage);
    setEnhancedImage(null);
    
    // Re-upload original if we had switched to enhanced
    const fileName = `original-${Date.now()}`;
    const url = await uploadBase64(originalImage, fileName);
    if (url) {
      setFormData(prev => ({ ...prev, image: url }));
      toast.success('Using original image');
    }
  };

  const handleAICalories = async () => {
    const result = await estimateCalories(
      formData.name,
      formData.description,
      previewImage || undefined
    );
    if (result) {
      setFormData(prev => ({ ...prev, calories: result.calories }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a food name');
      return;
    }
    if (formData.price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    if (!formData.category.trim()) {
      toast.error('Please enter a category');
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      // Error handled by parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? <Edit2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
            {isEditing ? 'Edit Menu Item' : 'Add New Dish'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Image Upload Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Food Image</Label>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            <AnimatePresence mode="wait">
              {!previewImage ? (
                <motion.div
                  key="upload-area"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors bg-muted/30"
                >
                  <div className="flex justify-center gap-4 mb-4">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-foreground font-medium mb-1">Upload or Take Photo</p>
                  <p className="text-muted-foreground text-sm">
                    Click to upload from file or use camera
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                    <img
                      src={previewImage}
                      alt="Food preview"
                      className="w-full h-full object-cover"
                    />
                    {(uploading || isEnhancing) && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <span className="ml-2 text-sm">
                          {isEnhancing ? 'Enhancing...' : 'Uploading...'}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setPreviewImage(null);
                        setOriginalImage(null);
                        setEnhancedImage(null);
                        setFormData(prev => ({ ...prev, image: '' }));
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Enhancement Controls */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading || isEnhancing}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Change Image
                    </Button>
                    
                    {originalImage && !enhancedImage && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleEnhanceImage}
                        disabled={isEnhancing || uploading}
                        className="text-primary border-primary/30 hover:bg-primary/10"
                      >
                        {isEnhancing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Enhancing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Enhance with AI
                          </>
                        )}
                      </Button>
                    )}

                    {enhancedImage && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleUseOriginal}
                        disabled={uploading}
                      >
                        Use Original
                      </Button>
                    )}
                  </div>

                  {enhancedImage && (
                    <p className="text-xs text-emerald-500 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Enhanced image applied
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Chicken Biryani"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Rice, BBQ, Fast Food"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="food-description">Description</Label>
            <Textarea
              id="food-description"
              name="food-description"
              autoComplete="off"
              value={formData.description}
              onChange={(e) => {
                e.stopPropagation();
                setFormData(prev => ({ ...prev, description: e.target.value }));
              }}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="Describe ingredients, taste, serving size..."
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (Rs.) *</Label>
            <Input
              id="price"
              type="number"
              min="0"
              value={formData.price || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) || 0 }))}
              placeholder="e.g., 450"
            />
          </div>

          {/* Calorie Section */}
          <div className="space-y-3 p-4 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Calories
              </Label>
              <Tabs value={calorieMode} onValueChange={(v) => setCalorieMode(v as 'manual' | 'ai')}>
                <TabsList className="h-8">
                  <TabsTrigger value="manual" className="text-xs px-3 h-6">Manual</TabsTrigger>
                  <TabsTrigger value="ai" className="text-xs px-3 h-6">AI Estimate</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {calorieMode === 'manual' ? (
              <Input
                type="number"
                min="0"
                value={formData.calories || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, calories: Number(e.target.value) || 0 }))}
                placeholder="Enter calories manually"
              />
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  AI will estimate calories based on the food name, description, and image.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAICalories}
                  disabled={estimating || !formData.name.trim()}
                  className="w-full"
                >
                  {estimating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Estimating...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-4 h-4 mr-2" />
                      Estimate Calories with AI
                    </>
                  )}
                </Button>
                
                {estimate && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-background border border-primary/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-primary">{estimate.calories}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        estimate.confidence === 'high' ? 'bg-emerald-500/10 text-emerald-500' :
                        estimate.confidence === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {estimate.confidence} confidence
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Protein: {estimate.breakdown.protein}</span>
                      <span>Carbs: {estimate.breakdown.carbs}</span>
                      <span>Fat: {estimate.breakdown.fat}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setCalorieMode('manual')}
                        className="text-xs"
                      >
                        Edit Manually
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center justify-between flex-1 p-3 rounded-lg border border-border">
              <Label htmlFor="popular" className="cursor-pointer">Mark as Popular</Label>
              <Switch
                id="popular"
                checked={formData.is_popular}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_popular: checked }))}
              />
            </div>
            <div className="flex items-center justify-between flex-1 p-3 rounded-lg border border-border">
              <Label htmlFor="available" className="cursor-pointer">Available</Label>
              <Switch
                id="available"
                checked={formData.is_available}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_available: checked }))}
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={saving || uploading || !formData.name || !formData.price || !formData.category}
            className="w-full"
            size="lg"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditing ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              isEditing ? 'Update Item' : 'Add to Menu'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FoodItemModal;
