import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Store, Bike, ChefHat, ArrowRight, ArrowLeft, Phone, MapPin, 
  FileText, Clock, CreditCard, AlertCircle, CheckCircle, Upload, Camera, X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getRoleDashboardPath } from '@/components/RoleBasedRedirect';
import { useImageUpload } from '@/hooks/useImageUpload';
import type { Database } from '@/integrations/supabase/types';

type Role = Database['public']['Enums']['app_role'];
type BusinessType = 'restaurant' | 'homechef';

interface RoleOption {
  id: Role;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const roles: RoleOption[] = [
  {
    id: 'customer',
    title: 'Customer',
    description: 'Order food from your favorite restaurants',
    icon: <User className="w-8 h-8" />,
  },
  {
    id: 'restaurant',
    title: 'Restaurant / HomeChef',
    description: 'List your restaurant or home kitchen',
    icon: <Store className="w-8 h-8" />,
  },
  {
    id: 'driver',
    title: 'Delivery Rider',
    description: 'Earn money by delivering food orders',
    icon: <Bike className="w-8 h-8" />,
  },
];

const RoleRegistration = () => {
  const { user, userRole, changeRole, refreshRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<Role>(userRole || 'customer');
  const [loading, setLoading] = useState(false);
  
  // Business type for restaurant role
  const [businessType, setBusinessType] = useState<BusinessType>('restaurant');
  
  // Image upload refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const { uploading: logoUploading, uploadImage: uploadLogo } = useImageUpload({ folder: 'restaurants/logos' });
  const { uploading: bannerUploading, uploadImage: uploadBanner } = useImageUpload({ folder: 'restaurants/covers' });
  
  // Common fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  // Restaurant/HomeChef fields
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [cuisineType, setCuisineType] = useState('');
  const [businessLicense, setBusinessLicense] = useState('');
  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('23:00');
  const [deliveryRadius, setDeliveryRadius] = useState('5');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  
  // Rider fields
  const [vehicleType, setVehicleType] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [cnic, setCnic] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadLogo(file);
    if (url) {
      setLogoUrl(url);
      toast({ title: 'Logo uploaded!' });
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadBanner(file);
    if (url) {
      setBannerUrl(url);
      toast({ title: 'Banner uploaded!' });
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      // 1) Change role via RPC (secure backend function)
      const { error: roleError } = await changeRole(selectedRole);
      if (roleError) throw roleError;

      // 2) Update profile with role-specific info
      const profileUpdate: Record<string, any> = {
        name: selectedRole === 'restaurant' ? ownerName : name,
        phone,
        address,
        role: selectedRole,
        profile_complete: true,
        updated_at: new Date().toISOString(),
      };

      if (selectedRole === 'restaurant') {
        profileUpdate.restaurant_name = businessName;
        profileUpdate.cuisine_type = cuisineType;
        profileUpdate.business_license = businessLicense;
        profileUpdate.operating_hours = `${openingTime} - ${closingTime}`;
      }

      if (selectedRole === 'driver') {
        profileUpdate.vehicle_type = vehicleType;
        profileUpdate.license_plate = licensePlate;
        profileUpdate.cnic = cnic;
        profileUpdate.bank_account = bankAccount;
        profileUpdate.emergency_contact = emergencyContact;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // 3) If restaurant/homechef, create restaurant record
      if (selectedRole === 'restaurant') {
        const { error: restaurantError } = await supabase
          .from('restaurants')
          .insert({
            owner_id: user.id,
            name: businessName,
            description: `${businessType === 'homechef' ? 'Home kitchen' : 'Restaurant'} serving ${cuisineType}`,
            category: cuisineType,
            business_type: businessType,
            delivery_radius: parseFloat(deliveryRadius) || 5,
            opening_hours: `${openingTime} - ${closingTime}`,
            address: address,
            logo: logoUrl || null,
            image: bannerUrl || null,
            is_active: true,
            delivery_fee: 50,
            delivery_time: '30-45 min',
            tags: [cuisineType],
          });

        if (restaurantError && restaurantError.code !== '23505') throw restaurantError;
      }

      // 4) If driver, create driver record
      if (selectedRole === 'driver') {
        const { error: driverError } = await supabase
          .from('drivers')
          .insert({
            user_id: user.id,
            vehicle_type: vehicleType,
            license_plate: licensePlate,
            status: 'offline',
          });

        // Ignore duplicate error
        if (driverError && driverError.code !== '23505') throw driverError;
      }

      // 5) Refresh role in context
      await refreshRole();

      toast({
        title: 'Registration Complete! ✅',
        description: `Your ${selectedRole === 'restaurant' ? businessType : selectedRole} account has been set up successfully.`,
      });

      // 6) Redirect to role-specific dashboard
      const dashboardPath = getRoleDashboardPath(selectedRole);
      navigate(dashboardPath, { replace: true });
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete registration',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSelection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="text-2xl font-bold text-foreground mb-2">Choose Your Role</h2>
      <p className="text-muted-foreground mb-6">How would you like to use FoodieHub?</p>
      
      <div className="space-y-4">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => setSelectedRole(role.id)}
            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left ${
              selectedRole === role.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className={`p-3 rounded-xl ${
              selectedRole === role.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              {role.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{role.title}</h3>
              <p className="text-sm text-muted-foreground">{role.description}</p>
            </div>
            {selectedRole === role.id && (
              <CheckCircle className="w-5 h-5 text-primary" />
            )}
          </button>
        ))}
      </div>

      <Button onClick={() => setStep(2)} className="w-full mt-6">
        Continue
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );

  const renderBusinessTypeSelection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="text-2xl font-bold text-foreground mb-2">Business Type</h2>
      <p className="text-muted-foreground mb-6">Select your business type</p>

      <RadioGroup value={businessType} onValueChange={(v) => setBusinessType(v as BusinessType)}>
        <div className="space-y-4">
          <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            businessType === 'restaurant' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}>
            <RadioGroupItem value="restaurant" />
            <div className="p-3 rounded-xl bg-primary/10">
              <Store className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Restaurant Owner</h3>
              <p className="text-sm text-muted-foreground">Commercial restaurant or food business</p>
            </div>
          </label>

          <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            businessType === 'homechef' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}>
            <RadioGroupItem value="homechef" />
            <div className="p-3 rounded-xl bg-primary/10">
              <ChefHat className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">HomeChef</h3>
              <p className="text-sm text-muted-foreground">Home-based kitchen or cooking service</p>
            </div>
          </label>
        </div>
      </RadioGroup>

      <div className="bg-primary/10 rounded-xl p-4 mt-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Section Visibility</p>
          <p className="text-sm text-muted-foreground">
            {businessType === 'restaurant' 
              ? 'Your business will appear ONLY in the Restaurants section'
              : 'Your business will appear ONLY in the HomeChefs section'}
          </p>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={() => setStep(3)} className="flex-1">
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );

  const renderCommonFields = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="text-2xl font-bold text-foreground mb-2">Basic Information</h2>
      <p className="text-muted-foreground mb-6">Tell us about yourself</p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10"
              placeholder="Enter your full name"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-10"
              placeholder="03XX-XXXXXXX"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address in Karachi *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="pl-10 min-h-[80px]"
              placeholder="Enter your complete address"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={() => selectedRole === 'customer' ? handleSubmit() : setStep(selectedRole === 'restaurant' ? 2 : 4)} 
          className="flex-1"
          disabled={!name || !phone || !address}
        >
          {selectedRole === 'customer' ? 'Complete' : 'Continue'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );

  const renderRestaurantFields = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="text-2xl font-bold text-foreground mb-2">
        {businessType === 'homechef' ? 'HomeChef' : 'Restaurant'} Details
      </h2>
      <p className="text-muted-foreground mb-6">Tell us about your business</p>

      <div className="space-y-4">
        {/* Logo & Banner Upload */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Logo</Label>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <div
              onClick={() => logoInputRef.current?.click()}
              className={`h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:border-primary ${
                logoUrl ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              {logoUploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              ) : logoUrl ? (
                <div className="relative w-full h-full">
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setLogoUrl(''); }}
                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <>
                  <Camera className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Upload Logo</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Banner Image</Label>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              className="hidden"
            />
            <div
              onClick={() => bannerInputRef.current?.click()}
              className={`h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:border-primary ${
                bannerUrl ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              {bannerUploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              ) : bannerUrl ? (
                <div className="relative w-full h-full">
                  <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover rounded-lg" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setBannerUrl(''); }}
                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Upload Banner</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name *</Label>
          <div className="relative">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="pl-10"
              placeholder={businessType === 'homechef' ? 'e.g., Ammi Ki Rasoi' : 'e.g., Karachi BBQ House'}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ownerName">Owner Name *</Label>
            <Input
              id="ownerName"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cuisineType">Cuisine Type *</Label>
          <Input
            id="cuisineType"
            value={cuisineType}
            onChange={(e) => setCuisineType(e.target.value)}
            placeholder="e.g., Pakistani, Chinese, Fast Food, Biryani"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Opening Time *</Label>
            <Input
              type="time"
              value={openingTime}
              onChange={(e) => setOpeningTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Closing Time *</Label>
            <Input
              type="time"
              value={closingTime}
              onChange={(e) => setClosingTime(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deliveryRadius">Delivery Radius (km) *</Label>
          <Input
            id="deliveryRadius"
            type="number"
            value={deliveryRadius}
            onChange={(e) => setDeliveryRadius(e.target.value)}
            placeholder="5"
            min="1"
            max="50"
          />
        </div>

        {businessType === 'restaurant' && (
          <div className="space-y-2">
            <Label htmlFor="businessLicense">Business License Number</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="businessLicense"
                value={businessLicense}
                onChange={(e) => setBusinessLicense(e.target.value)}
                className="pl-10"
                placeholder="Enter license number (optional)"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={handleSubmit} 
          className="flex-1"
          disabled={loading || !businessName || !ownerName || !cuisineType || !phone || !address}
        >
          {loading ? 'Creating...' : 'Complete Registration'}
        </Button>
      </div>
    </motion.div>
  );

  const renderRiderFields = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="text-2xl font-bold text-foreground mb-2">Rider Details</h2>
      <p className="text-muted-foreground mb-6">Information required for delivery</p>

      <div className="bg-primary/10 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-foreground">
          Your CNIC and bank details are required for identity verification and payment processing.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="vehicleType">Vehicle Type *</Label>
          <select
            id="vehicleType"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="w-full p-3 rounded-xl border border-border bg-background"
            required
          >
            <option value="">Select vehicle type</option>
            <option value="motorcycle">Motorcycle</option>
            <option value="bicycle">Bicycle</option>
            <option value="car">Car</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="licensePlate">License Plate Number</Label>
          <Input
            id="licensePlate"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            placeholder="e.g., ABC-1234"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cnic">CNIC Number *</Label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="cnic"
              value={cnic}
              onChange={(e) => setCnic(e.target.value)}
              className="pl-10"
              placeholder="XXXXX-XXXXXXX-X"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bankAccount">Bank Account / JazzCash / EasyPaisa *</Label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="bankAccount"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              className="pl-10"
              placeholder="Account number for payments"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="emergencyContact">Emergency Contact *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="emergencyContact"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              className="pl-10"
              placeholder="Emergency contact number"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={() => setStep(selectedRole === 'driver' ? 2 : 3)} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={handleSubmit} 
          className="flex-1"
          disabled={loading || !vehicleType || !cnic || !bankAccount || !emergencyContact}
        >
          {loading ? 'Creating...' : 'Complete Registration'}
        </Button>
      </div>
    </motion.div>
  );

  // Determine total steps based on role
  const getTotalSteps = () => {
    if (selectedRole === 'customer') return 2;
    if (selectedRole === 'restaurant') return 3;
    return 4; // driver
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-background">
      <div className="container mx-auto px-4 max-w-lg">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: getTotalSteps() }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s <= step ? 'bg-primary w-8' : 'bg-muted w-2'
              }`}
            />
          ))}
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border">
          {step === 1 && renderRoleSelection()}
          {step === 2 && selectedRole === 'customer' && renderCommonFields()}
          {step === 2 && selectedRole === 'restaurant' && renderBusinessTypeSelection()}
          {step === 2 && selectedRole === 'driver' && renderCommonFields()}
          {step === 3 && selectedRole === 'restaurant' && renderRestaurantFields()}
          {step === 3 && selectedRole === 'driver' && renderCommonFields()}
          {step === 4 && selectedRole === 'driver' && renderRiderFields()}
        </div>
      </div>
    </div>
  );
};

export default RoleRegistration;
