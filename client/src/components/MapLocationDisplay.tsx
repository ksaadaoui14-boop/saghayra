import { useSiteSettings } from "@/hooks/use-site-settings";
import { cn } from "@/lib/utils";

interface MapLocationDisplayProps {
  language: 'en' | 'fr' | 'de' | 'ar';
  className?: string;
  height?: string;
}

export function MapLocationDisplay({ 
  language, 
  className, 
  height = "400px" 
}: MapLocationDisplayProps) {
  const { data: siteSettings } = useSiteSettings();
  
  if (!siteSettings?.location_info || siteSettings.location_info.isActive === false) {
    return null;
  }

  const { address, latitude, longitude } = siteSettings.location_info;
  
  // Get address with fallback
  const addressToDisplay = address[language] || address.en || Object.values(address).find(addr => addr?.trim()) || '';
  
  if (!addressToDisplay) {
    return null;
  }

  // Generate Google Maps embed URL
  let embedUrl = '';
  const mapKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    // Use coordinates for precise location
    if (mapKey) {
      embedUrl = `https://www.google.com/maps/embed/v1/place?key=${mapKey}&q=${latitude},${longitude}&zoom=15`;
    } else {
      // Fallback to OpenStreetMap-based embed when no API key
      embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`;
    }
  } else {
    // Fallback to address search
    const encodedAddress = encodeURIComponent(addressToDisplay);
    if (mapKey) {
      embedUrl = `https://www.google.com/maps/embed/v1/place?key=${mapKey}&q=${encodedAddress}&zoom=15`;
    } else {
      // Simple fallback without API key
      embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=9.02,33.44,9.04,33.46&layer=mapnik`;
    }
  }

  // Get localized labels
  const locationLabel = {
    en: 'Location',
    fr: 'Emplacement', 
    de: 'Standort',
    ar: 'الموقع'
  }[language];

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)} style={{ height }}>
      {/* Google Maps Embed */}
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`${locationLabel} - ${addressToDisplay}`}
        data-testid="map-embed"
      />
      
      {/* Location Overlay */}
      <div 
        className={cn(
          "absolute bottom-4 right-4 bg-black/90 text-white px-4 py-3 rounded-md shadow-lg max-w-xs",
          language === 'ar' && "left-4 right-auto"
        )}
        dir={language === 'ar' ? 'rtl' : 'ltr'}
        data-testid="map-location-overlay"
      >
        <h3 className={cn("font-semibold text-sm mb-1", language === 'ar' && "text-right")}>
          {locationLabel}
        </h3>
        <p className={cn("text-xs text-white/90 leading-relaxed", language === 'ar' && "text-right")}>
          {addressToDisplay}
        </p>
      </div>
    </div>
  );
}