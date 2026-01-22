import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// Fix Leaflet default icon issue with webpack
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface LocationPickerProps {
  initialLocation?: { lat: number; lng: number; address: string };
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    address: string;
  }) => void;
  label?: string;
}

// Component to handle map clicks
function LocationMarker({ position, setPosition }: any) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

const LocationPicker = ({
  initialLocation,
  onLocationSelect,
  label = "Location",
}: LocationPickerProps) => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    initialLocation
      ? { lat: initialLocation.lat, lng: initialLocation.lng }
      : null,
  );
  const [address, setAddress] = useState(initialLocation?.address || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Default to Karachi center
  const defaultCenter = { lat: 24.8607, lng: 67.0011 };
  const center = position || defaultCenter;

  // Reverse geocode when position changes
  useEffect(() => {
    if (!position) return;

    const reverseGeocode = async () => {
      setIsGeocoding(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${position.lat}&lon=${position.lng}&format=json&accept-language=en`,
        );
        const data = await response.json();
        const formattedAddress =
          data.display_name ||
          `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`;
        setAddress(formattedAddress);
        onLocationSelect({
          lat: position.lat,
          lng: position.lng,
          address: formattedAddress,
        });
      } catch (error) {
        console.error("Geocoding error:", error);
        const fallbackAddress = `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`;
        setAddress(fallbackAddress);
        onLocationSelect({
          lat: position.lat,
          lng: position.lng,
          address: fallbackAddress,
        });
      } finally {
        setIsGeocoding(false);
      }
    };

    reverseGeocode();
  }, [position]);

  // Search for address
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Add "Karachi, Pakistan" to search query if not present
      const query = searchQuery.toLowerCase().includes("karachi")
        ? searchQuery
        : `${searchQuery}, Karachi, Pakistan`;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=en`,
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        setPosition({
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
        });
      } else {
        alert(
          "Location not found. Please try a different search term or click on the map.",
        );
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("Failed to search location. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search for a place in Karachi..."
            className="pl-10"
          />
        </div>
        <Button
          type="button"
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          variant="outline"
        >
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Search"
          )}
        </Button>
      </div>

      {/* Map */}
      <div className="relative h-64 rounded-xl overflow-hidden border border-border">
        <MapContainer
          center={[center.lat, center.lng] as LatLngExpression}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          key={`${center.lat}-${center.lng}`}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri"
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>

        <div className="absolute top-2 left-2 bg-background/95 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs shadow-lg border border-border">
          <MapPin className="w-3 h-3 text-primary inline mr-1" />
          Click on map to select location
        </div>
      </div>

      {/* Selected Address Display */}
      {position && (
        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">
                Selected Location:
              </p>
              {isGeocoding ? (
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-muted-foreground">
                    Getting address...
                  </span>
                </div>
              ) : (
                <p className="text-sm text-foreground break-words">{address}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
