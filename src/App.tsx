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
              <Route path="/" element={<Home />} />
              <Route path="/restaurants" element={<Restaurants />} />
              <Route path="/restaurant/:id" element={<RestaurantDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/order/:id" element={<OrderTracking />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/pro-membership" element={<ProMembership />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/register" element={<RoleRegistration />} />
              <Route path="/homechefs" element={<HomeChefs />} />
              <Route path="/image-enhancer" element={<ImageEnhancer />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <AIChatbot />
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
