import { useState } from "react";
import Hero from "@/components/Hero";
import ActivityCard from "@/components/ActivityCard";
import Gallery from "@/components/Gallery";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, Award, MapPin } from "lucide-react";
import camelImage from "@assets/generated_images/Camel_riding_tour_detail_e5164afc.png";
import campImage from "@assets/generated_images/Desert_camp_dining_experience_e983ce5b.png";
import hennaImage from "@assets/generated_images/Traditional_henna_art_activity_1883deb4.png";
import heroImage from "@assets/generated_images/Sahara_desert_hero_background_840d4412.png";

interface HomeProps {
  currentLanguage: string;
  currentCurrency: string;
}

// todo: remove mock functionality
const mockActivities = [
  {
    id: "camel-2day",
    title: "2-Day Camel Trek",
    description: "Experience the magic of the Sahara with an authentic camel trekking adventure through golden dunes.",
    image: camelImage,
    duration: "2 days, 1 night",
    groupSize: "2-8 people", 
    price: 150,
    rating: 4.9,
    reviews: 127,
    highlights: ["Camel Riding", "Desert Camp", "Traditional Dinner", "Stargazing"],
    category: "Adventure"
  },
  {
    id: "desert-dinner",
    title: "Desert Dinner Experience",
    description: "Enjoy traditional Berber cuisine under the stars with live music and cultural performances.",
    image: campImage,
    duration: "Evening (4 hours)",
    groupSize: "2-20 people",
    price: 45,
    rating: 4.8,
    reviews: 89,
    highlights: ["Traditional Food", "Live Music", "Cultural Show", "Tea Ceremony"],
    category: "Cultural"
  },
  {
    id: "cultural-day",
    title: "Cultural Activities Day",
    description: "Immerse yourself in Berber culture with henna art, traditional crafts, and local music.",
    image: hennaImage,
    duration: "Full day (8 hours)",
    groupSize: "4-15 people",
    price: 75,
    rating: 4.7,
    reviews: 156,
    highlights: ["Henna Art", "Traditional Crafts", "Local Music", "Village Tour"],
    category: "Cultural"
  }
];

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

  const handleBookActivity = (activityId: string) => {
    console.log(`Book now clicked for activity: ${activityId}`);
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {mockActivities.map((activity) => (
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