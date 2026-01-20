import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image, X, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ReportIssueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
}

export function ReportIssueModal({ open, onOpenChange, orderId }: ReportIssueModalProps) {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast.error('Please describe the issue');
      return;
    }

    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success('Issue reported successfully! Our support team will contact you within 24 hours.');
    setLoading(false);
    onOpenChange(false);
    
    // Reset form
    setDescription('');
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Report an Issue
          </DialogTitle>
          <DialogDescription>
            Order #{orderId.slice(0, 8).toUpperCase()} - Tell us what went wrong
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="issue-description">Describe the problem *</Label>
            <Textarea
              id="issue-description"
              name="issue-description"
              placeholder="e.g., Food was cold, missing items, wrong order, quality issue..."
              value={description}
              onChange={(e) => {
                e.stopPropagation();
                setDescription(e.target.value);
              }}
              onKeyDown={(e) => e.stopPropagation()}
              autoComplete="off"
              rows={4}
              required
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Upload Photo (Optional)</Label>
            <p className="text-xs text-muted-foreground">
              Upload a photo of the issue to help us understand the problem better
            </p>
            
            {imagePreview ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-lg overflow-hidden border border-border"
              >
                <img
                  src={imagePreview}
                  alt="Issue preview"
                  className="w-full h-48 object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={removeImage}
                  className="absolute top-2 right-2 h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Image className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">Click to upload</span> a photo
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP (Max 10MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              <strong>Note:</strong> Our support team will review your report and respond within 24 hours. 
              Refunds, if applicable, will be processed within 3-5 business days.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
