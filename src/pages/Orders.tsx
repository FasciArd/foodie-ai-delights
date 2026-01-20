import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, MapPin, CheckCircle, Truck, ChefHat, XCircle, RefreshCw, Eye, Share2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import ShareModal from '@/components/ShareModal';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  restaurant_id: string | null;
  status: 'pending' | 'preparing' | 'on_the_way' | 'delivered' | 'cancelled';
  items: OrderItem[];
  total_price: number;
  delivery_address: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const statusConfig = {
  pending: {
    label: 'Order Placed',
    color: 'bg-muted',
    textColor: 'text-muted-foreground',
    icon: Package,
    step: 0,
  },
  preparing: {
    label: 'Preparing',
    color: 'bg-amber-500',
    textColor: 'text-white',
    icon: ChefHat,
    step: 1,
  },
  on_the_way: {
    label: 'On the Way',
    color: 'bg-primary',
    textColor: 'text-primary-foreground',
    icon: Truck,
    step: 2,
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-emerald-500',
    textColor: 'text-white',
    icon: CheckCircle,
    step: 3,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-destructive',
    textColor: 'text-destructive-foreground',
    icon: XCircle,
    step: -1,
  },
};

const statusSteps = ['pending', 'preparing', 'on_the_way', 'delivered'] as const;

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const handleShare = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShareModalOpen(true);
  };

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async (): Promise<Order[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(order => ({
        id: order.id,
        restaurant_id: order.restaurant_id,
        status: order.status as Order['status'],
        items: (Array.isArray(order.items) ? order.items : []) as unknown as OrderItem[],
        total_price: order.total_price,
        delivery_address: order.delivery_address,
        notes: order.notes,
        created_at: order.created_at,
        updated_at: order.updated_at,
      }));
    },
    enabled: !!user?.id,
  });

  // Real-time subscription for order updates with notifications
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('order-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newRecord = payload.new as Record<string, unknown>;
          const oldRecord = payload.old as Record<string, unknown>;
          const newStatus = newRecord?.status as string | undefined;
          const oldStatus = oldRecord?.status as string | undefined;
          
          if (newStatus && newStatus !== oldStatus) {
            const statusMessages: Record<string, string> = {
              preparing: 'Restaurant is preparing your order 👨‍🍳',
              on_the_way: 'Your rider is on the way! 🛵',
              delivered: 'Order delivered! Enjoy your meal 😋',
            };
            
            if (statusMessages[newStatus]) {
              toast.success(statusMessages[newStatus]);
            }
          }
          
          queryClient.invalidateQueries({ queryKey: ['user-orders', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getEstimatedDelivery = (status: string, createdAt: string) => {
    if (status === 'delivered') return 'Delivered';
    if (status === 'cancelled') return 'Cancelled';
    
    const orderTime = new Date(createdAt);
    const estimatedTime = new Date(orderTime.getTime() + 45 * 60 * 1000); // +45 mins
    const now = new Date();
    const diffMins = Math.floor((estimatedTime.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffMins <= 0) return 'Arriving soon';
    return `${diffMins}-${diffMins + 10} min`;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col pt-20">
        <section className="py-16 flex-1 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-7xl mb-6"
            >
              🔐
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Login Required
            </h2>
            <p className="text-muted-foreground mb-8">
              Please login to view your orders
            </p>
            <Button variant="hero" onClick={() => navigate('/auth')}>
              Login / Sign Up
            </Button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-20">
      {/* Header */}
      <section className="py-6 sm:py-8 bg-gradient-warm border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                Your Orders
              </h1>
              <p className="text-muted-foreground">
                Track your current and past orders
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container mx-auto px-4 sm:px-6">
          {isLoading ? (
            <div className="max-w-2xl mx-auto space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="card-base p-5 animate-pulse">
                  <div className="h-6 bg-muted rounded w-1/3 mb-4" />
                  <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-20 bg-muted rounded mb-4" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-7xl mb-6"
              >
                📦
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                No orders yet
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                You haven't placed any orders yet. Start exploring delicious Pakistani food!
              </p>
              <Button variant="hero" onClick={() => navigate('/restaurants')}>
                Browse Restaurants
              </Button>
            </motion.div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-4">
              {orders.map((order, index) => {
                const status = statusConfig[order.status];
                const StatusIcon = status.icon;
                const isActive = order.status !== 'delivered' && order.status !== 'cancelled';

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`card-base p-5 ${isActive ? 'ring-2 ring-primary/20' : ''}`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 font-mono">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Share Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleShare(order.id)}
                        >
                          <Share2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <div
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.color} ${status.textColor}`}
                        >
                          <StatusIcon className="w-4 h-4" />
                          <span className="text-sm font-medium">{status.label}</span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="flex items-start gap-2 mb-4 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{order.delivery_address}</span>
                    </div>

                    {/* Items */}
                    <div className="bg-secondary rounded-xl p-3 mb-4">
                      {order.items.map((item, i) => (
                        <div
                          key={i}
                          className="flex justify-between text-sm py-1"
                        >
                          <span className="text-foreground">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-muted-foreground">
                            Rs. {(item.price * item.quantity).toFixed(0)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{getEstimatedDelivery(order.status, order.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/order/${order.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Track
                          </Button>
                        )}
                        <span className="font-bold text-primary text-lg">
                          Rs. {order.total_price.toFixed(0)}
                        </span>
                      </div>
                    </div>

                    {/* Order Timeline for active orders */}
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-border"
                      >
                        <div className="flex justify-between relative">
                          <div className="absolute top-3 left-0 right-0 h-0.5 bg-border" />
                          {statusSteps.map((step, i) => {
                            const stepConfig = statusConfig[step];
                            const currentStep = statusConfig[order.status].step;
                            const isCompleted = currentStep >= i;
                            const isCurrent = currentStep === i;
                            
                            return (
                              <div
                                key={step}
                                className="relative flex flex-col items-center z-10"
                              >
                                <motion.div
                                  animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                                  transition={{ duration: 1, repeat: Infinity }}
                                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                    isCompleted ? 'bg-primary' : 'bg-muted'
                                  }`}
                                >
                                  <stepConfig.icon
                                    className={`w-3 h-3 ${
                                      isCompleted
                                        ? 'text-primary-foreground'
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                </motion.div>
                                <span
                                  className={`text-xs mt-2 text-center max-w-16 ${
                                    isCompleted
                                      ? 'text-foreground font-medium'
                                      : 'text-muted-foreground'
                                  }`}
                                >
                                  {stepConfig.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* Notes */}
                    {order.notes && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Note:</span> {order.notes}
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Share Modal */}
      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        title={`Order #${selectedOrderId?.slice(0, 8).toUpperCase()}`}
        url={`${window.location.origin}/order/${selectedOrderId}`}
        description="Check out my food order on FoodieHub!"
      />

      <Footer />
    </div>
  );
};

export default Orders;