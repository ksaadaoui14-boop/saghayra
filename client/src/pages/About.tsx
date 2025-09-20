import { MapPin, Star, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapLocationDisplay } from "@/components/MapLocationDisplay";
import { useSiteSettings } from "@/hooks/use-site-settings";

interface AboutProps {
  currentLanguage: string;
}

export default function About({ currentLanguage }: AboutProps) {
  const { data: settings } = useSiteSettings();

  // Function to get multilingual content with fallbacks
  const getContent = (field: string, fallback: string = '') => {
    const aboutPageContent = settings?.about_page_content;
    if (aboutPageContent && aboutPageContent.isActive) {
      const fieldValue = (aboutPageContent as any)[field];
      if (fieldValue && typeof fieldValue === 'object') {
        return fieldValue[currentLanguage] || fieldValue.en || fallback;
      }
    }

    const companyInfo = settings?.company_info;
    if (companyInfo && companyInfo.isActive && (field === 'name' || field === 'tagline' || field === 'about')) {
      const fieldValue = (companyInfo as any)[field];
      if (fieldValue && typeof fieldValue === 'object') {
        return fieldValue[currentLanguage] || fieldValue.en || fallback;
      }
    }

    return fallback;
  };

  const defaults = {
    title: "About Sghayra Tours",
    subtitle: "Your Gateway to the Sahara Desert",
    whoWeAre: "Who We Are",
    whoWeAreDesc: "We specialize in authentic Sahara Desert experiences.",
    ourMission: "Our Mission",
    ourMissionDesc: "To provide unforgettable desert experiences while respecting local traditions.",
    whyChooseUs: "Why Choose Sghayra Tours",
    experience: "Years of Experience",
    experienceDesc: "Expertise in desert tourism",
    localGuides: "Local Expert Guides",
    localGuidesDesc: "Native guides with deep desert knowledge",
    safety: "Safety First",
    safetyDesc: "All tours follow strict safety protocols",
    authentic: "Authentic Experiences",
    authenticDesc: "Real desert life with local communities",
    stats: {
      toursCompleted: "1,200+ Tours Completed",
      happyCustomers: "3,500+ Happy Customers",
      countries: "45+ Countries Served",
      rating: "4.9/5 Average Rating"
    },
    ourStory: "Our Story",
    ourStoryDesc: "Founded by local desert guides with a passion for sharing the magic of the Sahara.",
    commitment: "Our Commitment",
    commitmentDesc: "We are committed to sustainable tourism practices that benefit local communities."
  };

  const features = [
    {
      icon: Calendar,
      title: getContent('experience', defaults.experience),
      description: getContent('experienceDesc', defaults.experienceDesc)
    },
    {
      icon: Users,
      title: getContent('localGuides', defaults.localGuides),
      description: getContent('localGuidesDesc', defaults.localGuidesDesc)
    },
    {
      icon: Star,
      title: getContent('safety', defaults.safety),
      description: getContent('safetyDesc', defaults.safetyDesc)
    },
    {
      icon: MapPin,
      title: getContent('authentic', defaults.authentic),
      description: getContent('authenticDesc', defaults.authenticDesc)
    }
  ];

  const stats = [
    { number: "1,200+", label: getContent('toursCompleted', defaults.stats.toursCompleted) },
    { number: "3,500+", label: getContent('happyCustomers', defaults.stats.happyCustomers) },
    { number: "45+", label: getContent('countries', defaults.stats.countries) },
    { number: "4.9/5", label: getContent('rating', defaults.stats.rating) }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            {getContent('title', defaults.title)}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {getContent('subtitle', defaults.subtitle)}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Who We Are */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
            {getContent('whoWeAre', defaults.whoWeAre)}
          </h2>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto text-center leading-relaxed">
            {getContent('whoWeAreDesc', defaults.whoWeAreDesc)}
          </p>
        </div>

        {/* Mission */}
        <div className="mb-20">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-center">{getContent('ourMission', defaults.ourMission)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground text-center leading-relaxed">
                {getContent('ourMissionDesc', defaults.ourMissionDesc)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Why Choose Us */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
            {getContent('whyChooseUs', defaults.whyChooseUs)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover-elevate">
                <CardContent className="pt-6">
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <p className="text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Our Story */}
        <div className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                {getContent('ourStory', defaults.ourStory)}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                {getContent('ourStoryDesc', defaults.ourStoryDesc)}
              </p>
              <Badge variant="secondary" className="text-sm">
                Established 2015
              </Badge>
            </div>
            <div className="rounded-lg overflow-hidden">
              <MapLocationDisplay
                language={currentLanguage as 'en' | 'fr' | 'de' | 'ar'}
                height="350px"
                className="shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Commitment */}
        <div>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {getContent('commitment', defaults.commitment)}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                {getContent('commitmentDesc', defaults.commitmentDesc)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Location Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
              {currentLanguage === 'en' ? 'Visit Us' :
                currentLanguage === 'fr' ? 'Nous Rendre Visite' :
                  currentLanguage === 'de' ? 'Besuchen Sie Uns' :
                    'زورونا'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {currentLanguage === 'en' ? 'Experience authentic desert hospitality at our location' :
                currentLanguage === 'fr' ? 'Découvrez l\'hospitalité authentique du désert à notre emplacement' :
                  currentLanguage === 'de' ? 'Erleben Sie authentische Wüstengastfreundschaft an unserem Standort' :
                    'اختبروا الضيافة الصحراوية الأصيلة في موقعنا'}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <MapLocationDisplay
              language={currentLanguage as 'en' | 'fr' | 'de' | 'ar'}
              height="500px"
              className="shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
