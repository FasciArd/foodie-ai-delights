import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import OrderNotification from "@/components/OrderNotification";
import AIChatbot from "@/components/AIChatbot";
import PushNotificationPrompt from "@/components/PushNotificationPrompt";
import RoleGuard from "@/components/RoleGuard";
import Home from "./pages/Home";
import Restaurants from "./pages/Restaurants";
import RestaurantDetail from "./pages/RestaurantDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderTracking from "./pages/OrderTracking";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Wallet from "./pages/Wallet";
import ProMembership from "./pages/ProMembership";
import Profile from "./pages/Profile";
import RoleRegistration from "./pages/RoleRegistration";
import HomeChefs from "./pages/HomeChefs";
// ImageEnhancer removed - only available inside food upload modal for restaurant owners
import RestaurantDashboard from "./pages/RestaurantDashboard";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import EarningsDashboard from "./pages/EarningsDashboard";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Careers from "./pages/Careers";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Press from "./pages/Press";
import PressRelease from "./pages/PressRelease";
import Help from "./pages/Help";
import Safety from "./pages/Safety";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import Partner from "./pages/Partner";
import Driver from "./pages/Driver";
import Affiliate from "./pages/Affiliate";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navbar />
            <OrderNotification />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/restaurants" element={<Restaurants />} />
              <Route path="/restaurant/:id" element={<RestaurantDetail />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/homechefs" element={<HomeChefs />} />
              <Route path="/homechef/:id" element={<RestaurantDetail />} />
              <Route path="/pro-membership" element={<ProMembership />} />
              
              {/* Footer pages */}
              <Route path="/about" element={<About />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/press" element={<Press />} />
              <Route path="/press/:id" element={<PressRelease />} />
              <Route path="/help" element={<Help />} />
              <Route path="/safety" element={<Safety />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/partner" element={<Partner />} />
              <Route path="/driver" element={<Driver />} />
              <Route path="/affiliate" element={<Affiliate />} />
              
              {/* Customer-only routes */}
              <Route path="/cart" element={
                <RoleGuard allowedRoles={['customer']} fallbackPath="/">
                  <Cart />
                </RoleGuard>
              } />
              <Route path="/checkout" element={
                <RoleGuard allowedRoles={['customer']} fallbackPath="/">
                  <Checkout />
                </RoleGuard>
              } />
              <Route path="/orders" element={
                <RoleGuard allowedRoles={['customer']} fallbackPath="/">
                  <Orders />
                </RoleGuard>
              } />
              <Route path="/order/:id" element={
                <RoleGuard allowedRoles={['customer']} fallbackPath="/">
                  <OrderTracking />
                </RoleGuard>
              } />
              <Route path="/wallet" element={
                <RoleGuard allowedRoles={['customer']} fallbackPath="/">
                  <Wallet />
                </RoleGuard>
              } />
              
              {/* Restaurant owner routes */}
              <Route path="/restaurant-dashboard" element={
                <RoleGuard allowedRoles={['restaurant', 'admin']} fallbackPath="/">
                  <RestaurantDashboard />
                </RoleGuard>
              } />
              
              {/* Driver routes */}
              <Route path="/delivery-dashboard" element={
                <RoleGuard allowedRoles={['driver', 'admin']} fallbackPath="/">
                  <DeliveryDashboard />
                </RoleGuard>
              } />
              
              {/* Earnings routes for restaurant owners and drivers */}
              <Route path="/earnings" element={
                <RoleGuard allowedRoles={['restaurant', 'driver', 'admin']} fallbackPath="/">
                  <EarningsDashboard />
                </RoleGuard>
              } />
              
              {/* Admin routes */}
              <Route path="/admin" element={
                <RoleGuard allowedRoles={['admin']} fallbackPath="/">
                  <Admin />
                </RoleGuard>
              } />
              
              {/* Authenticated routes (any role) */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/register" element={<RoleRegistration />} />
              <Route path="/role-registration" element={<RoleRegistration />} />
              {/* Image Enhancer route removed - feature only available in food upload modal for owners */}
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <AIChatbot />
            <PushNotificationPrompt />
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
