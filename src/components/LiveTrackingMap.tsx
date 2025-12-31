import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';

interface LiveTrackingMapProps {
  orderId: string;
  deliveryAddress: string;
  restaurantLocation?: { lat: number; lng: number };
  driverLocation?: { lat: number; lng: number };
}

// Karachi coordinates
const KARACHI_CENTER = { lat: 24.8607, lng: 67.0011 };
const KARACHI_AREAS = {
  clifton: { lat: 24.8120, lng: 67.0308 },
  dha: { lat: 24.8039, lng: 67.0543 },
  gulshan: { lat: 24.9180, lng: 67.0916 },
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
  driverLocation: initialDriverLocation,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const driverMarker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [driverLocation, setDriverLocation] = useState(initialDriverLocation);
  const [error, setError] = useState<string | null>(null);

  // Fetch Mapbox token from edge function
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        if (data?.token) {
          setMapboxToken(data.token);
        } else {
          setError('Mapbox token not configured');
        }
      } catch (err) {
        console.error('Failed to fetch Mapbox token:', err);
        setError('Failed to load map');
      }
    };
    fetchToken();
  }, []);

  // Simulate driver movement for demo
  useEffect(() => {
    if (!restaurantLocation) return;

    // Simulate rider movement from restaurant to delivery
    const simulateMovement = () => {
      const startLat = restaurantLocation.lat;
      const startLng = restaurantLocation.lng;
      const endLat = KARACHI_CENTER.lat + (Math.random() - 0.5) * 0.02;
      const endLng = KARACHI_CENTER.lng + (Math.random() - 0.5) * 0.02;

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
  }, [restaurantLocation]);

  // Update driver marker position
  useEffect(() => {
    if (!map.current || !driverLocation) return;

    if (driverMarker.current) {
      driverMarker.current.setLngLat([driverLocation.lng, driverLocation.lat]);
    }
  }, [driverLocation]);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    // Initialize map centered on Karachi
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [KARACHI_CENTER.lng, KARACHI_CENTER.lat],
      zoom: 13,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add restaurant marker (green)
    const restaurantLoc = restaurantLocation || KARACHI_AREAS.clifton;
    new mapboxgl.Marker({ color: '#22c55e' })
      .setLngLat([restaurantLoc.lng, restaurantLoc.lat])
      .setPopup(new mapboxgl.Popup().setHTML('<strong>Restaurant</strong>'))
      .addTo(map.current);

    // Add delivery location marker (red)
    const deliveryLoc = KARACHI_AREAS.dha;
    new mapboxgl.Marker({ color: '#ef4444' })
      .setLngLat([deliveryLoc.lng, deliveryLoc.lat])
      .setPopup(new mapboxgl.Popup().setHTML(`<strong>Delivery</strong><br/>${deliveryAddress}`))
      .addTo(map.current);

    // Add driver/rider marker (orange)
    const driverLoc = driverLocation || {
      lat: (restaurantLoc.lat + deliveryLoc.lat) / 2,
      lng: (restaurantLoc.lng + deliveryLoc.lng) / 2,
    };

    const el = document.createElement('div');
    el.className = 'driver-marker';
    el.innerHTML = '🛵';
    el.style.fontSize = '32px';
    el.style.cursor = 'pointer';

    driverMarker.current = new mapboxgl.Marker({ element: el })
      .setLngLat([driverLoc.lng, driverLoc.lat])
      .setPopup(new mapboxgl.Popup().setHTML('<strong>Your Rider</strong>'))
      .addTo(map.current);

    // Fit map to show all markers
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([restaurantLoc.lng, restaurantLoc.lat]);
    bounds.extend([deliveryLoc.lng, deliveryLoc.lat]);
    bounds.extend([driverLoc.lng, driverLoc.lat]);

    map.current.fitBounds(bounds, {
      padding: 60,
      maxZoom: 15,
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, deliveryAddress, restaurantLocation]);

  if (error) {
    return (
      <div className="w-full h-64 bg-muted rounded-xl flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <span className="text-4xl mb-2 block">🗺️</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="w-full h-64 bg-muted rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-muted-foreground">Loading map...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden shadow-md">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          <span className="text-foreground">Restaurant</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
          <span className="text-foreground">Rider</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
          <span className="text-foreground">Your Location</span>
        </div>
      </div>
    </div>
  );
};

export default LiveTrackingMap;
