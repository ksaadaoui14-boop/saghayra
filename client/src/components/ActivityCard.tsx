import { Link } from "wouter";
import { Clock, Users, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Activity } from "@shared/schema";

interface ActivityCardProps {
  activity: Activity;
  currency: string;
  currencySymbol: string;
  currentLanguage: string;
}

export default function ActivityCard({ 
  activity, 
  currency, 
  currencySymbol,
  currentLanguage 
}: ActivityCardProps) {
  const isRTL = currentLanguage === 'ar';

  // Helper function to get localized text from JSONB fields
  const getLocalizedText = (textObj: any, fallback = "") => {
    if (!textObj) return fallback;
    return textObj[currentLanguage as keyof typeof textObj] || textObj.en || fallback;
  };

  // Get the price for the current currency
  const getPrice = () => {
    if (!activity.prices) return 0;
    const prices = activity.prices as { TND: number; USD: number; EUR: number };
    return prices[currency as keyof typeof prices] || prices.USD || 0;
  };

  const activityTitle = getLocalizedText(activity.title);
  const activityDescription = getLocalizedText(activity.description);
  const activityHighlights = (activity.highlights as any)?.[currentLanguage] || (activity.highlights as any)?.en || [];
  const activityPrice = getPrice();

  const translations = {
    en: {
      duration: "Duration",
      groupSize: "Group Size", 
      bookNow: "Book Now",
      reviews: "reviews",
      highlights: "Highlights"
    },
    fr: {
      duration: "Durée",
      groupSize: "Taille du Groupe",
      bookNow: "Réserver",
      reviews: "avis", 
      highlights: "Points Forts"
    },
    de: {
      duration: "Dauer",
      groupSize: "Gruppengröße",
      bookNow: "Jetzt Buchen", 
      reviews: "Bewertungen",
      highlights: "Highlights"
    },
    ar: {
      duration: "المدة",
      groupSize: "حجم المجموعة",
      bookNow: "احجز الآن",
      reviews: "تقييم",
      highlights: "المميزات"
    }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;

  return (
    <Card className="hover-elevate overflow-hidden group">
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={activity.imageUrl || "/api/placeholder/400/300"} 
          alt={activityTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-white/90 text-black">
            {activity.category}
          </Badge>
        </div>
        <div className="absolute top-4 right-4">
          <div className="flex items-center space-x-1 bg-white/90 text-black px-2 py-1 rounded-full text-sm">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">4.9</span>
            <span className="text-muted-foreground">(120+)</span>
          </div>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className={`flex justify-between items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="flex-1">
            <h3 className={`text-xl font-semibold mb-2 ${isRTL ? 'text-right' : ''}`}>
              {activityTitle}
            </h3>
            <p className={`text-muted-foreground text-sm ${isRTL ? 'text-right' : ''}`}>
              {activityDescription}
            </p>
          </div>
          <div className={`text-right ${isRTL ? 'text-left' : ''} ml-4`}>
            <div className="text-2xl font-bold text-primary" data-testid={`price-${activity.id}`}>
              {currencySymbol}{activityPrice}
            </div>
            <div className="text-xs text-muted-foreground">per person</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Activity details */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>{t.duration}: {activity.duration}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>{t.groupSize}: {activity.groupSize}</span>
          </div>
        </div>

        {/* Highlights */}
        {activityHighlights && activityHighlights.length > 0 && (
          <div>
            <div className={`text-sm font-medium mb-2 ${isRTL ? 'text-right' : ''}`}>
              {t.highlights}:
            </div>
            <div className="flex flex-wrap gap-1">
              {activityHighlights.map((highlight: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {highlight}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Book button */}
        <Button 
          asChild
          className="w-full bg-primary hover:bg-primary/90"
        >
          <Link 
            href="/booking"
            data-testid={`button-book-${activity.id}`}
          >
            {t.bookNow}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}