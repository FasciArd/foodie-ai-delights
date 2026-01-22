import React, { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Home } from "lucide-react";

interface LiveTrackingMapProps {
  orderId: string;
  deliveryAddress: string;
  restaurantLocation?: { lat: number; lng: number };
  deliveryLocation?: { lat: number; lng: number };
  driverLocation?: { lat: number; lng: number };
}

// Karachi coordinates
const KARACHI_CENTER = { lat: 24.8607, lng: 67.0011 };
const KARACHI_AREAS = {
  clifton: { lat: 24.812, lng: 67.0308 },
  dha: { lat: 24.8039, lng: 67.0543 },
  gulshan: { lat: 24.918, lng: 67.0916 },
  saddar: { lat: 24.8526, lng: 67.0177 },
  korangi: { lat: 24.8341, lng: 67.1335 },
  nazimabad: { lat: 24.9129, lng: 67.0323 },
  north_nazimabad: { lat: 24.9419, lng: 67.0548 },
  malir: { lat: 24.8934, lng: 67.1889 },
  scheme_33: { lat: 24.9073, lng: 67.1189 },
  tariq_road: { lat: 24.8677, lng: 67.0625 },
};

const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  orderId,
  deliveryAddress,
  restaurantLocation,
  deliveryLocation,
  driverLocation: initialDriverLocation,
}) => {
  const [driverLocation, setDriverLocation] = useState(initialDriverLocation);

  // Simulate driver movement for demo
  useEffect(() => {
    if (!restaurantLocation || !deliveryLocation) return;

    // Simulate rider movement from restaurant to delivery
    const simulateMovement = () => {
      const startLat = restaurantLocation.lat;
      const startLng = restaurantLocation.lng;
      const endLat = deliveryLocation.lat;
      const endLng = deliveryLocation.lng;

      let progress = 0;
      const interval = setInterval(() => {
        progress += 0.02;
        if (progress >= 1) {
          clearInterval(interval);
          return;
        }

        const currentLat = startLat + (endLat - startLat) * progress;
        const currentLng = startLng + (endLng - startLng) * progress;

        setDriverLocation({ lat: currentLat, lng: currentLng });
      }, 2000);

      return () => clearInterval(interval);
    };

    const cleanup = simulateMovement();
    return cleanup;
  }, [restaurantLocation, deliveryLocation]);

  const restaurantLoc = restaurantLocation || KARACHI_AREAS.clifton;
  const deliveryLoc = deliveryLocation || KARACHI_AREAS.dha;
  const driverLoc = driverLocation || {
    lat: (restaurantLoc.lat + deliveryLoc.lat) / 2,
    lng: (restaurantLoc.lng + deliveryLoc.lng) / 2,
  };

  // Build Google Maps Embed URL with markers
  const mapUrl = `https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&origin=${restaurantLoc.lat},${restaurantLoc.lng}&destination=${deliveryLoc.lat},${deliveryLoc.lng}&mode=driving&zoom=13&language=en`;

  return (
    <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden shadow-md">
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0"
      />

      {/* Legend Overlay */}
      <div className="absolute bottom-3 left-3 bg-background/95 backdrop-blur-sm rounded-lg px-3 py-2 text-sm shadow-lg border border-border">
        <div className="flex items-center gap-2 mb-1">
          <Home className="w-3 h-3 text-green-500" />
          <span className="text-foreground text-xs">Restaurant</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <Navigation className="w-3 h-3 text-orange-500" />
          <span className="text-foreground text-xs">Rider</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-3 h-3 text-red-500" />
          <span className="text-foreground text-xs">Your Location</span>
        </div>
      </div>

      {/* Live Tracking Badge */}
      <div className="absolute top-3 right-3 bg-primary/95 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-lg flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        Live Tracking
      </div>
    </div>
  );
};

export default LiveTrackingMap;
