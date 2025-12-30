import { motion } from 'framer-motion';
import { Package, Clock, MapPin, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';

// Mock order data for demonstration
const mockOrders = [
  {
    id: 'ORD-001',
    restaurantName: 'Spice Garden',
    status: 'on-the-way',
    items: [
      { name: 'Butter Chicken', quantity: 2 },
      { name: 'Garlic Naan', quantity: 4 },
    ],
    totalPrice: 41.94,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
    estimatedDelivery: '10-15 min',
  },
  {
    id: 'ORD-002',
    restaurantName: 'Sakura Sushi',
    status: 'delivered',
    items: [
      { name: 'Dragon Roll', quantity: 1 },
      { name: 'Tonkotsu Ramen', quantity: 1 },
    ],
    totalPrice: 30.98,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    estimatedDelivery: 'Delivered',
  },
];

const statusConfig = {
  pending: {
    label: 'Order Placed',
    color: 'bg-muted',
    textColor: 'text-muted-foreground',
    icon: Package,
  },
  preparing: {
    label: 'Preparing',
    color: 'bg-primary/20',
    textColor: 'text-primary',
    icon: Clock,
  },
  'on-the-way': {
    label: 'On the Way',
    color: 'bg-primary',
    textColor: 'text-primary-foreground',
    icon: MapPin,
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-emerald-500',
    textColor: 'text-primary-foreground',
    icon: CheckCircle,
  },
};

const Orders = () => {
  const navigate = useNavigate();

  const formatDate = (date: Date) => {
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

  return (
    <div className="min-h-screen flex flex-col pt-20">
      {/* Header */}
      <section className="py-6 sm:py-8 bg-gradient-warm border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
              Your Orders
            </h1>
            <p className="text-muted-foreground">
              Track your current and past orders
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container mx-auto px-4 sm:px-6">
          {mockOrders.length === 0 ? (
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
                You haven't placed any orders yet. Start exploring delicious food!
              </p>
              <Button variant="hero" onClick={() => navigate('/restaurants')}>
                Browse Restaurants
              </Button>
            </motion.div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-4">
              {mockOrders.map((order, index) => {
                const status = statusConfig[order.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card-base p-5"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {order.id}
                        </p>
                        <h3 className="font-bold text-lg text-foreground">
                          {order.restaurantName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.color} ${status.textColor}`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{status.label}</span>
                      </div>
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
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{order.estimatedDelivery}</span>
                      </div>
                      <span className="font-bold text-primary">
                        ${order.totalPrice.toFixed(2)}
                      </span>
                    </div>

                    {/* Order Timeline for active orders */}
                    {order.status !== 'delivered' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-border"
                      >
                        <div className="flex justify-between relative">
                          <div className="absolute top-3 left-0 right-0 h-0.5 bg-border" />
                          {['pending', 'preparing', 'on-the-way', 'delivered'].map(
                            (step, i) => {
                              const stepConfig = statusConfig[step as keyof typeof statusConfig];
                              const isActive =
                                ['pending', 'preparing', 'on-the-way', 'delivered'].indexOf(
                                  order.status
                                ) >= i;
                              return (
                                <div
                                  key={step}
                                  className="relative flex flex-col items-center"
                                >
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                      isActive ? 'bg-primary' : 'bg-muted'
                                    }`}
                                  >
                                    <stepConfig.icon
                                      className={`w-3 h-3 ${
                                        isActive
                                          ? 'text-primary-foreground'
                                          : 'text-muted-foreground'
                                      }`}
                                    />
                                  </div>
                                  <span
                                    className={`text-xs mt-2 ${
                                      isActive
                                        ? 'text-foreground'
                                        : 'text-muted-foreground'
                                    }`}
                                  >
                                    {stepConfig.label}
                                  </span>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Orders;
