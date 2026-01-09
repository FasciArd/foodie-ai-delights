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
import ImageEnhancer from "./pages/ImageEnhancer";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import NotFound from "./pages/NotFound";

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
              <Route path="/pro-membership" element={<ProMembership />} />
              
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
              <Route path="/image-enhancer" element={<ImageEnhancer />} />
              
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
