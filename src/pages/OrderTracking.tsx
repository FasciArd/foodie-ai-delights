import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, MessageCircle, Clock, MapPin, Package, ChefHat, Truck, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LiveTrackingMap from '@/components/LiveTrackingMap';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

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
    description: 'Your order has been received',
    color: 'bg-muted',
    textColor: 'text-muted-foreground',
    icon: Package,
    step: 0,
  },
  preparing: {
    label: 'Preparing',
    description: 'Restaurant is preparing your food',
    color: 'bg-amber-500',
    textColor: 'text-white',
    icon: ChefHat,
    step: 1,
  },
  on_the_way: {
    label: 'On the Way',
    description: 'Your rider is delivering your order',
    color: 'bg-primary',
    textColor: 'text-primary-foreground',
    icon: Truck,
    step: 2,
  },
  delivered: {
    label: 'Delivered',
    description: 'Order has been delivered',
    color: 'bg-emerald-500',
    textColor: 'text-white',
    icon: CheckCircle,
    step: 3,
  },
  cancelled: {
    label: 'Cancelled',
    description: 'Order has been cancelled',
    color: 'bg-destructive',
    textColor: 'text-destructive-foreground',
    icon: XCircle,
    step: -1,
  },
};

const statusSteps = ['pending', 'preparing', 'on_the_way', 'delivered'] as const;

const OrderTracking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [eta, setEta] = useState<string>('30-40 min');

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ['order-tracking', id],
    queryFn: async (): Promise<Order | null> => {
      if (!id || !user?.id) return null;

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        restaurant_id: data.restaurant_id,
        status: data.status as Order['status'],
        items: (Array.isArray(data.items) ? data.items : []) as unknown as OrderItem[],
        total_price: data.total_price,
        delivery_address: data.delivery_address,
        notes: data.notes,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    },
    enabled: !!id && !!user?.id,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Real-time subscription
  useEffect(() => {
    if (!id || !user?.id) return;

    const channel = supabase
      .channel(`order-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${id}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user?.id, refetch]);

  // Calculate ETA based on status
  useEffect(() => {
    if (!order) return;

    const orderTime = new Date(order.created_at);
    const now = new Date();
    const elapsedMins = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));

    switch (order.status) {
      case 'pending':
        setEta('35-45 min');
        break;
      case 'preparing':
        setEta(`${Math.max(25 - elapsedMins, 5)}-${Math.max(35 - elapsedMins, 15)} min`);
        break;
      case 'on_the_way':
        setEta(`${Math.max(10 - elapsedMins, 2)}-${Math.max(15 - elapsedMins, 5)} min`);
        break;
      case 'delivered':
        setEta('Delivered');
        break;
      default:
        setEta('--');
    }
  }, [order]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-7xl mb-6">
            🔐
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Login Required</h2>
          <p className="text-muted-foreground mb-8">Please login to track your order</p>
          <Button variant="hero" onClick={() => navigate('/auth')}>
            Login / Sign Up
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-pulse text-center">
          <div className="text-6xl mb-4">🛵</div>
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Order Not Found</h2>
          <p className="text-muted-foreground mb-8">This order doesn't exist or you don't have access</p>
          <Button variant="hero" onClick={() => navigate('/orders')}>
            View All Orders
          </Button>
        </div>
      </div>
    );
  }

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;
  const isActive = order.status !== 'delivered' && order.status !== 'cancelled';

  return (
    <div className="min-h-screen flex flex-col pt-20 pb-8">
      {/* Header */}
      <section className="py-4 bg-gradient-warm border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/orders')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-bold text-foreground">Track Order</h1>
                <p className="text-xs text-muted-foreground font-mono">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.color} ${status.textColor}`}>
              <StatusIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{status.label}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 flex-1">
        <div className="container mx-auto px-4 sm:px-6 max-w-2xl space-y-6">
          {/* ETA Card */}
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-base p-6 text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  className="text-4xl"
                >
                  🛵
                </motion.div>
              </div>
              <p className="text-muted-foreground text-sm mb-1">Estimated Delivery</p>
              <p className="text-3xl font-bold text-primary">{eta}</p>
            </motion.div>
          )}

          {/* Live Map */}
          {isActive && order.status === 'on_the_way' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-base p-4"
            >
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Live Tracking
              </h3>
              <LiveTrackingMap
                orderId={order.id}
                deliveryAddress={order.delivery_address}
                restaurantLocation={{ lat: 24.8150, lng: 67.0328 }}
              />
            </motion.div>
          )}

          {/* Order Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-base p-6"
          >
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Order Status
            </h3>

            <div className="space-y-4">
              {statusSteps.map((step, i) => {
                const stepConfig = statusConfig[step];
                const currentStep = status.step;
                const isCompleted = currentStep >= i;
                const isCurrent = currentStep === i;
                const StepIcon = stepConfig.icon;

                return (
                  <div key={step} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <motion.div
                        animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-primary' : 'bg-muted'
                        }`}
                      >
                        <StepIcon className={`w-5 h-5 ${isCompleted ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                      </motion.div>
                      {i < statusSteps.length - 1 && (
                        <div className={`w-0.5 h-8 ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
                      )}
                    </div>
                    <div className="pt-2">
                      <p className={`font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {stepConfig.label}
                      </p>
                      <p className="text-sm text-muted-foreground">{stepConfig.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Delivery Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-base p-4"
          >
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Delivery Address</p>
                <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
              </div>
            </div>
          </motion.div>

          {/* Contact Rider */}
          {order.status === 'on_the_way' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex gap-3"
            >
              <Button variant="outline" className="flex-1">
                <Phone className="w-4 h-4 mr-2" />
                Call Rider
              </Button>
              <Button variant="outline" className="flex-1">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            </motion.div>
          )}

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card-base p-4"
          >
            <h3 className="font-bold text-foreground mb-3">Order Summary</h3>
            <div className="space-y-2 mb-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="text-foreground font-medium">
                    Rs. {(item.price * item.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 flex justify-between font-bold">
              <span className="text-foreground">Total</span>
              <span className="text-primary">Rs. {order.total_price.toFixed(0)}</span>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OrderTracking;
