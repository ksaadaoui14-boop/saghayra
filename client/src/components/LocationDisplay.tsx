import { MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LocationInfo {
  address: {
    en: string;
    fr: string;
    de: string;
    ar: string;
  };
  latitude: number;
  longitude: number;
  googleMapsUrl?: string;
  isActive?: boolean;
}

interface LocationDisplayProps {
  locationInfo: LocationInfo;
  language?: 'en' | 'fr' | 'de' | 'ar';
  variant?: 'full' | 'compact' | 'inline';
  className?: string;
  showMapButton?: boolean;
}

export function LocationDisplay({
  locationInfo,
  language = 'en',
  variant = 'full',
  className,
  showMapButton = true
}: LocationDisplayProps) {
  const { address, latitude, longitude, googleMapsUrl, isActive } = locationInfo;
  
  // Don't render if not active or no address provided (with fallback)
  const addressToDisplay = address[language] || address.en || Object.values(address).find(addr => addr?.trim()) || '';
  
  if (!isActive || !addressToDisplay) {
    return null;
  }

  const handleOpenMap = () => {
    // Try to detect the user's platform and preferred map app
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    let mapUrl = '';
    
    if (googleMapsUrl) {
      // Use custom Google Maps URL if provided
      mapUrl = googleMapsUrl;
    } else if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      if (isIOS) {
        // Apple Maps for iOS devices - use universal URL
        mapUrl = `https://maps.apple.com/?q=${latitude},${longitude}`;
      } else if (isMobile) {
        // Google Maps app for Android
        mapUrl = `geo:${latitude},${longitude}?q=${latitude},${longitude}`;
      } else {
        // Google Maps web for desktop - use universal query format
        mapUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      }
    } else {
      // Fallback to address search with proper address fallback
      const addressToUse = address[language] || address.en || Object.values(address).find(addr => addr?.trim()) || '';
      const encodedAddress = encodeURIComponent(addressToUse);
      
      if (isIOS) {
        mapUrl = `https://maps.apple.com/?q=${encodedAddress}`;
      } else if (isMobile) {
        mapUrl = `geo:0,0?q=${encodedAddress}`;
      } else {
        mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      }
    }
    
    // Open the map URL with security measures
    window.open(mapUrl, '_blank', 'noopener,noreferrer');
  };

  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-muted-foreground">{addressToDisplay}</span>
        {showMapButton && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleOpenMap}
            className="p-1 h-auto hover-elevate"
            data-testid="button-open-map-inline"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-muted-foreground leading-relaxed">
              {addressToDisplay}
            </p>
          </div>
        </div>
        {showMapButton && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleOpenMap}
            className="w-full hover-elevate active-elevate-2"
            data-testid="button-open-map-compact"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Open in Maps
          </Button>
        )}
      </div>
    );
  }

  // Full variant (default)
  return (
    <Card className={cn("", className)}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Our Location</h3>
          </div>
          
          <div className="text-sm text-muted-foreground leading-relaxed">
            {addressToDisplay}
          </div>
          
          {showMapButton && (
            <div className="flex gap-2">
              <Button 
                onClick={handleOpenMap}
                className="flex-1 hover-elevate active-elevate-2"
                data-testid="button-open-map-full"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Open in Maps
              </Button>
              
              {googleMapsUrl && (
                <Button 
                  variant="outline"
                  onClick={() => window.open(googleMapsUrl, '_blank', 'noopener,noreferrer')}
                  className="hover-elevate active-elevate-2"
                  data-testid="button-open-google-maps"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Google Maps
                </Button>
              )}
            </div>
          )}
          
          {Number.isFinite(latitude) && Number.isFinite(longitude) && (
            <div className="text-xs text-muted-foreground pt-2 border-t">
              Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}