import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bike,
  Package,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  Navigation,
  Power,
  PowerOff,
  History,
  DollarSign,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Footer from "@/components/Footer";
import { formatPKR } from "@/lib/currency";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface DeliveryOrder {
  id: string;
  restaurant_id: string | null;
  user_id: string;
  status: "pending" | "preparing" | "on_the_way" | "delivered" | "cancelled";
  items: OrderItem[];
  total_price: number;
  delivery_address: string;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  notes: string | null;
  created_at: string;
  restaurant?: {
    name: string;
    address: string | null;
  };
}

interface Driver {
  id: string;
  user_id: string;
  status: "available" | "busy" | "offline";
  vehicle_type: string | null;
  license_plate: string | null;
  current_latitude: number | null;
  current_longitude: number | null;
}

const DeliveryDashboard = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(false);

  // Fetch driver profile
  const { data: driver, isLoading: driverLoading } = useQuery({
    queryKey: ["driver-profile", user?.id],
    queryFn: async (): Promise<Driver | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user?.id && userRole === "driver",
  });

  // Update online status when driver data loads
  useEffect(() => {
    if (driver) {
      setIsOnline(driver.status === "available" || driver.status === "busy");
    }
  }, [driver]);

  // Fetch assigned orders
  const { data: assignedOrders = [] } = useQuery({
    queryKey: ["driver-orders", driver?.id],
    queryFn: async (): Promise<DeliveryOrder[]> => {
      if (!driver?.id) return [];

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          restaurant:restaurants(name, address)
        `,
        )
        .eq("driver_id", driver.id)
        .in("status", ["on_the_way", "preparing"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((order) => ({
        ...order,
        items: (Array.isArray(order.items)
          ? order.items
          : []) as unknown as OrderItem[],
        status: order.status as DeliveryOrder["status"],
        restaurant: order.restaurant as DeliveryOrder["restaurant"],
      }));
    },
    enabled: !!driver?.id,
  });

  // Fetch delivery history
  const { data: deliveryHistory = [] } = useQuery({
    queryKey: ["driver-history", driver?.id],
    queryFn: async (): Promise<DeliveryOrder[]> => {
      if (!driver?.id) return [];

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          restaurant:restaurants(name, address)
        `,
        )
        .eq("driver_id", driver.id)
        .eq("status", "delivered")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data || []).map((order) => ({
        ...order,
        items: (Array.isArray(order.items)
          ? order.items
          : []) as unknown as OrderItem[],
        status: order.status as DeliveryOrder["status"],
        restaurant: order.restaurant as DeliveryOrder["restaurant"],
      }));
    },
    enabled: !!driver?.id,
  });

  // Real-time order subscription
  useEffect(() => {
    if (!driver?.id) return;

    const channel = supabase
      .channel("driver-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `driver_id=eq.${driver.id}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const newStatus = (payload.new as any)?.status;
            if (newStatus === "on_the_way") {
              toast.success("New delivery assigned to you! 🛵");
            }
          }
          queryClient.invalidateQueries({
            queryKey: ["driver-orders", driver.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["driver-history", driver.id],
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [driver?.id, queryClient]);

  // Calculate earnings
  const todayEarnings =
    deliveryHistory.filter((o) => {
      const orderDate = new Date(o.created_at).toDateString();
      const today = new Date().toDateString();
      return orderDate === today;
    }).length * 50; // Rs. 50 per delivery

  const totalEarnings = deliveryHistory.length * 50;

  // Check authorization
  if (authLoading || driverLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || userRole !== "driver") {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🛵</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Delivery Partner Access Only
          </h2>
          <p className="text-muted-foreground mb-6">
            You need a delivery partner account to access this dashboard
          </p>
          <Button onClick={() => navigate("/role-registration")}>
            Register as Delivery Partner
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Driver Profile Not Found
          </h2>
          <p className="text-muted-foreground mb-6">
            Please complete your driver registration
          </p>
          <Button onClick={() => navigate("/role-registration")}>
            Complete Registration
          </Button>
        </motion.div>
      </div>
    );
  }

  const handleToggleOnline = async () => {
    try {
      const newStatus = isOnline ? "offline" : "available";

      const { error } = await supabase
        .from("drivers")
        .update({ status: newStatus })
        .eq("id", driver.id);

      if (error) throw error;

      setIsOnline(!isOnline);
      toast.success(
        isOnline
          ? "You are now offline"
          : "You are now online and available for deliveries!",
      );
      queryClient.invalidateQueries({ queryKey: ["driver-profile", user.id] });
    } catch (error: any) {
      toast.error("Failed to update status");
    }
  };

  const handleUpdateDeliveryStatus = async (
    orderId: string,
    status: "on_the_way" | "delivered",
  ) => {
    try {
      const order = assignedOrders.find((o) => o.id === orderId);

      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) throw error;

      // Auto-add earnings when order is delivered
      if (status === "delivered" && user && order) {
        const driverEarningsGross = 50; // Fixed delivery fee for driver (Rs. 50 per delivery)
        const driverCommissionRate = 0.05; // 5% commission for drivers
        const driverCommission = driverEarningsGross * driverCommissionRate;
        const driverNet = driverEarningsGross - driverCommission;

        // Add driver earnings
        await supabase.from("earnings").insert({
          user_id: user.id,
          order_id: orderId,
          user_type: "driver",
          gross_amount: driverEarningsGross,
          commission_rate: driverCommissionRate,
          commission_amount: driverCommission,
          net_amount: driverNet,
          status: "available",
        });

        // Add restaurant owner earnings if restaurant exists
        if (order.restaurant_id) {
          // Get restaurant owner
          const { data: restaurantData } = await supabase
            .from("restaurants")
            .select("owner_id, business_type")
            .eq("id", order.restaurant_id)
            .single();

          if (restaurantData?.owner_id) {
            const restaurantCommissionRate = 0.1; // 10% for restaurants
            const restaurantGross = order.total_price;
            const restaurantCommission =
              restaurantGross * restaurantCommissionRate;
            const restaurantNet = restaurantGross - restaurantCommission;

            await supabase.from("earnings").insert({
              user_id: restaurantData.owner_id,
              order_id: orderId,
              user_type:
                restaurantData.business_type === "homechef"
                  ? "homechef"
                  : "restaurant",
              gross_amount: restaurantGross,
              commission_rate: restaurantCommissionRate,
              commission_amount: restaurantCommission,
              net_amount: restaurantNet,
              status: "available",
            });
          }
        }

        queryClient.invalidateQueries({ queryKey: ["earnings"] });
      }

      const statusMessages = {
        on_the_way: "Order picked up! On the way to customer.",
        delivered: "Order delivered successfully! 🎉 Earnings added!",
      };

      toast.success(statusMessages[status]);
      queryClient.invalidateQueries({ queryKey: ["driver-orders", driver.id] });
      queryClient.invalidateQueries({
        queryKey: ["driver-history", driver.id],
      });
    } catch (error: any) {
      toast.error("Failed to update delivery status");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const activeDeliveries = assignedOrders.filter(
    (o) => o.status === "on_the_way",
  );
  const pendingPickups = assignedOrders.filter((o) => o.status === "preparing");

  return (
    <div className="min-h-screen flex flex-col pt-20">
      {/* Header */}
      <section className="py-6 bg-gradient-warm border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Bike className="w-8 h-8 text-primary" />
                  <h1 className="text-2xl font-bold text-foreground">
                    Delivery Dashboard
                  </h1>
                </div>
                <p className="text-muted-foreground">
                  {driver.vehicle_type} • {driver.license_plate || "No plate"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate("/earnings")}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Earnings
                </Button>
                <span
                  className={`text-sm font-medium ${isOnline ? "text-emerald-500" : "text-muted-foreground"}`}
                >
                  {isOnline ? "Online" : "Offline"}
                </span>
                <Switch
                  checked={isOnline}
                  onCheckedChange={handleToggleOnline}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="py-6 border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Deliveries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {activeDeliveries.length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Today's Deliveries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {
                    deliveryHistory.filter((o) => {
                      const orderDate = new Date(o.created_at).toDateString();
                      const today = new Date().toDateString();
                      return orderDate === today;
                    }).length
                  }
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Today's Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-500">
                  {formatPKR(todayEarnings)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Deliveries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {deliveryHistory.length}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 flex-1">
        <div className="container mx-auto px-4 sm:px-6">
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Active
                {assignedOrders.length > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    {assignedOrders.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                History
              </TabsTrigger>
            </TabsList>

            {/* Active Deliveries Tab */}
            <TabsContent value="active" className="space-y-6">
              {!isOnline ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <PowerOff className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    You're Offline
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Go online to start receiving delivery requests
                  </p>
                  <Button variant="hero" onClick={handleToggleOnline}>
                    <Power className="w-5 h-5 mr-2" />
                    Go Online
                  </Button>
                </motion.div>
              ) : assignedOrders.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    No Active Deliveries
                  </h3>
                  <p className="text-muted-foreground">
                    Waiting for new delivery assignments...
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-4 max-w-2xl mx-auto">
                  {/* Pending Pickups */}
                  {pendingPickups.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Package className="w-5 h-5 text-amber-500" />
                        Pending Pickup ({pendingPickups.length})
                      </h3>
                      {pendingPickups.map((order) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="card-base p-5 border-l-4 border-amber-500"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-mono text-xs text-muted-foreground mb-1">
                                #{order.id.slice(0, 8).toUpperCase()}
                              </p>
                              <h4 className="font-semibold text-foreground">
                                {order.restaurant?.name || "Restaurant"}
                              </h4>
                            </div>
                            <span className="font-bold text-primary">
                              {formatPKR(order.total_price)}
                            </span>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-start gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Pickup from
                                </p>
                                <p className="text-foreground">
                                  {order.restaurant?.address ||
                                    "Restaurant address"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Deliver to
                                </p>
                                <p className="text-foreground">
                                  {order.delivery_address}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-secondary rounded-lg p-3 mb-4">
                            <p className="text-xs text-muted-foreground mb-2">
                              Order Items
                            </p>
                            {order.items.map((item, i) => (
                              <p key={i} className="text-sm text-foreground">
                                {item.quantity}x {item.name}
                              </p>
                            ))}
                          </div>

                          {order.notes && (
                            <p className="text-sm text-muted-foreground mb-4 italic">
                              Note: {order.notes}
                            </p>
                          )}

                          <Button
                            className="w-full"
                            onClick={() =>
                              handleUpdateDeliveryStatus(order.id, "on_the_way")
                            }
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm Pickup
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Active Deliveries */}
                  {activeDeliveries.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Truck className="w-5 h-5 text-primary" />
                        On the Way ({activeDeliveries.length})
                      </h3>
                      {activeDeliveries.map((order) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="card-base p-5 border-l-4 border-primary"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-mono text-xs text-muted-foreground mb-1">
                                #{order.id.slice(0, 8).toUpperCase()}
                              </p>
                              <h4 className="font-semibold text-foreground">
                                {order.restaurant?.name || "Restaurant"}
                              </h4>
                            </div>
                            <span className="font-bold text-primary">
                              {formatPKR(order.total_price)}
                            </span>
                          </div>

                          <div className="flex items-start gap-2 text-sm mb-4">
                            <Navigation className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Delivering to
                              </p>
                              <p className="text-foreground font-medium">
                                {order.delivery_address}
                              </p>
                            </div>
                          </div>

                          <div className="bg-secondary rounded-lg p-3 mb-4">
                            <p className="text-xs text-muted-foreground mb-2">
                              Order Items
                            </p>
                            {order.items.map((item, i) => (
                              <p key={i} className="text-sm text-foreground">
                                {item.quantity}x {item.name}
                              </p>
                            ))}
                          </div>

                          {order.notes && (
                            <p className="text-sm text-muted-foreground mb-4 italic">
                              Note: {order.notes}
                            </p>
                          )}

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="flex-1"
                              asChild
                            >
                              <a href={`tel:+92`}>
                                <Phone className="w-4 h-4 mr-2" />
                                Call Customer
                              </a>
                            </Button>
                            <Button
                              className="flex-1"
                              onClick={() =>
                                handleUpdateDeliveryStatus(
                                  order.id,
                                  "delivered",
                                )
                              }
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark Delivered
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              {deliveryHistory.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <History className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    No Delivery History
                  </h3>
                  <p className="text-muted-foreground">
                    Your completed deliveries will appear here
                  </p>
                </motion.div>
              ) : (
                <div className="max-w-2xl mx-auto space-y-4">
                  <div className="card-base p-4 bg-emerald-500/10 border-emerald-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-6 h-6 text-emerald-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Total Earnings
                          </p>
                          <p className="text-xl font-bold text-emerald-500">
                            {formatPKR(totalEarnings)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Total Deliveries
                        </p>
                        <p className="text-xl font-bold text-foreground">
                          {deliveryHistory.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  {deliveryHistory.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card-base p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-mono text-xs text-muted-foreground">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <h4 className="font-medium text-foreground">
                            {order.restaurant?.name}
                          </h4>
                        </div>
                        <div className="text-right">
                          <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full">
                            Delivered
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">
                          {order.delivery_address}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
                        <span className="text-sm text-muted-foreground">
                          Order Total
                        </span>
                        <span className="font-bold text-primary">
                          {formatPKR(order.total_price)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DeliveryDashboard;
