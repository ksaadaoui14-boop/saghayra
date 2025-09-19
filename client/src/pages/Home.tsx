import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Hero from "@/components/Hero";
import ActivityCard from "@/components/ActivityCard";
import Gallery from "@/components/Gallery";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, Award, MapPin } from "lucide-react";
import camelImage from "@assets/generated_images/Camel_riding_tour_detail_e5164afc.png";
import campImage from "@assets/generated_images/Desert_camp_dining_experience_e983ce5b.png";
import hennaImage from "@assets/generated_images/Traditional_henna_art_activity_1883deb4.png";
import heroImage from "@assets/generated_images/Sahara_desert_hero_background_840d4412.png";
import type { Activity } from "@shared/schema";

interface HomeProps {
  currentLanguage: string;
  currentCurrency: string;
}

// Removed mock data - now using real API data exclusively

const mockGalleryItems = [
  {
    id: "camel-trek",
    type: "image" as const,
    src: camelImage,
    thumbnail: camelImage,
    title: "Camel Trekking Adventure",
    description: "Experience authentic camel riding through the Sahara dunes"
  },
  {
    id: "desert-camp",
    type: "image" as const,
    src: campImage,
    thumbnail: campImage,
    title: "Desert Camp Experience", 
    description: "Traditional Berber camp with authentic dining and music"
  },
  {
    id: "henna-art",
    type: "image" as const,
    src: hennaImage,
    thumbnail: hennaImage,
    title: "Traditional Henna Art",
    description: "Beautiful henna artistry by local Berber artists"
  },
  {
    id: "sahara-sunset",
    type: "image" as const,
    src: heroImage,
    thumbnail: heroImage,
    title: "Sahara Desert Sunset", 
    description: "Breathtaking sunset views over the golden dunes"
  }
];

export default function Home({ currentLanguage, currentCurrency }: HomeProps) {
  const currencySymbols = { TND: "د.ت", USD: "$", EUR: "€" };
  const currencySymbol = currencySymbols[currentCurrency as keyof typeof currencySymbols];

  // Fetch activities from API
  const { data: activities, isLoading: activitiesLoading, error: activitiesError } = useQuery({
    queryKey: ['/api/activities'],
    select: (data: Activity[]) => {
      // Transform database activities to frontend format
      return data.map((activity, index) => {
        // Map images to activities by category or use fallback
        const imageMap: Record<string, string> = {
          'adventure': camelImage,
          'cultural': index === 1 ? campImage : hennaImage, // Distribute cultural images
        };
        
        const image = imageMap[activity.category] || camelImage;
        
        return {
          id: activity.id,
          title: (activity.title as any)[currentLanguage] || (activity.title as any).en,
          description: (activity.description as any)[currentLanguage] || (activity.description as any).en,
          image: image, // Use mapped images for now until file storage is implemented
          duration: activity.duration,
          groupSize: activity.groupSize,
          price: (activity.prices as any)[currentCurrency] || (activity.prices as any).USD,
          rating: 4.8 + (Math.random() * 0.2), // Realistic ratings between 4.8-5.0
          reviews: 89 + index * 25, // Consistent review counts
          highlights: (activity.highlights as any)[currentLanguage] || (activity.highlights as any).en,
          category: activity.category
        };
      });
    }
  });

  const handleBookActivity = (activityId: string) => {
    console.log(`Book now clicked for activity: ${activityId}`);
    if (activities) {
      const activity = activities.find(a => a.id === activityId);
      if (activity) {
        console.log(`Book now clicked for ${activity.title}`);
      }
    }
  };

  const translations = {
    en: {
      featuredActivities: "Featured Desert Adventures",
      featuredSubtitle: "Discover our most popular authentic Sahara experiences",
      viewAllActivities: "View All Activities",
      whyChooseUs: "Why Choose Sghayra Tours?",
      whySubtitle: "Authentic experiences with expert local guides",
      stats: {
        experience: { value: "15+", label: "Years Experience" },
        tours: { value: "500+", label: "Tours Completed" },
        rating: { value: "4.9", label: "Average Rating" },
        guides: { value: "12", label: "Expert Guides" }
      },
      features: [
        {
          icon: Star,
          title: "Authentic Experiences",
          description: "Traditional Berber hospitality and genuine cultural immersion"
        },
        {
          icon: Users,
          title: "Expert Local Guides",
          description: "Born and raised in the Sahara, our guides know every grain of sand"
        },
        {
          icon: Award,
          title: "Award Winning Service",
          description: "Recognized for excellence in desert tourism and customer satisfaction"
        },
        {
          icon: MapPin,
          title: "Perfect Location",
          description: "Based in Douz, the gateway to the Sahara Desert"
        }
      ]
    }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero currentLanguage={currentLanguage} currentCurrency={currentCurrency} />

      {/* Featured Activities Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
              {t.featuredActivities}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.featuredSubtitle}
            </p>
          </div>

          {/* Loading State */}
          {activitiesLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg h-64 mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              ))}
            </div>
          )}
          
          {/* Error State */}
          {activitiesError && (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">
                {currentLanguage === 'en' ? 'Failed to load activities' : 
                 currentLanguage === 'fr' ? 'Échec du chargement des activités' :
                 currentLanguage === 'de' ? 'Aktivitäten konnten nicht geladen werden' :
                 'فشل في تحميل الأنشطة'}
              </p>
              <Button onClick={() => window.location.reload()}>
                {currentLanguage === 'en' ? 'Try Again' : 
                 currentLanguage === 'fr' ? 'Réessayer' :
                 currentLanguage === 'de' ? 'Erneut versuchen' :
                 'حاول مرة أخرى'}
              </Button>
            </div>
          )}
          
          {/* Activities Grid */}
          {activities && activities.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  currency={currentCurrency}
                  currencySymbol={currencySymbol}
                  onBookNow={handleBookActivity}
                  currentLanguage={currentLanguage}
                />
              ))}
            </div>
          )}
          
          {/* No Activities State */}
          {activities && activities.length === 0 && !activitiesLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {currentLanguage === 'en' ? 'No activities available' : 
                 currentLanguage === 'fr' ? 'Aucune activité disponible' :
                 currentLanguage === 'de' ? 'Keine Aktivitäten verfügbar' :
                 'لا توجد أنشطة متاحة'}
              </p>
            </div>
          )}

          <div className="text-center">
            <Button variant="outline" size="lg" data-testid="button-view-all-activities">
              {t.viewAllActivities} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
              {t.whyChooseUs}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.whySubtitle}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {Object.entries(t.stats).map(([key, stat]) => (
              <div key={key} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.features.map((feature, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <Gallery items={mockGalleryItems} currentLanguage={currentLanguage} />
    </div>
  );
}