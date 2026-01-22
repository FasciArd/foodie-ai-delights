import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  ChefHat,
  Wallet,
  Crown,
  Settings,
  Store,
  Bike,
  Package,
  Home,
  UtensilsCrossed,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { getRoleDashboardPath } from "@/components/RoleBasedRedirect";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  TrendingUp,
  ArrowDownToLine,
  FileText,
  Lock,
  CheckCircle,
  Bell as BellIcon,
  AlertTriangle,
} from "lucide-react";
import { formatPKR } from "@/lib/currency";

// NotificationsList component
const NotificationsList = ({ onRead }: { onRead: () => void }) => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const loadNotifications = () => {
      const stored = localStorage.getItem("foodie-notifications");
      if (stored) {
        try {
          setNotifications(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to load notifications:", e);
        }
      }
    };

    loadNotifications();
    window.addEventListener("notifications-updated", loadNotifications);
    return () =>
      window.removeEventListener("notifications-updated", loadNotifications);
  }, []);

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
    setNotifications(updated);
    localStorage.setItem("foodie-notifications", JSON.stringify(updated));
    window.dispatchEvent(new Event("notifications-updated"));
    onRead();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "earnings":
        return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case "withdrawal":
        return <ArrowDownToLine className="w-4 h-4 text-blue-500" />;
      case "tax":
        return <FileText className="w-4 h-4 text-amber-500" />;
      case "lock":
        return <Lock className="w-4 h-4 text-destructive" />;
      case "system":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default:
        return <BellIcon className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const formatTimestamp = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (notifications.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        <BellIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
        <p>No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="py-1">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          onClick={() => !notification.read && markAsRead(notification.id)}
          className={`px-3 py-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0 transition-colors ${
            !notification.read ? "bg-primary/5" : ""
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                !notification.read ? "bg-primary/10" : "bg-muted"
              }`}
            >
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p
                  className={`text-sm font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {notification.title}
                </p>
                {!notification.read && (
                  <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {formatTimestamp(notification.timestamp)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const Navbar = () => {
  const { totalItems } = useCart();
  const { user, userRole, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Listen to notification events from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem("foodie-notifications");
      if (stored) {
        try {
          const notifications = JSON.parse(stored);
          const unread = notifications.filter((n: any) => !n.read).length;
          setUnreadCount(unread);
        } catch (e) {
          console.error("Failed to parse notifications:", e);
        }
      }
    };

    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("notifications-updated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("notifications-updated", handleStorageChange);
    };
  }, []);

  // Fetch user profile name
  useEffect(() => {
    const fetchUserName = async () => {
      if (!user?.id) {
        setUserName(null);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", user.id)
        .single();

      setUserName(data?.name || null);
    };

    fetchUserName();
  }, [user?.id]);

  // Role-based navigation links
  const getNavLinks = (): {
    to: string;
    label: string;
    icon?: React.ReactNode;
  }[] => {
    // Restaurant owners
    if (userRole === "restaurant") {
      return [
        {
          to: "/restaurant-dashboard",
          label: "My Restaurant",
          icon: <Store className="w-4 h-4" />,
        },
        {
          to: "/restaurants",
          label: "Browse Restaurants",
          icon: <UtensilsCrossed className="w-4 h-4" />,
        },
      ];
    }

    // Drivers
    if (userRole === "driver") {
      return [
        {
          to: "/delivery-dashboard",
          label: "Deliveries",
          icon: <Bike className="w-4 h-4" />,
        },
      ];
    }

    // Admins
    if (userRole === "admin") {
      return [
        { to: "/admin", label: "Admin Dashboard" },
        {
          to: "/restaurants",
          label: "Restaurants",
          icon: <UtensilsCrossed className="w-4 h-4" />,
        },
      ];
    }

    // Customers (default)
    return [
      { to: "/", label: "Home", icon: <Home className="w-4 h-4" /> },
      {
        to: "/restaurants",
        label: "Restaurants",
        icon: <UtensilsCrossed className="w-4 h-4" />,
      },
      {
        to: "/homechefs",
        label: "HomeChefs",
        icon: <ChefHat className="w-4 h-4" />,
      },
      { to: "/orders", label: "Orders", icon: <Package className="w-4 h-4" /> },
    ];
  };

  const navLinks = getNavLinks();
  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Only show cart for customers
  const showCart = !userRole || userRole === "customer";

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link
            to={getRoleDashboardPath(userRole)}
            className="flex items-center gap-2 group"
          >
            <motion.div
              whileHover={{ rotate: 15 }}
              className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center"
            >
              <span className="text-2xl">🍔</span>
            </motion.div>
            <span className="text-xl sm:text-2xl font-bold text-foreground">
              Foodie<span className="text-primary">Hub</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative font-medium transition-colors duration-200 flex items-center gap-1 ${
                  isActive(link.to)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.icon}
                {link.label}
                {isActive(link.to) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart - only for customers */}
            {showCart && (
              <Link to="/cart">
                <Button variant="icon" size="icon" className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </Button>
              </Link>
            )}

            {/* Notifications */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="icon"
                    size="icon"
                    className="relative hidden sm:flex"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold"
                      >
                        {unreadCount}
                      </motion.span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-medium">Notifications</p>
                  </div>
                  <ScrollArea className="h-[300px]">
                    <NotificationsList
                      onRead={() => {
                        const stored = localStorage.getItem(
                          "foodie-notifications",
                        );
                        if (stored) {
                          const notifications = JSON.parse(stored);
                          const unread = notifications.filter(
                            (n: any) => !n.read,
                          ).length;
                          setUnreadCount(unread);
                        }
                      }}
                    />
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="icon" size="icon" className="hidden sm:flex">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">
                      {userName || user.user_metadata?.name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {userRole || "Customer"}
                    </p>
                  </div>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <Settings className="w-4 h-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>

                  {/* Role-specific menu items */}
                  {userRole === "restaurant" && (
                    <DropdownMenuItem
                      onClick={() => navigate("/restaurant-dashboard")}
                    >
                      <Store className="w-4 h-4 mr-2" />
                      Restaurant Dashboard
                    </DropdownMenuItem>
                  )}

                  {userRole === "driver" && (
                    <DropdownMenuItem
                      onClick={() => navigate("/delivery-dashboard")}
                    >
                      <Bike className="w-4 h-4 mr-2" />
                      Delivery Dashboard
                    </DropdownMenuItem>
                  )}

                  {userRole === "customer" && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/orders")}>
                        <Package className="w-4 h-4 mr-2" />
                        My Orders
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/wallet")}>
                        <Wallet className="w-4 h-4 mr-2" />
                        My Wallet
                      </DropdownMenuItem>
                    </>
                  )}

                  {/* Image Enhancer moved to restaurant dashboard food upload only */}

                  {userRole === "customer" && (
                    <DropdownMenuItem
                      onClick={() => navigate("/pro-membership")}
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Pro Membership
                    </DropdownMenuItem>
                  )}

                  {userRole === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        Admin Dashboard
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm" className="hidden sm:flex">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 py-4"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center gap-2 ${
                    isActive(link.to)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-card"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}

              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-3 rounded-xl font-medium text-muted-foreground hover:bg-card"
                  >
                    My Profile
                  </Link>
                  {userRole === "customer" && (
                    <Link
                      to="/wallet"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-4 py-3 rounded-xl font-medium text-muted-foreground hover:bg-card"
                    >
                      My Wallet
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="px-4 py-3 rounded-xl font-medium text-destructive hover:bg-card text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 rounded-xl font-medium bg-primary text-primary-foreground"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
