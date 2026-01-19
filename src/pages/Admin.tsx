import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit2, Trash2, Store, UtensilsCrossed, Search, Users, 
  BarChart3, Package, Shield, CheckCircle, XCircle, Ban, Eye,
  TrendingUp, DollarSign, ChefHat, Bike, User, AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurants, useMenuItems } from '@/hooks/useRestaurants';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatPKR } from '@/lib/currency';
import Footer from '@/components/Footer';

interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string | null;
  profile_complete: boolean | null;
  created_at: string;
}

interface OrderSummary {
  id: string;
  user_id: string;
  restaurant_id: string | null;
  status: string;
  total_price: number;
  delivery_address: string;
  created_at: string;
}

const Admin = () => {
  const { user, userRole, loading: authLoading, changeRole } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: restaurants, isLoading: restaurantsLoading } = useRestaurants();
  
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [restaurantDialogOpen, setRestaurantDialogOpen] = useState(false);
  const [menuItemDialogOpen, setMenuItemDialogOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<any>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<any>(null);
  const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState('customer');
  
  const { data: menuItems } = useMenuItems(selectedRestaurant || undefined);

  // Fetch all users
  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<UserProfile[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: userRole === 'admin',
  });

  // Fetch all orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async (): Promise<OrderSummary[]> => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, user_id, restaurant_id, status, total_price, delivery_address, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
    enabled: userRole === 'admin',
  });

  // Restaurant form state
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    description: '',
    image: '',
    category: '',
    delivery_time: '30-45 min',
    delivery_fee: 50,
    tags: '',
    is_active: true,
  });

  // Menu item form state
  const [menuItemForm, setMenuItemForm] = useState({
    name: '',
    description: '',
    price: 0,
    image: '',
    category: '',
    calories: 0,
    is_popular: false,
  });

  // Analytics calculations
  const totalUsers = users.length;
  const customerCount = users.filter(u => u.role === 'customer' || !u.role).length;
  const restaurantOwnerCount = users.filter(u => u.role === 'restaurant').length;
  const driverCount = users.filter(u => u.role === 'driver').length;
  const activeRestaurants = restaurants?.filter(r => (r as any).is_active !== false).length || 0;
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total_price, 0);

  // Today's stats
  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today);
  const todayRevenue = todayOrders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total_price, 0);

  // Check if user is admin
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">You need admin privileges to access this page</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </motion.div>
      </div>
    );
  }

  const handleSaveRestaurant = async () => {
    try {
      const tagsArray = restaurantForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      
      if (editingRestaurant) {
        const { error } = await supabase
          .from('restaurants')
          .update({
            ...restaurantForm,
            tags: tagsArray,
          })
          .eq('id', editingRestaurant.id);
        
        if (error) throw error;
        toast.success('Restaurant updated!');
      } else {
        const { error } = await supabase
          .from('restaurants')
          .insert({
            ...restaurantForm,
            tags: tagsArray,
            is_active: true,
          });
        
        if (error) throw error;
        toast.success('Restaurant created!');
      }
      
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      setRestaurantDialogOpen(false);
      resetRestaurantForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save restaurant');
    }
  };

  const handleDeleteRestaurant = async (id: string) => {
    if (!confirm('Are you sure you want to delete this restaurant? This will also delete all menu items.')) return;
    
    try {
      // Delete menu items first
      await supabase.from('menu_items').delete().eq('restaurant_id', id);
      
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Restaurant deleted!');
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete restaurant');
    }
  };

  const handleToggleRestaurantActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ is_active: !isActive })
        .eq('id', id);
      
      if (error) throw error;
      toast.success(isActive ? 'Restaurant suspended' : 'Restaurant activated');
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    } catch (error: any) {
      toast.error('Failed to update restaurant status');
    }
  };

  const handleSaveMenuItem = async () => {
    if (!selectedRestaurant) {
      toast.error('Please select a restaurant first');
      return;
    }
    
    try {
      if (editingMenuItem) {
        const { error } = await supabase
          .from('menu_items')
          .update(menuItemForm)
          .eq('id', editingMenuItem.id);
        
        if (error) throw error;
        toast.success('Menu item updated!');
      } else {
        const { error } = await supabase
          .from('menu_items')
          .insert({
            ...menuItemForm,
            restaurant_id: selectedRestaurant,
            is_available: true,
          });
        
        if (error) throw error;
        toast.success('Menu item created!');
      }
      
      queryClient.invalidateQueries({ queryKey: ['menu-items', selectedRestaurant] });
      setMenuItemDialogOpen(false);
      resetMenuItemForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save menu item');
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
      queryClient.invalidateQueries({ queryKey: ['menu-items', selectedRestaurant] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete menu item');
    }
  };

  const handleChangeUserRole = async () => {
    if (!selectedUser) return;

    try {
      // Update user_roles table via RPC if needed
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', selectedUser.user_id);

      if (profileError) throw profileError;

      // Update user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: selectedUser.user_id,
          role: newRole as any,
        }, { onConflict: 'user_id' });

      if (roleError) throw roleError;

      toast.success(`User role changed to ${newRole}`);
      setChangeRoleDialogOpen(false);
      setSelectedUser(null);
      refetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to change user role');
    }
  };

  const resetRestaurantForm = () => {
    setRestaurantForm({
      name: '',
      description: '',
      image: '',
      category: '',
      delivery_time: '30-45 min',
      delivery_fee: 50,
      tags: '',
      is_active: true,
    });
    setEditingRestaurant(null);
  };

  const resetMenuItemForm = () => {
    setMenuItemForm({
      name: '',
      description: '',
      price: 0,
      image: '',
      category: '',
      calories: 0,
      is_popular: false,
    });
    setEditingMenuItem(null);
  };

  const openEditRestaurant = (restaurant: any) => {
    setEditingRestaurant(restaurant);
    setRestaurantForm({
      name: restaurant.name,
      description: restaurant.description || '',
      image: restaurant.image || '',
      category: restaurant.category,
      delivery_time: restaurant.delivery_time || '30-45 min',
      delivery_fee: restaurant.delivery_fee || 50,
      tags: restaurant.tags?.join(', ') || '',
      is_active: restaurant.is_active ?? true,
    });
    setRestaurantDialogOpen(true);
  };

  const openEditMenuItem = (item: any) => {
    setEditingMenuItem(item);
    setMenuItemForm({
      name: item.name,
      description: item.description || '',
      price: item.price,
      image: item.image || '',
      category: item.category,
      calories: item.calories || 0,
      is_popular: item.is_popular || false,
    });
    setMenuItemDialogOpen(true);
  };

  const filteredRestaurants = restaurants?.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.phone?.includes(userSearchQuery)
  );

  const getRoleIcon = (role: string | null) => {
    switch (role) {
      case 'restaurant': return <Store className="w-4 h-4 text-primary" />;
      case 'driver': return <Bike className="w-4 h-4 text-emerald-500" />;
      case 'admin': return <Shield className="w-4 h-4 text-amber-500" />;
      default: return <User className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-amber-500/10 text-amber-500', label: 'Pending' },
      preparing: { color: 'bg-blue-500/10 text-blue-500', label: 'Preparing' },
      on_the_way: { color: 'bg-purple-500/10 text-purple-500', label: 'On the Way' },
      delivered: { color: 'bg-emerald-500/10 text-emerald-500', label: 'Delivered' },
      cancelled: { color: 'bg-destructive/10 text-destructive', label: 'Cancelled' },
    };
    const config = configs[status] || { color: 'bg-muted text-muted-foreground', label: status };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen flex flex-col pt-20 pb-8">
      {/* Header */}
      <section className="py-6 bg-gradient-warm border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage users, restaurants, orders and analytics</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Analytics Cards */}
      <section className="py-6 border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{totalUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {customerCount} customers • {restaurantOwnerCount} owners • {driverCount} drivers
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  Restaurants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{activeRestaurants}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {restaurants?.length || 0} total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{totalOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {deliveredOrders} delivered • {todayOrders.length} today
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-500">{formatPKR(totalRevenue)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPKR(todayRevenue)} today
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container mx-auto px-4 sm:px-6">
          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-5">
              <TabsTrigger value="analytics" className="flex items-center gap-1 text-xs sm:text-sm">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-1 text-xs sm:text-sm">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="restaurants" className="flex items-center gap-1 text-xs sm:text-sm">
                <Store className="w-4 h-4" />
                <span className="hidden sm:inline">Restaurants</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-1 text-xs sm:text-sm">
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="menu" className="flex items-center gap-1 text-xs sm:text-sm">
                <UtensilsCrossed className="w-4 h-4" />
                <span className="hidden sm:inline">Menu</span>
              </TabsTrigger>
            </TabsList>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* User Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">User Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <span className="text-sm">Customers</span>
                        </div>
                        <span className="font-semibold">{customerCount}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(customerCount / totalUsers) * 100}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-primary" />
                          <span className="text-sm">Restaurant Owners</span>
                        </div>
                        <span className="font-semibold">{restaurantOwnerCount}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(restaurantOwnerCount / totalUsers) * 100}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-emerald-500" />
                          <span className="text-sm">Delivery Riders</span>
                        </div>
                        <span className="font-semibold">{driverCount}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full" 
                          style={{ width: `${(driverCount / totalUsers) * 100}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Status Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {['pending', 'preparing', 'on_the_way', 'delivered', 'cancelled'].map(status => {
                        const count = orders.filter(o => o.status === status).length;
                        const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
                        const colors: Record<string, string> = {
                          pending: 'bg-amber-500',
                          preparing: 'bg-blue-500',
                          on_the_way: 'bg-purple-500',
                          delivered: 'bg-emerald-500',
                          cancelled: 'bg-destructive',
                        };
                        return (
                          <div key={status}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                              <span className="text-sm font-medium">{count}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className={`${colors[status]} h-2 rounded-full`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name, email, phone..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" onClick={() => refetchUsers()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {usersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">User</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Role</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Phone</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredUsers.map(userProfile => (
                          <tr key={userProfile.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-foreground">{userProfile.name || 'No name'}</p>
                                <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {getRoleIcon(userProfile.role)}
                                <span className="text-sm capitalize">{userProfile.role || 'customer'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {userProfile.phone || '-'}
                            </td>
                            <td className="px-4 py-3">
                              {userProfile.profile_complete ? (
                                <span className="flex items-center gap-1 text-emerald-500 text-sm">
                                  <CheckCircle className="w-4 h-4" />
                                  Complete
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-amber-500 text-sm">
                                  <AlertTriangle className="w-4 h-4" />
                                  Incomplete
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(userProfile);
                                  setNewRole(userProfile.role || 'customer');
                                  setChangeRoleDialogOpen(true);
                                }}
                              >
                                Change Role
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Restaurants Tab */}
            <TabsContent value="restaurants" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search restaurants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Dialog open={restaurantDialogOpen} onOpenChange={(open) => {
                  setRestaurantDialogOpen(open);
                  if (!open) resetRestaurantForm();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Restaurant
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={restaurantForm.name}
                          onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
                          placeholder="Restaurant name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={restaurantForm.description}
                          onChange={(e) => setRestaurantForm({ ...restaurantForm, description: e.target.value })}
                          placeholder="Brief description"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Image URL</Label>
                        <Input
                          value={restaurantForm.image}
                          onChange={(e) => setRestaurantForm({ ...restaurantForm, image: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Input
                            value={restaurantForm.category}
                            onChange={(e) => setRestaurantForm({ ...restaurantForm, category: e.target.value })}
                            placeholder="Pakistani, Chinese..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Delivery Time</Label>
                          <Input
                            value={restaurantForm.delivery_time}
                            onChange={(e) => setRestaurantForm({ ...restaurantForm, delivery_time: e.target.value })}
                            placeholder="30-45 min"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Delivery Fee (Rs.)</Label>
                        <Input
                          type="number"
                          value={restaurantForm.delivery_fee}
                          onChange={(e) => setRestaurantForm({ ...restaurantForm, delivery_fee: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tags (comma-separated)</Label>
                        <Input
                          value={restaurantForm.tags}
                          onChange={(e) => setRestaurantForm({ ...restaurantForm, tags: e.target.value })}
                          placeholder="Halal, Spicy, Traditional"
                        />
                      </div>
                      <Button onClick={handleSaveRestaurant} className="w-full">
                        {editingRestaurant ? 'Update Restaurant' : 'Create Restaurant'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {restaurantsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {filteredRestaurants?.map((restaurant) => (
                      <motion.div
                        key={restaurant.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`card-base p-4 ${!restaurant.is_active ? 'opacity-60' : ''}`}
                      >
                        <div className="relative">
                          <img
                            src={restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}
                            alt={restaurant.name}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                          {(restaurant as any).is_active === false && (
                            <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded">
                              Suspended
                            </div>
                          )}
                        </div>
                        <h3 className="font-bold text-foreground">{restaurant.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{restaurant.category}</p>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditRestaurant(restaurant)}>
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleRestaurantActive(restaurant.id, (restaurant as any).is_active !== false)}
                          >
                            {(restaurant as any).is_active !== false ? (
                              <>
                                <Ban className="w-3 h-3 mr-1" />
                                Suspend
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDeleteRestaurant(restaurant.id)}>
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              {ordersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Order ID</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Address</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Total</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {orders.slice(0, 50).map(order => (
                          <tr key={order.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3">
                              <span className="font-mono text-sm">#{order.id.slice(0, 8).toUpperCase()}</span>
                            </td>
                            <td className="px-4 py-3">
                              {getStatusBadge(order.status)}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                              {order.delivery_address}
                            </td>
                            <td className="px-4 py-3 text-right font-medium">
                              {formatPKR(order.total_price)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Menu Items Tab */}
            <TabsContent value="menu" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <select
                  value={selectedRestaurant || ''}
                  onChange={(e) => setSelectedRestaurant(e.target.value || null)}
                  className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="">Select a restaurant</option>
                  {restaurants?.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                
                <Dialog open={menuItemDialogOpen} onOpenChange={(open) => {
                  setMenuItemDialogOpen(open);
                  if (!open) resetMenuItemForm();
                }}>
                  <DialogTrigger asChild>
                    <Button disabled={!selectedRestaurant}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Menu Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingMenuItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={menuItemForm.name}
                          onChange={(e) => setMenuItemForm({ ...menuItemForm, name: e.target.value })}
                          placeholder="Item name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={menuItemForm.description}
                          onChange={(e) => setMenuItemForm({ ...menuItemForm, description: e.target.value })}
                          placeholder="Brief description"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Price (Rs.)</Label>
                          <Input
                            type="number"
                            value={menuItemForm.price}
                            onChange={(e) => setMenuItemForm({ ...menuItemForm, price: Number(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Calories</Label>
                          <Input
                            type="number"
                            value={menuItemForm.calories}
                            onChange={(e) => setMenuItemForm({ ...menuItemForm, calories: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Input
                          value={menuItemForm.category}
                          onChange={(e) => setMenuItemForm({ ...menuItemForm, category: e.target.value })}
                          placeholder="BBQ, Rice, Desserts..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Image URL</Label>
                        <Input
                          value={menuItemForm.image}
                          onChange={(e) => setMenuItemForm({ ...menuItemForm, image: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                      <Button onClick={handleSaveMenuItem} className="w-full">
                        {editingMenuItem ? 'Update Menu Item' : 'Create Menu Item'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {selectedRestaurant ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {menuItems?.map((item: any) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="card-base p-4"
                      >
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'}
                          alt={item.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-foreground">{item.name}</h3>
                          <span className="font-bold text-primary">{formatPKR(item.price)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{item.category}</p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditMenuItem(item)}>
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDeleteMenuItem(item.id)}>
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a restaurant to view and manage menu items</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Change Role Dialog */}
      <Dialog open={changeRoleDialogOpen} onOpenChange={setChangeRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUser?.name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>New Role</Label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full mt-2 px-4 py-2 rounded-lg border border-border bg-background text-foreground"
            >
              <option value="customer">Customer</option>
              <option value="restaurant">Restaurant Owner</option>
              <option value="driver">Delivery Rider</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangeUserRole}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Admin;
