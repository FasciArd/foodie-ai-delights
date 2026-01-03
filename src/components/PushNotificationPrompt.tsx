import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/hooks/useAuth';

export default function PushNotificationPrompt() {
  const { user } = useAuth();
  const { permission, supported, requestPermission } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user already dismissed
    if (localStorage.getItem('push_prompt_dismissed')) {
      setDismissed(true);
    }
  }, []);

  const handleEnable = async () => {
    await requestPermission();
    setDismissed(true);
  };

  const handleDismiss = () => {
    localStorage.setItem('push_prompt_dismissed', 'true');
    setDismissed(true);
  };

  // Don't show if: not supported, already granted/denied, not logged in, or dismissed
  if (!supported || permission !== 'default' || !user || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-card border border-border rounded-xl shadow-lg p-4 z-40">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground mb-1">Enable Notifications</p>
          <p className="text-sm text-muted-foreground mb-3">
            Get real-time updates on your orders and exclusive promo offers.
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleEnable}>
              Enable
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
