import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Camera, Save, ArrowLeft, 
  Store, Bike, ChefHat, ArrowRight, Volume2, VolumeX, 
  RefreshCw, Lock, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatPKR } from '@/lib/currency';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { useSoundNotifications } from '@/hooks/useSoundNotifications';
import { RoleSwitcher } from '@/components/RoleSwitcher';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  avatar_url: string;
  wallet_balance: number;
}

const Profile = () => {
  const { user, userRole, loading: authLoading, roleLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { uploading: avatarUploading, uploadAvatar } = useAvatarUpload();
  const { soundEnabled, toggleSound, playSound } = useSoundNotifications();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    avatar_url: '',
    wallet_balance: 0,
  });

  useEffect(() => {
    if (authLoading || roleLoading) return;
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfile();
  }, [user, navigate, authLoading, roleLoading]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile({
          name: data.name || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          address: data.address || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
          wallet_balance: data.wallet_balance || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const url = await uploadAvatar(file, user.id);
    if (url) {
      setProfile(prev => ({ ...prev, avatar_url: url }));
      
      // Auto-save avatar
      await supabase
        .from('profiles')
        .update({ avatar_url: url, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
      
      toast({
        title: 'Avatar Updated',
        description: 'Your profile picture has been updated.',
      });
    }
  };

  const getDashboardInfo = () => {
    switch (userRole) {
      case 'restaurant':
        return { path: '/restaurant-dashboard', label: 'Restaurant Dashboard', icon: <Store className="w-5 h-5" /> };
      case 'driver':
        return { path: '/delivery-dashboard', label: 'Delivery Dashboard', icon: <Bike className="w-5 h-5" /> };
      case 'admin':
        return { path: '/admin', label: 'Admin Dashboard', icon: <ChefHat className="w-5 h-5" /> };
      default:
        return null;
    }
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case 'restaurant': return 'Restaurant Owner';
      case 'driver': return 'Delivery Rider';
      case 'admin': return 'Administrator';
      default: return 'Customer';
    }
  };

  const dashboardInfo = getDashboardInfo();

  if (loading || authLoading || roleLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-background">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
              <p className="text-muted-foreground">Manage your account settings</p>
            </div>
          </div>

          {/* Avatar Section with Upload */}
          <div className="bg-card rounded-2xl p-6 mb-6 border border-border">
            <div className="flex items-center gap-6">
              <div className="relative">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-primary" />
                  )}
                </div>
                <button 
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {avatarUploading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">{profile.name || 'User'}</h2>
                <p className="text-muted-foreground">{getRoleLabel()}</p>
                {userRole === 'customer' && (
                  <p className="text-primary font-medium mt-1">
                    Wallet: {formatPKR(profile.wallet_balance)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Role Switching Section */}
          <div className="bg-card rounded-2xl p-4 mb-6 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Active Role</p>
                  <p className="text-sm text-muted-foreground">{getRoleLabel()}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setRoleSwitcherOpen(true)}
              >
                Switch Role
              </Button>
            </div>
          </div>

          {/* Role-specific Dashboard Link */}
          {dashboardInfo && (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-6">
              <Button 
                variant="ghost" 
                className="w-full justify-between gap-3 text-primary hover:text-primary"
                onClick={() => navigate(dashboardInfo.path)}
              >
                <div className="flex items-center gap-3">
                  {dashboardInfo.icon}
                  <span className="font-medium">Go to {dashboardInfo.label}</span>
                </div>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Sound Notifications Toggle */}
          <div className="bg-card rounded-2xl p-4 mb-6 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-foreground" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">Notification Sounds</p>
                  <p className="text-sm text-muted-foreground">
                    {soundEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
              <Switch 
                checked={soundEnabled} 
                onCheckedChange={() => {
                  toggleSound();
                  if (!soundEnabled) {
                    playSound('notification');
                  }
                }}
              />
            </div>
          </div>

          {/* Switch Role Banner - Only for customers */}
          {userRole === 'customer' && (
            <div className="bg-gradient-to-r from-primary/10 to-secondary/50 rounded-2xl p-6 mb-6 border border-primary/20">
              <h3 className="font-semibold text-foreground mb-2">Want to earn money?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Register as a Restaurant Owner or Delivery Partner to start earning
              </p>
              <Button variant="outline" size="sm" onClick={() => navigate('/role-registration')}>
                Complete Registration
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Form */}
          <div className="bg-card rounded-2xl p-6 border border-border space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="pl-10"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  className="pl-10 bg-muted"
                />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="pl-10"
                  placeholder="03XX-XXXXXXX"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Delivery Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Textarea
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="pl-10 min-h-[100px]"
                  placeholder="Enter your delivery address in Karachi"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="min-h-[80px]"
                placeholder="Tell us about yourself..."
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save Changes'}
              <Save className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Quick Links - Customers only */}
          {userRole === 'customer' && (
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Button variant="outline" onClick={() => navigate('/wallet')} className="h-auto py-4 flex-col">
                <span className="text-2xl mb-2">💰</span>
                <span>My Wallet</span>
              </Button>
              <Button variant="outline" onClick={() => navigate('/orders')} className="h-auto py-4 flex-col">
                <span className="text-2xl mb-2">📦</span>
                <span>My Orders</span>
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Role Switcher Dialog */}
      <RoleSwitcher open={roleSwitcherOpen} onOpenChange={setRoleSwitcherOpen} />
    </div>
  );
};

export default Profile;
