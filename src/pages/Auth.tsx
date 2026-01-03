import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Phone, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

type AuthMethod = 'email' | 'phone';
type AuthStep = 'method' | 'credentials' | 'otp';

const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .refine((v) => v.toLowerCase().endsWith('@gmail.com'), 'Only Gmail addresses are allowed');
const phoneSchema = z.string()
  .regex(/^\+?[0-9]{10,14}$/, 'Please enter a valid phone number (e.g., +923001234567)');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [authStep, setAuthStep] = useState<AuthStep>('method');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; phone?: string; password?: string }>({});
  
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Show auth restriction errors (set by AuthProvider)
  useEffect(() => {
    const msg = localStorage.getItem('auth_error');
    if (!msg) return;

    toast({
      title: 'Sign-in blocked',
      description: msg,
      variant: 'destructive',
    });
    localStorage.removeItem('auth_error');
  }, [toast]);

  const validateEmail = (value: string) => {
    const result = emailSchema.safeParse(value);
    if (!result.success) {
      setErrors(prev => ({ ...prev, email: result.error.errors[0].message }));
      return false;
    }
    setErrors(prev => ({ ...prev, email: undefined }));
    return true;
  };

  const validatePhone = (value: string) => {
    const result = phoneSchema.safeParse(value);
    if (!result.success) {
      setErrors(prev => ({ ...prev, phone: result.error.errors[0].message }));
      return false;
    }
    setErrors(prev => ({ ...prev, phone: undefined }));
    return true;
  };

  const validatePassword = (value: string) => {
    const result = passwordSchema.safeParse(value);
    if (!result.success) {
      setErrors(prev => ({ ...prev, password: result.error.errors[0].message }));
      return false;
    }
    setErrors(prev => ({ ...prev, password: undefined }));
    return true;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email) || !validatePassword(password)) return;
    
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast({ title: 'Welcome back!', description: 'You have successfully signed in.' });
        navigate('/');
      } else {
        const { error } = await signUp(email, password, name);
        if (error) throw error;
        toast({ title: 'Account created!', description: 'Welcome to FoodieHub.' });
        navigate('/');
      }
    } catch (error: any) {
      let errorMessage = error.message || 'Something went wrong';
      
      // Handle specific Supabase errors
      if (error.message?.includes('User already registered')) {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Incorrect email or password. Please try again.';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhone(phone)) return;
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.startsWith('+') ? phone : `+92${phone.replace(/^0/, '')}`,
      });
      
      if (error) throw error;
      
      toast({ 
        title: 'OTP Sent!', 
        description: 'Please check your phone for the verification code.' 
      });
      setAuthStep('otp');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send OTP',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter the complete 6-digit code',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);

    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+92${phone.replace(/^0/, '')}`;
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms',
      });
      
      if (error) throw error;
      
      toast({ title: 'Verified!', description: 'You have successfully signed in.' });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Invalid OTP. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign in with Google. Please ensure Google sign-in is enabled.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetToMethodSelection = () => {
    setAuthStep('method');
    setOtp('');
    setErrors({});
  };

  const renderMethodSelection = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-4"
    >
      <Button
        type="button"
        variant="outline"
        className="w-full h-14 justify-start gap-3 text-left"
        onClick={() => { setAuthMethod('email'); setAuthStep('credentials'); }}
      >
        <Mail className="w-5 h-5 text-primary" />
        <div>
          <p className="font-medium">Continue with Email</p>
          <p className="text-xs text-muted-foreground">Use your email and password</p>
        </div>
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full h-14 justify-start gap-3 text-left"
        onClick={() => { setAuthMethod('phone'); setAuthStep('credentials'); }}
      >
        <Phone className="w-5 h-5 text-primary" />
        <div>
          <p className="font-medium">Continue with Phone</p>
          <p className="text-xs text-muted-foreground">Get OTP on your mobile number</p>
        </div>
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full h-12"
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </Button>
    </motion.div>
  );

  const renderEmailCredentials = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <button
        type="button"
        onClick={resetToMethodSelection}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      <form onSubmit={handleEmailSubmit} className="space-y-4">
        {!isLogin && (
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                required={!isLogin}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@gmail.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); validateEmail(e.target.value); }}
              className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
              required
            />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); validatePassword(e.target.value); }}
              className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </motion.div>
  );

  const renderPhoneCredentials = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <button
        type="button"
        onClick={resetToMethodSelection}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      <form onSubmit={handlePhoneSendOTP} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="+923001234567"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); validatePhone(e.target.value); }}
              className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
              required
            />
          </div>
          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          <p className="text-xs text-muted-foreground">
            Enter your Pakistani mobile number (e.g., +923001234567 or 03001234567)
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Sending OTP...' : 'Send OTP'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </motion.div>
  );

  const renderOTPVerification = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="text-center"
    >
      <button
        type="button"
        onClick={() => setAuthStep('credentials')}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      <div className="mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Enter Verification Code</h2>
        <p className="text-sm text-muted-foreground">
          We've sent a 6-digit code to<br />
          <span className="font-medium text-foreground">{phone}</span>
        </p>
      </div>

      <div className="flex justify-center mb-6">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={setOtp}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Button 
        onClick={handleVerifyOTP} 
        className="w-full" 
        disabled={loading || otp.length !== 6}
      >
        {loading ? 'Verifying...' : 'Verify & Continue'}
      </Button>

      <button
        type="button"
        onClick={handlePhoneSendOTP}
        disabled={loading}
        className="mt-4 text-sm text-primary hover:underline disabled:opacity-50"
      >
        Didn't receive code? Resend
      </button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {authStep === 'otp' 
                ? 'Verify Your Phone' 
                : isLogin 
                  ? 'Welcome Back' 
                  : 'Create Account'}
            </h1>
            <p className="text-muted-foreground">
              {authStep === 'otp'
                ? 'Enter the OTP sent to your phone'
                : isLogin
                  ? 'Sign in to continue ordering delicious food'
                  : 'Join FoodieHub and start ordering today'}
            </p>
          </div>

          {authStep === 'method' && renderMethodSelection()}
          {authStep === 'credentials' && authMethod === 'email' && renderEmailCredentials()}
          {authStep === 'credentials' && authMethod === 'phone' && renderPhoneCredentials()}
          {authStep === 'otp' && renderOTPVerification()}

          {authStep !== 'otp' && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); resetToMethodSelection(); }}
                className="text-primary font-medium hover:underline"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          )}
        </motion.div>
      </div>

      {/* Right side - Image/Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 to-primary/5 items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <div className="text-6xl mb-6">🍔</div>
          <h2 className="text-4xl font-bold text-foreground mb-4">FoodieHub</h2>
          <p className="text-xl text-muted-foreground max-w-md">
            Your favorite restaurants, delivered fast to your doorstep in Karachi
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Restaurants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">30 min</div>
              <div className="text-sm text-muted-foreground">Avg Delivery</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
