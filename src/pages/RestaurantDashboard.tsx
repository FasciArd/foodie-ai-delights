import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Store, UtensilsCrossed, Package, BarChart3, Plus, Edit2, Trash2, 
  Clock, DollarSign, TrendingUp, Eye, CheckCircle, Truck, ChefHat,
  Search, Filter, Star, Settings, Upload, Camera, X, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Footer from '@/components/Footer';
import { formatPKR } from '@/lib/currency';
import FoodItemModal from '@/components/FoodItemModal';
import { useImageUpload } from '@/hooks/useImageUpload';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  user_id: string;
  driver_id: string | null;
  status: 'pending' | 'preparing' | 'on_the_way' | 'delivered' | 'cancelled';
  items: OrderItem[];
  total_price: number;
  delivery_address: string;
  notes: string | null;
  created_at: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category: string;
  calories: number | null;
  is_popular: boolean;
  is_available: boolean;
}

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  logo: string | null;
  category: string;
  rating: number | null;
  delivery_time: string | null;
  delivery_fee: number | null;
  tags: string[] | null;
  is_active: boolean;
  address: string | null;
  opening_hours: string | null;
}

interface Driver {
  id: string;
  user_id: string;
  vehicle_type: string | null;
  license_plate: string | null;
  status: string;
  profile?: {
    name: string;
  };
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-amber-500', icon: Package },
  preparing: { label: 'Preparing', color: 'bg-primary', icon: ChefHat },
  on_the_way: { label: 'On the Way', color: 'bg-blue-500', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-emerald-500', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-destructive', icon: Package },
};

