import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, MessageCircle, Facebook, Twitter, Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  url?: string;
  description?: string;
}

const ShareModal = ({ open, onOpenChange, title, url, description }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = url || window.location.href;
  const shareText = description || `Check out ${title} on FoodieHub!`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
        onOpenChange(false);
      } catch (error) {
        // User cancelled or share failed
        console.log('Share cancelled');
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(whatsappUrl, '_blank');
    onOpenChange(false);
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    onOpenChange(false);
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    onOpenChange(false);
  };

  // Try native share first on mobile
  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {shareText}
          </p>

          <div className="grid grid-cols-4 gap-3 mb-6">
            {/* Copy Link */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyLink}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${copied ? 'bg-emerald-500' : 'bg-primary'}`}>
                {copied ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <Link2 className="w-5 h-5 text-primary-foreground" />
                )}
              </div>
              <span className="text-xs text-foreground">{copied ? 'Copied!' : 'Copy'}</span>
            </motion.button>

            {/* WhatsApp */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWhatsAppShare}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-foreground">WhatsApp</span>
            </motion.button>

            {/* Facebook */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFacebookShare}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                <Facebook className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-foreground">Facebook</span>
            </motion.button>

            {/* Twitter/X */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTwitterShare}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                <Twitter className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-foreground">X</span>
            </motion.button>
          </div>

          {/* Native Share Button (Mobile) */}
          {hasNativeShare && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleNativeShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              More sharing options
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
