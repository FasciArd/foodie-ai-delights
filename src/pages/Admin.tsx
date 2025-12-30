import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Store, UtensilsCrossed, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurants, useMenuItems } from '@/hooks/useRestaurants';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

const Admin = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: restaurants, isLoading: restaurantsLoading } = useRestaurants();
  
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurantDialogOpen, setRestaurantDialogOpen] = useState(false);
  const [menuItemDialogOpen, setMenuItemDialogOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<any>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<any>(null);
  
  const { data: menuItems } = useMenuItems(selectedRestaurant || undefined);

  // Restaurant form state
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    description: '',
    image: '',
    category: '',
    delivery_time: '30-45 min',
    delivery_fee: 50,
    tags: '',
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
    if (!confirm('Are you sure you want to delete this restaurant?')) return;
    
    try {
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

  const resetRestaurantForm = () => {
    setRestaurantForm({
      name: '',
      description: '',
      image: '',
      category: '',
      delivery_time: '30-45 min',
      delivery_fee: 50,
      tags: '',
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

  return (
    <div className="min-h-screen flex flex-col pt-20 pb-8">
      {/* Header */}
      <section className="py-6 bg-gradient-warm border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage restaurants and menu items</p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container mx-auto px-4 sm:px-6">
          <Tabs defaultValue="restaurants" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="restaurants" className="flex items-center gap-2">
                <Store className="w-4 h-4" />
                Restaurants
              </TabsTrigger>
              <TabsTrigger value="menu" className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4" />
                Menu Items
              </TabsTrigger>
            </TabsList>

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
                        className="card-base p-4"
                      >
                        <img
                          src={restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}
                          alt={restaurant.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <h3 className="font-bold text-foreground">{restaurant.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{restaurant.category}</p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditRestaurant(restaurant)}>
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
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
                      <div className="space-y-2">
                        <Label>Image URL</Label>
                        <Input
                          value={menuItemForm.image}
                          onChange={(e) => setMenuItemForm({ ...menuItemForm, image: e.target.value })}
                          placeholder="https://..."
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
                          placeholder="Main Course, Appetizers..."
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="is_popular"
                          checked={menuItemForm.is_popular}
                          onChange={(e) => setMenuItemForm({ ...menuItemForm, is_popular: e.target.checked })}
                          className="rounded border-border"
                        />
                        <Label htmlFor="is_popular">Mark as popular</Label>
                      </div>
                      <Button onClick={handleSaveMenuItem} className="w-full">
                        {editingMenuItem ? 'Update Item' : 'Create Item'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {selectedRestaurant ? (
                <div className="space-y-3">
                  <AnimatePresence>
                    {menuItems?.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="card-base p-4 flex gap-4"
                      >
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-foreground">{item.name}</h3>
                              <p className="text-sm text-muted-foreground">{item.category}</p>
                              <p className="text-primary font-bold">Rs. {item.price}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon" onClick={() => openEditMenuItem(item)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteMenuItem(item.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {menuItems?.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No menu items yet. Add your first item!
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Select a restaurant to manage its menu items
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Admin;
