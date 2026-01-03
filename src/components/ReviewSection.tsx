import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, Trash2, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useReviews, useAddReview, useDeleteReview } from '@/hooks/useReviews';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface ReviewSectionProps {
  restaurantId: string;
}

export default function ReviewSection({ restaurantId }: ReviewSectionProps) {
  const { user, userRole } = useAuth();
  const { data: reviews, isLoading } = useReviews(restaurantId);
  const addReview = useAddReview();
  const deleteReview = useDeleteReview();
  const { toast } = useToast();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isRestaurantOwner, setIsRestaurantOwner] = useState(false);
  const [hasDeliveredOrder, setHasDeliveredOrder] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(true);

  // Check if user is the owner of this restaurant or has a delivered order
  useEffect(() => {
    const checkReviewEligibility = async () => {
      if (!user) {
        setCheckingEligibility(false);
        return;
      }

      try {
        // Check if user owns this restaurant
        if (userRole === 'restaurant') {
          const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id')
            .eq('id', restaurantId)
            .eq('owner_id', user.id)
            .single();
          
          if (restaurant) {
            setIsRestaurantOwner(true);
            setCheckingEligibility(false);
            return;
          }
        }

        // Check if user has a delivered order from this restaurant
        const { data: orders } = await supabase
          .from('orders')
          .select('id')
          .eq('user_id', user.id)
          .eq('restaurant_id', restaurantId)
          .eq('status', 'delivered')
          .limit(1);

        setHasDeliveredOrder(orders && orders.length > 0);
      } catch (error) {
        console.error('Error checking review eligibility:', error);
      } finally {
        setCheckingEligibility(false);
      }
    };

    checkReviewEligibility();
  }, [user, userRole, restaurantId]);

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: 'Please login', description: 'You must be logged in to leave a review.', variant: 'destructive' });
      return;
    }
    if (isRestaurantOwner) {
      toast({ title: 'Cannot review', description: 'Restaurant owners cannot review their own restaurant.', variant: 'destructive' });
      return;
    }
    if (!hasDeliveredOrder) {
      toast({ title: 'Order required', description: 'You can only review after receiving a delivered order.', variant: 'destructive' });
      return;
    }
    if (rating === 0) {
      toast({ title: 'Rating required', description: 'Please select a star rating.', variant: 'destructive' });
      return;
    }

    try {
      await addReview.mutateAsync({ restaurantId, rating, comment });
      toast({ title: 'Review submitted!', description: 'Thanks for your feedback.' });
      setRating(0);
      setComment('');
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to submit review', variant: 'destructive' });
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await deleteReview.mutateAsync({ reviewId, restaurantId });
      toast({ title: 'Deleted', description: 'Your review has been removed.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to delete', variant: 'destructive' });
    }
  };

  const avgRating = reviews?.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : '0';

  const canReview = user && !isRestaurantOwner && hasDeliveredOrder && userRole !== 'driver';

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-foreground mb-4">Customer Reviews</h2>

      {/* Summary */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-1">
          <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
          <span className="text-xl font-bold">{avgRating}</span>
        </div>
        <span className="text-muted-foreground">{reviews?.length || 0} review{reviews?.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Submit form - Only show for eligible customers */}
      {checkingEligibility ? (
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <div className="animate-pulse flex gap-2">
            <div className="h-4 bg-muted rounded w-32"></div>
          </div>
        </div>
      ) : isRestaurantOwner ? (
        <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Restaurant owners cannot review their own restaurant</p>
        </div>
      ) : userRole === 'driver' ? (
        <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Delivery partners cannot leave reviews</p>
        </div>
      ) : !user ? (
        <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Please login to leave a review</p>
        </div>
      ) : !hasDeliveredOrder ? (
        <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">You can only review after receiving a delivered order from this restaurant</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <p className="font-medium text-foreground mb-2">Leave a review</p>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    (hoverRating || rating) >= star
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Share your experience (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mb-3"
          />
          <Button onClick={handleSubmit} disabled={addReview.isPending}>
            <Send className="w-4 h-4 mr-2" />
            {addReview.isPending ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      )}

      {/* Review list */}
      {isLoading ? (
        <p className="text-muted-foreground">Loading reviews...</p>
      ) : reviews?.length === 0 ? (
        <p className="text-muted-foreground">No reviews yet. Be the first!</p>
      ) : (
        <AnimatePresence>
          {reviews?.map((rev) => (
            <motion.div
              key={rev.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-card border border-border rounded-lg p-4 mb-3 flex gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatDistanceToNow(new Date(rev.created_at), { addSuffix: true })}
                  </span>
                </div>
                {rev.comment && <p className="text-foreground">{rev.comment}</p>}
              </div>
              {user?.id === rev.user_id && (
                <button
                  onClick={() => handleDelete(rev.id)}
                  className="text-destructive hover:text-destructive/80"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </section>
  );
}
