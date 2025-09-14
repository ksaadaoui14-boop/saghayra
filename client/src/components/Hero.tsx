import { useState } from "react";
import { Calendar, Users, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BookingWidget from "./BookingWidget";
import heroImage from "@assets/generated_images/Sahara_desert_hero_background_840d4412.png";

interface HeroProps {
  currentLanguage: string;
  currentCurrency: string;
}

export default function Hero({ currentLanguage, currentCurrency }: HeroProps) {
  const [showBooking, setShowBooking] = useState(false);

  const translations = {
    en: {
      title: "Discover the Magic of the Sahara",
      subtitle: "Authentic Desert Adventures Await",
      description: "Experience the wonder of Tunisia's Sahara desert with our authentic camel tours, traditional Berber cuisine, and cultural immersion experiences.",
      bookNow: "Book Your Adventure",
      learnMore: "Learn More",
      stats: {
        experience: "15+ Years Experience",
        tours: "500+ Tours Completed", 
        rating: "4.9/5 Rating",
        guides: "Expert Local Guides"
      }
    },
    fr: {
      title: "Découvrez la Magie du Sahara",
      subtitle: "Aventures Authentiques du Désert",
      description: "Vivez la merveille du désert du Sahara tunisien avec nos tours authentiques à dos de chameau, la cuisine berbère traditionnelle et les expériences d'immersion culturelle.",
      bookNow: "Réservez Votre Aventure",
      learnMore: "En Savoir Plus",
      stats: {
        experience: "15+ Ans d'Expérience",
        tours: "500+ Tours Complétés",
        rating: "4.9/5 Évaluation", 
        guides: "Guides Locaux Experts"
      }
    },
    de: {
      title: "Entdecken Sie die Magie der Sahara",
      subtitle: "Authentische Wüstenabenteuer Warten",
      description: "Erleben Sie das Wunder der tunesischen Sahara mit unseren authentischen Kameltouren, traditioneller Berberküche und kulturellen Eintaucherlebnissen.",
      bookNow: "Buchen Sie Ihr Abenteuer",
      learnMore: "Mehr Erfahren",
      stats: {
        experience: "15+ Jahre Erfahrung",
        tours: "500+ Touren Abgeschlossen",
        rating: "4.9/5 Bewertung",
        guides: "Experten Ortskundige Führer"
      }
    },
    ar: {
      title: "اكتشف سحر الصحراء",
      subtitle: "مغامرات صحراوية أصيلة في انتظارك",
      description: "اختبر عجائب الصحراء التونسية مع جولاتنا الأصيلة على الجمال والمأكولات البربرية التقليدية وتجارب الانغماس الثقافي.",
      bookNow: "احجز مغامرتك",
      learnMore: "اعرف المزيد", 
      stats: {
        experience: "خبرة أكثر من 15 سنة",
        tours: "أكثر من 500 جولة مكتملة",
        rating: "تقييم 4.9/5",
        guides: "مرشدون محليون خبراء"
      }
    }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;
  const isRTL = currentLanguage === 'ar';

  return (
    <div className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div className={`text-white space-y-8 ${isRTL ? 'lg:order-2 text-right' : ''}`}>
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight">
                {t.title}
              </h1>
              <p className="text-xl sm:text-2xl text-white/90 font-medium">
                {t.subtitle}
              </p>
              <p className="text-lg text-white/80 max-w-2xl">
                {t.description}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className={`flex flex-wrap gap-4 ${isRTL ? 'justify-end' : ''}`}>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
                onClick={() => setShowBooking(!showBooking)}
                data-testid="button-hero-book-now"
              >
                <Calendar className="w-5 h-5 mr-2" />
                {t.bookNow}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-black px-8 py-3 text-lg backdrop-blur-sm"
                data-testid="button-hero-learn-more"
              >
                {t.learnMore}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8">
              {Object.values(t.stats).map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-2">
                    {index === 0 && <Star className="w-5 h-5 text-yellow-400 mr-1" />}
                    {index === 1 && <Users className="w-5 h-5 text-blue-400 mr-1" />}
                    {index === 2 && <Star className="w-5 h-5 text-yellow-400 mr-1" />}
                    {index === 3 && <MapPin className="w-5 h-5 text-green-400 mr-1" />}
                  </div>
                  <div className="text-sm text-white/90 font-medium">{stat}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Booking widget */}
          <div className={`${isRTL ? 'lg:order-1' : ''}`}>
            {showBooking ? (
              <Card className="backdrop-blur-md bg-white/10 border-white/20">
                <CardContent className="p-0">
                  <BookingWidget 
                    currentLanguage={currentLanguage}
                    currentCurrency={currentCurrency}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card 
                className="backdrop-blur-md bg-white/10 border-white/20 hover-elevate cursor-pointer"
                onClick={() => setShowBooking(true)}
                data-testid="card-booking-preview"
              >
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-white mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Quick Booking</h3>
                  <p className="text-white/80 mb-4">Click to start your desert adventure</p>
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                    Start Booking
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}