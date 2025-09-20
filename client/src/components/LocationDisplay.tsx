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
  
  // Don't render if not active or no address provided
  if (!isActive || !address[language]) {
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
    } else if (latitude && longitude) {
      if (isIOS) {
        // Apple Maps for iOS devices
        mapUrl = `maps:?q=${latitude},${longitude}&ll=${latitude},${longitude}`;
      } else if (isMobile) {
        // Google Maps app for Android
        mapUrl = `geo:${latitude},${longitude}?q=${latitude},${longitude}`;
      } else {
        // Google Maps web for desktop
        mapUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
      }
    } else {
      // Fallback to address search
      const encodedAddress = encodeURIComponent(address[language]);
      if (isIOS) {
        mapUrl = `maps:?q=${encodedAddress}`;
      } else if (isMobile) {
        mapUrl = `geo:0,0?q=${encodedAddress}`;
      } else {
        mapUrl = `https://maps.google.com/maps?q=${encodedAddress}`;
      }
    }
    
    // Open the map URL
    window.open(mapUrl, '_blank');
  };

  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-muted-foreground">{address[language]}</span>
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
              {address[language]}
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
            {address[language]}
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
                  onClick={() => window.open(googleMapsUrl, '_blank')}
                  className="hover-elevate active-elevate-2"
                  data-testid="button-open-google-maps"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Google Maps
                </Button>
              )}
            </div>
          )}
          
          {latitude && longitude && (
            <div className="text-xs text-muted-foreground pt-2 border-t">
              Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}