const RestaurantDashboard = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const [menuItemDialogOpen, setMenuItemDialogOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [restaurantDialogOpen, setRestaurantDialogOpen] = useState(false);
  const [restaurantSettingsOpen, setRestaurantSettingsOpen] = useState(false);
  const [deleteRestaurantDialog, setDeleteRestaurantDialog] = useState(false);

  const { uploading: coverUploading, uploadImage: uploadCover } = useImageUpload({ folder: 'restaurants/covers' });
  const { uploading: logoUploading, uploadImage: uploadLogo } = useImageUpload({ folder: 'restaurants/logos' });

  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    description: '',
    image: '',
    logo: '',
    category: '',
    delivery_time: '30-45 min',
    delivery_fee: 50,
    tags: '',
    address: '',
    opening_hours: '09:00 AM - 11:00 PM',
  });

  // Fetch owner's restaurant
  const { data: restaurant, isLoading: restaurantLoading } = useQuery({
    queryKey: ['owner-restaurant', user?.id],
    queryFn: async (): Promise<Restaurant | null> => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && userRole === 'restaurant',
  });

  // Populate form when restaurant data loads
  useEffect(() => {
    if (restaurant) {
      setRestaurantForm({
        name: restaurant.name,
        description: restaurant.description || '',
        image: restaurant.image || '',
        logo: restaurant.logo || '',
        category: restaurant.category,
        delivery_time: restaurant.delivery_time || '30-45 min',
        delivery_fee: restaurant.delivery_fee || 50,
        tags: restaurant.tags?.join(', ') || '',
        address: restaurant.address || '',
        opening_hours: restaurant.opening_hours || '09:00 AM - 11:00 PM',
      });
    }
  }, [restaurant]);

  // Fetch menu items for restaurant
  const { data: menuItems = [] } = useQuery({
    queryKey: ['owner-menu-items', restaurant?.id],
    queryFn: async (): Promise<MenuItem[]> => {
      if (!restaurant?.id) return [];
      
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('category', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!restaurant?.id,
  });

  // Fetch orders for restaurant
  const { data: orders = [] } = useQuery({
    queryKey: ['owner-orders', restaurant?.id],
    queryFn: async (): Promise<Order[]> => {
      if (!restaurant?.id) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(order => ({
        ...order,
        items: (Array.isArray(order.items) ? order.items : []) as unknown as OrderItem[],
        status: order.status as Order['status'],
      }));
    },
    enabled: !!restaurant?.id,
  });

  // Fetch available drivers - Fixed query without join
  const { data: drivers = [] } = useQuery({
    queryKey: ['available-drivers'],
    queryFn: async (): Promise<Driver[]> => {
      // First get available drivers
      const { data: driversData, error: driversError } = await supabase
        .from('drivers')
        .select('*')
        .eq('status', 'available');
      
      if (driversError) throw driversError;
      if (!driversData || driversData.length === 0) return [];

      // Then get their profiles
      const userIds = driversData.map(d => d.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', userIds);

      if (profilesError) {
        console.warn('Could not fetch driver profiles:', profilesError);
        // Return drivers without profile names
        return driversData.map(d => ({
          ...d,
          profile: { name: 'Driver' }
        }));
      }

      // Merge data
      const profileMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
      return driversData.map(d => ({
        ...d,
        profile: profileMap.get(d.user_id) || { name: 'Driver' }
      }));
    },
    enabled: !!restaurant?.id,
  });

  // Real-time order subscription
  useEffect(() => {
    if (!restaurant?.id) return;

    const channel = supabase
      .channel('restaurant-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurant.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            toast.success('New order received! 🎉');
          }
          queryClient.invalidateQueries({ queryKey: ['owner-orders', restaurant.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurant?.id, queryClient]);

  // Analytics calculations
  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.created_at).toDateString();
    const today = new Date().toDateString();
    return orderDate === today;
  });

  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total_price, 0);

  const todayRevenue = todayOrders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total_price, 0);

  const popularItems = menuItems
    .filter(item => item.is_popular)
    .slice(0, 5);

  // Check authorization
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || userRole !== 'restaurant') {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Restaurant Access Only</h2>
          <p className="text-muted-foreground mb-6">You need a restaurant owner account to access this dashboard</p>
          <Button onClick={() => navigate('/role-registration')}>Register as Restaurant Owner</Button>
        </motion.div>
      </div>
    );
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadCover(file);
    if (url) {
      setRestaurantForm(prev => ({ ...prev, image: url }));
      toast.success('Cover image uploaded!');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadLogo(file);
    if (url) {
      setRestaurantForm(prev => ({ ...prev, logo: url }));
      toast.success('Logo uploaded!');
    }
  };

  const handleCreateRestaurant = async () => {
    try {
      const tagsArray = restaurantForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      
      const { error } = await supabase
        .from('restaurants')
        .insert({
          name: restaurantForm.name,
          description: restaurantForm.description,
          image: restaurantForm.image,
          logo: restaurantForm.logo,
          category: restaurantForm.category,
          delivery_time: restaurantForm.delivery_time,
          delivery_fee: restaurantForm.delivery_fee,
          tags: tagsArray,
          address: restaurantForm.address,
          opening_hours: restaurantForm.opening_hours,
          owner_id: user.id,
          is_active: true,
        });
      
      if (error) throw error;
      toast.success('Restaurant created successfully!');
      queryClient.invalidateQueries({ queryKey: ['owner-restaurant', user.id] });
      setRestaurantDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create restaurant');
    }
  };

  const handleUpdateRestaurant = async () => {
    if (!restaurant?.id) return;
    
    try {
      const tagsArray = restaurantForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      
      const { error } = await supabase
        .from('restaurants')
        .update({
          name: restaurantForm.name,
          description: restaurantForm.description,
          image: restaurantForm.image,
          logo: restaurantForm.logo,
          category: restaurantForm.category,
          delivery_time: restaurantForm.delivery_time,
          delivery_fee: restaurantForm.delivery_fee,
          tags: tagsArray,
          address: restaurantForm.address,
          opening_hours: restaurantForm.opening_hours,
        })
        .eq('id', restaurant.id);
      
      if (error) throw error;
      toast.success('Restaurant updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['owner-restaurant', user.id] });
      setRestaurantSettingsOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update restaurant');
    }
  };

  const handleDeleteRestaurant = async () => {
    if (!restaurant?.id) return;
    
    try {
      // Delete menu items first
      await supabase
        .from('menu_items')
        .delete()
        .eq('restaurant_id', restaurant.id);
      
      // Then delete restaurant
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', restaurant.id);
      
      if (error) throw error;
      
      toast.success('Restaurant deleted permanently');
      queryClient.invalidateQueries({ queryKey: ['owner-restaurant', user.id] });
      setDeleteRestaurantDialog(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete restaurant');
    }
  };

  const handleSaveMenuItem = async (formData: {
    name: string;
    description: string;
    price: number;
    category: string;
    calories: number;
    is_popular: boolean;
    is_available: boolean;
    image: string;
  }) => {
    if (!restaurant?.id) return;
    
    try {
      if (editingMenuItem) {
        const { error } = await supabase
          .from('menu_items')
          .update({
            name: formData.name,
            description: formData.description || null,
            price: formData.price,
            category: formData.category,
            calories: formData.calories || null,
            is_popular: formData.is_popular,
            is_available: formData.is_available,
            image: formData.image || null,
          })
          .eq('id', editingMenuItem.id);
        
        if (error) throw error;
        toast.success('Menu item updated!');
      } else {
        const { error } = await supabase
          .from('menu_items')
          .insert({
            restaurant_id: restaurant.id,
            name: formData.name,
            description: formData.description || null,
            price: formData.price,
            category: formData.category,
            calories: formData.calories || null,
            is_popular: formData.is_popular,
            is_available: formData.is_available,
            image: formData.image || null,
          });
        
        if (error) throw error;
        toast.success('Menu item created!');
      }
      
      queryClient.invalidateQueries({ queryKey: ['owner-menu-items', restaurant.id] });
      setMenuItemDialogOpen(false);
      setEditingMenuItem(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save menu item');
      throw error;
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Menu item deleted!');
      queryClient.invalidateQueries({ queryKey: ['owner-menu-items', restaurant?.id] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete menu item');
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: !item.is_available })
        .eq('id', item.id);
      
      if (error) throw error;
      toast.success(item.is_available ? 'Item marked as unavailable' : 'Item marked as available');
      queryClient.invalidateQueries({ queryKey: ['owner-menu-items', restaurant?.id] });
    } catch (error: any) {
      toast.error('Failed to update availability');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;
      toast.success(`Order status updated to ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ['owner-orders', restaurant?.id] });
    } catch (error: any) {
      toast.error('Failed to update order status');
    }
  };

  const handleAssignDriver = async (orderId: string, driverId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ driver_id: driverId, status: 'on_the_way' })
        .eq('id', orderId);
      
      if (error) throw error;
      toast.success('Driver assigned successfully!');
      queryClient.invalidateQueries({ queryKey: ['owner-orders', restaurant?.id] });
    } catch (error: any) {
      toast.error('Failed to assign driver');
    }
  };

  const openEditMenuItem = (item: MenuItem) => {
    setEditingMenuItem(item);
    setMenuItemDialogOpen(true);
  };

  // Restaurant Form Component
  const RestaurantFormContent = ({ isCreate = false }: { isCreate?: boolean }) => (
    <div className="space-y-4 py-4">
      {/* Cover Image Upload */}
      <div className="space-y-2">
        <Label>Cover Image</Label>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverUpload}
          className="hidden"
        />
        {restaurantForm.image ? (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
            <img src={restaurantForm.image} alt="Cover" className="w-full h-full object-cover" />
            {coverUploading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => coverInputRef.current?.click()}
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div
            onClick={() => coverInputRef.current?.click()}
            className="aspect-video rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
          >
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Upload cover image</span>
          </div>
        )}
      </div>

      {/* Logo Upload */}
      <div className="space-y-2">
        <Label>Logo (Optional)</Label>
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          className="hidden"
        />
        <div className="flex items-center gap-4">
          {restaurantForm.logo ? (
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted">
              <img src={restaurantForm.logo} alt="Logo" className="w-full h-full object-cover" />
              {logoUploading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() => logoInputRef.current?.click()}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
            >
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => logoInputRef.current?.click()}
          >
            {restaurantForm.logo ? 'Change Logo' : 'Upload Logo'}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="restaurant-name">Restaurant Name *</Label>
        <Input
          id="restaurant-name"
          name="restaurant-name"
          autoComplete="off"
          value={restaurantForm.name}
          onChange={(e) => {
            e.stopPropagation();
            setRestaurantForm(prev => ({ ...prev, name: e.target.value }));
          }}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder="Enter restaurant name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="restaurant-description">Description</Label>
        <Textarea
          id="restaurant-description"
          name="restaurant-description"
          autoComplete="off"
          value={restaurantForm.description}
          onChange={(e) => {
            e.stopPropagation();
            setRestaurantForm(prev => ({ ...prev, description: e.target.value }));
          }}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder="Brief description of your restaurant"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="restaurant-address">Address</Label>
        <Input
          id="restaurant-address"
          name="restaurant-address"
          autoComplete="off"
          value={restaurantForm.address}
          onChange={(e) => {
            e.stopPropagation();
            setRestaurantForm(prev => ({ ...prev, address: e.target.value }));
          }}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder="Full address"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="restaurant-category">Category *</Label>
          <Input
            id="restaurant-category"
            name="restaurant-category"
            autoComplete="off"
            value={restaurantForm.category}
            onChange={(e) => {
              e.stopPropagation();
              setRestaurantForm(prev => ({ ...prev, category: e.target.value }));
            }}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Pakistani, Chinese..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="delivery-time">Delivery Time</Label>
          <Input
            id="delivery-time"
            name="delivery-time"
            autoComplete="off"
            value={restaurantForm.delivery_time}
            onChange={(e) => {
              e.stopPropagation();
              setRestaurantForm(prev => ({ ...prev, delivery_time: e.target.value }));
            }}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="30-45 min"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="delivery-fee">Delivery Fee (Rs.)</Label>
          <Input
            id="delivery-fee"
            name="delivery-fee"
            type="number"
            value={restaurantForm.delivery_fee}
            onChange={(e) => {
              e.stopPropagation();
              setRestaurantForm(prev => ({ ...prev, delivery_fee: Number(e.target.value) }));
            }}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="opening-hours">Opening Hours</Label>
          <Input
            id="opening-hours"
            name="opening-hours"
            autoComplete="off"
            value={restaurantForm.opening_hours}
            onChange={(e) => {
              e.stopPropagation();
              setRestaurantForm(prev => ({ ...prev, opening_hours: e.target.value }));
            }}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="09:00 AM - 11:00 PM"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="restaurant-tags">Tags (comma-separated)</Label>
        <Input
          id="restaurant-tags"
          name="restaurant-tags"
          autoComplete="off"
          value={restaurantForm.tags}
          onChange={(e) => {
            e.stopPropagation();
            setRestaurantForm(prev => ({ ...prev, tags: e.target.value }));
          }}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder="Halal, Spicy, Traditional"
        />
      </div>
      <Button 
        onClick={isCreate ? handleCreateRestaurant : handleUpdateRestaurant} 
        className="w-full"
        disabled={!restaurantForm.name || !restaurantForm.category || coverUploading || logoUploading}
      >
        {isCreate ? 'Create Restaurant' : 'Save Changes'}
      </Button>
    </div>
  );

  // If no restaurant, show create restaurant form
  if (!restaurantLoading && !restaurant) {
    return (
      <div className="min-h-screen flex flex-col pt-20">
        <section className="py-16 flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto px-4"
          >
            <div className="text-7xl mb-6">🏪</div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Create Your Restaurant</h2>
            <p className="text-muted-foreground mb-8">
              Set up your restaurant profile to start receiving orders
            </p>
            
            <Dialog open={restaurantDialogOpen} onOpenChange={setRestaurantDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Restaurant
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Your Restaurant</DialogTitle>
                </DialogHeader>
                <RestaurantFormContent isCreate />
              </DialogContent>
            </Dialog>
          </motion.div>
        </section>
        <Footer />
      </div>
    );
  }

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'on_the_way' || o.status === 'delivered');

  return (
    <div className="min-h-screen flex flex-col pt-20">
      {/* Header */}
      <section className="py-6 bg-gradient-warm border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {restaurant?.logo ? (
                  <img src={restaurant.logo} alt="Logo" className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <Store className="w-8 h-8 text-primary" />
                )}
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{restaurant?.name}</h1>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{restaurant?.category}</span>
                    {restaurant?.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-3 h-3 text-primary fill-primary" />
                        <span>{restaurant.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate('/earnings')}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Earnings
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRestaurantSettingsOpen(true)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Restaurant Settings Dialog */}
      <Dialog open={restaurantSettingsOpen} onOpenChange={setRestaurantSettingsOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Restaurant Settings</DialogTitle>
          </DialogHeader>
          <RestaurantFormContent />
          <div className="pt-4 border-t border-border">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setDeleteRestaurantDialog(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Restaurant
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteRestaurantDialog} onOpenChange={setDeleteRestaurantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Restaurant</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your restaurant,
              all menu items, and remove it from customer view.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteRestaurantDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRestaurant}>
              Yes, Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Analytics Cards */}
      <section className="py-6 border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Today's Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{todayOrders.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Today's Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatPKR(todayRevenue)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{formatPKR(totalRevenue)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Menu Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{menuItems.length}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 flex-1">
        <div className="container mx-auto px-4 sm:px-6">
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full max-w-lg grid-cols-3">
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Orders
                {pendingOrders.length > 0 && (
                  <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                    {pendingOrders.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="menu" className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4" />
                Menu
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Pending Orders */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Package className="w-5 h-5 text-amber-500" />
                    Pending ({pendingOrders.length})
                  </h3>
                  {pendingOrders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No pending orders</p>
                  ) : (
                    pendingOrders.map(order => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card-base p-4 border-l-4 border-amber-500"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-mono text-xs text-muted-foreground">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <span className="text-sm font-bold text-primary">
                            {formatPKR(order.total_price)}
                          </span>
                        </div>
                        <div className="space-y-1 mb-3">
                          {order.items.map((item, i) => (
                            <p key={i} className="text-sm text-foreground">
                              {item.quantity}x {item.name}
                            </p>
                          ))}
                        </div>
                        {order.notes && (
                          <p className="text-xs text-muted-foreground mb-3 italic">
                            Note: {order.notes}
                          </p>
                        )}
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                        >
                          <ChefHat className="w-4 h-4 mr-2" />
                          Start Preparing
                        </Button>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Preparing Orders */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-primary" />
                    Preparing ({preparingOrders.length})
                  </h3>
                  {preparingOrders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No orders being prepared</p>
                  ) : (
                    preparingOrders.map(order => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card-base p-4 border-l-4 border-primary"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-mono text-xs text-muted-foreground">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <span className="text-sm font-bold text-primary">
                            {formatPKR(order.total_price)}
                          </span>
                        </div>
                        <div className="space-y-1 mb-3">
                          {order.items.map((item, i) => (
                            <p key={i} className="text-sm text-foreground">
                              {item.quantity}x {item.name}
                            </p>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <select
                            className="w-full p-2 rounded-lg border border-border bg-background text-sm"
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAssignDriver(order.id, e.target.value);
                              }
                            }}
                            defaultValue=""
                          >
                            <option value="">Assign a rider...</option>
                            {drivers.map((driver) => (
                              <option key={driver.id} value={driver.id}>
                                {driver.profile?.name || 'Driver'} - {driver.vehicle_type || 'Vehicle'}
                              </option>
                            ))}
                          </select>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleUpdateOrderStatus(order.id, 'on_the_way')}
                          >
                            <Truck className="w-4 h-4 mr-2" />
                            Mark Ready for Pickup
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Completed Orders */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    Recent Completed
                  </h3>
                  {readyOrders.slice(0, 5).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No completed orders yet</p>
                  ) : (
                    readyOrders.slice(0, 5).map(order => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card-base p-4 border-l-4 border-emerald-500 opacity-75"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-mono text-xs text-muted-foreground">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            order.status === 'delivered' 
                              ? 'bg-emerald-500/10 text-emerald-500' 
                              : 'bg-blue-500/10 text-blue-500'
                          }`}>
                            {order.status === 'delivered' ? 'Delivered' : 'On the way'}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-foreground">
                          {formatPKR(order.total_price)}
                        </p>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Menu Tab */}
            <TabsContent value="menu" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-foreground">Menu Items</h3>
                <Button onClick={() => {
                  setEditingMenuItem(null);
                  setMenuItemDialogOpen(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <FoodItemModal
                open={menuItemDialogOpen}
                onOpenChange={(open) => {
                  setMenuItemDialogOpen(open);
                  if (!open) setEditingMenuItem(null);
                }}
                onSave={handleSaveMenuItem}
                initialData={editingMenuItem ? {
                  name: editingMenuItem.name,
                  description: editingMenuItem.description || '',
                  price: editingMenuItem.price,
                  category: editingMenuItem.category,
                  calories: editingMenuItem.calories || 0,
                  is_popular: editingMenuItem.is_popular,
                  is_available: editingMenuItem.is_available,
                  image: editingMenuItem.image || '',
                } : undefined}
                isEditing={!!editingMenuItem}
              />

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems.map(item => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`card-base p-4 ${!item.is_available ? 'opacity-60' : ''}`}
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-foreground">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                      <span className="font-bold text-primary">{formatPKR(item.price)}</span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      {item.calories && (
                        <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full">
                          {item.calories} cal
                        </span>
                      )}
                      {item.is_popular && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Popular</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.is_available 
                          ? 'bg-emerald-500/10 text-emerald-500' 
                          : 'bg-destructive/10 text-destructive'
                      }`}>
                        {item.is_available ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleToggleAvailability(item)}
                      >
                        {item.is_available ? 'Mark Unavailable' : 'Mark Available'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditMenuItem(item)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteMenuItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {menuItems.length === 0 && (
                <div className="text-center py-12">
                  <UtensilsCrossed className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No menu items yet</h3>
                  <p className="text-muted-foreground mb-4">Add your first dish to get started</p>
                  <Button onClick={() => {
                    setEditingMenuItem(null);
                    setMenuItemDialogOpen(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Item
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Popular Dishes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {popularItems.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No popular items marked yet</p>
                    ) : (
                      <div className="space-y-3">
                        {popularItems.map((item, i) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">
                              {i + 1}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.category}</p>
                            </div>
                            <span className="font-bold text-primary">{formatPKR(item.price)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Orders</span>
                        <span className="font-bold text-foreground">{orders.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Completed Orders</span>
                        <span className="font-bold text-emerald-500">
                          {orders.filter(o => o.status === 'delivered').length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Cancelled Orders</span>
                        <span className="font-bold text-destructive">
                          {orders.filter(o => o.status === 'cancelled').length}
                        </span>
                      </div>
                      <div className="pt-4 border-t border-border">
                        <div className="flex justify-between items-center">
                          <span className="text-foreground font-medium">Total Revenue</span>
                          <span className="text-xl font-bold text-primary">{formatPKR(totalRevenue)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default RestaurantDashboard;
