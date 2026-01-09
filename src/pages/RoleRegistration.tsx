import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Store, Bike, ArrowRight, ArrowLeft, Phone, MapPin, FileText, Clock, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getRoleDashboardPath } from '@/components/RoleBasedRedirect';
import type { Database } from '@/integrations/supabase/types';

type Role = Database['public']['Enums']['app_role'];

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
    title: 'Restaurant Owner',
    description: 'List your restaurant and manage orders',
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
  
  // Common fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  // Restaurant fields
  const [restaurantName, setRestaurantName] = useState('');
  const [cuisineType, setCuisineType] = useState('');
  const [businessLicense, setBusinessLicense] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  
  // Rider fields
  const [vehicleType, setVehicleType] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [cnic, setCnic] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

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
        name,
        phone,
        address,
        role: selectedRole,
        profile_complete: true,
        updated_at: new Date().toISOString(),
      };

      if (selectedRole === 'restaurant') {
        profileUpdate.restaurant_name = restaurantName;
        profileUpdate.cuisine_type = cuisineType;
        profileUpdate.business_license = businessLicense;
        profileUpdate.operating_hours = operatingHours;
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

      // 3) If driver, create driver record
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

      // 4) Refresh role in context
      await refreshRole();

      toast({
        title: 'Registration Complete! ✅',
        description: `Your ${selectedRole} account has been set up successfully.`,
      });

      // 5) Redirect to role-specific dashboard
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
          onClick={() => selectedRole === 'customer' ? handleSubmit() : setStep(3)} 
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
      <h2 className="text-2xl font-bold text-foreground mb-2">Restaurant Details</h2>
      <p className="text-muted-foreground mb-6">Tell us about your restaurant</p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="restaurantName">Restaurant Name *</Label>
          <div className="relative">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="restaurantName"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="pl-10"
              placeholder="Enter restaurant name"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cuisineType">Cuisine Type *</Label>
          <Input
            id="cuisineType"
            value={cuisineType}
            onChange={(e) => setCuisineType(e.target.value)}
            placeholder="e.g., Pakistani, Chinese, Fast Food"
            required
          />
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="operatingHours">Operating Hours</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="operatingHours"
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
              className="pl-10"
              placeholder="e.g., 10:00 AM - 11:00 PM"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={handleSubmit} 
          className="flex-1"
          disabled={loading || !restaurantName || !cuisineType}
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
        <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
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

  return (
    <div className="min-h-screen pt-24 pb-12 bg-background">
      <div className="container mx-auto px-4 max-w-lg">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s <= step ? 'bg-primary w-8' : 'bg-muted w-2'
              } ${s === 3 && selectedRole === 'customer' ? 'hidden' : ''}`}
            />
          ))}
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border">
          {step === 1 && renderRoleSelection()}
          {step === 2 && renderCommonFields()}
          {step === 3 && selectedRole === 'restaurant' && renderRestaurantFields()}
          {step === 3 && selectedRole === 'driver' && renderRiderFields()}
        </div>
      </div>
    </div>
  );
};

export default RoleRegistration;
