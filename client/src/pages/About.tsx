import { MapPin, Star, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSiteSettings } from "@/hooks/use-site-settings";

interface AboutProps {
  currentLanguage: string;
}

export default function About({ currentLanguage }: AboutProps) {
  const { data: settings } = useSiteSettings();
  
  // Type assertion to help TypeScript understand the data structure
  const siteSettings = settings as any;
  const translations = {
    en: {
      title: "About Sghayra Tours",
      subtitle: "Your Gateway to the Sahara Desert",
      whoWeAre: "Who We Are",
      whoWeAreDesc: "Sghayra Tours is a premier tour operator specializing in authentic Sahara Desert experiences. Based in Tunisia, we have been guiding adventurers through the magnificent landscapes of the Sahara since 2015.",
      ourMission: "Our Mission",
      ourMissionDesc: "To provide unforgettable desert experiences while respecting local traditions and preserving the natural beauty of the Sahara for future generations.",
      whyChooseUs: "Why Choose Sghayra Tours",
      experience: "Years of Experience",
      experienceDesc: "Over 8 years of expertise in desert tourism",
      localGuides: "Local Expert Guides",
      localGuidesDesc: "Native guides with deep knowledge of the desert",
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
      ourStoryDesc: "Founded by local desert guides with a passion for sharing the magic of the Sahara, Sghayra Tours began as a small family business. Today, we pride ourselves on offering personalized experiences that showcase the true essence of desert life.",
      commitment: "Our Commitment",
      commitmentDesc: "We are committed to sustainable tourism practices that benefit local communities while providing our guests with authentic, life-changing experiences in one of the world's most spectacular landscapes."
    },
    fr: {
      title: "À Propos de Sghayra Tours",
      subtitle: "Votre Porte d'Entrée vers le Désert du Sahara",
      whoWeAre: "Qui Nous Sommes",
      whoWeAreDesc: "Sghayra Tours est un tour-opérateur de premier plan spécialisé dans les expériences authentiques du désert du Sahara. Basés en Tunisie, nous guidons les aventuriers à travers les magnifiques paysages du Sahara depuis 2015.",
      ourMission: "Notre Mission",
      ourMissionDesc: "Fournir des expériences inoubliables dans le désert tout en respectant les traditions locales et en préservant la beauté naturelle du Sahara pour les générations futures.",
      whyChooseUs: "Pourquoi Choisir Sghayra Tours",
      experience: "Années d'Expérience",
      experienceDesc: "Plus de 8 ans d'expertise en tourisme désertique",
      localGuides: "Guides Experts Locaux",
      localGuidesDesc: "Guides natifs avec une connaissance approfondie du désert",
      safety: "Sécurité Avant Tout",
      safetyDesc: "Tous les tours suivent des protocoles de sécurité stricts",
      authentic: "Expériences Authentiques",
      authenticDesc: "Vraie vie du désert avec les communautés locales",
      stats: {
        toursCompleted: "1 200+ Tours Réalisés",
        happyCustomers: "3 500+ Clients Satisfaits",
        countries: "45+ Pays Servis",
        rating: "4,9/5 Note Moyenne"
      },
      ourStory: "Notre Histoire",
      ourStoryDesc: "Fondée par des guides locaux du désert passionnés par le partage de la magie du Sahara, Sghayra Tours a commencé comme une petite entreprise familiale. Aujourd'hui, nous sommes fiers d'offrir des expériences personnalisées qui mettent en valeur la véritable essence de la vie du désert.",
      commitment: "Notre Engagement",
      commitmentDesc: "Nous nous engageons à des pratiques de tourisme durable qui profitent aux communautés locales tout en offrant à nos invités des expériences authentiques et transformatrices dans l'un des paysages les plus spectaculaires au monde."
    },
    de: {
      title: "Über Sghayra Tours",
      subtitle: "Ihr Tor zur Sahara-Wüste",
      whoWeAre: "Wer Wir Sind",
      whoWeAreDesc: "Sghayra Tours ist ein führender Reiseveranstalter, der sich auf authentische Sahara-Wüstenerlebnisse spezialisiert hat. Mit Sitz in Tunesien führen wir seit 2015 Abenteurer durch die herrlichen Landschaften der Sahara.",
      ourMission: "Unsere Mission",
      ourMissionDesc: "Unvergessliche Wüstenerlebnisse zu bieten, während wir lokale Traditionen respektieren und die natürliche Schönheit der Sahara für zukünftige Generationen bewahren.",
      whyChooseUs: "Warum Sghayra Tours Wählen",
      experience: "Jahre der Erfahrung",
      experienceDesc: "Über 8 Jahre Expertise im Wüstentourismus",
      localGuides: "Lokale Expertenführer",
      localGuidesDesc: "Einheimische Führer mit tiefem Wüstenwissen",
      safety: "Sicherheit Zuerst",
      safetyDesc: "Alle Touren folgen strengen Sicherheitsprotokollen",
      authentic: "Authentische Erlebnisse",
      authenticDesc: "Echtes Wüstenleben mit lokalen Gemeinschaften",
      stats: {
        toursCompleted: "1.200+ Touren Durchgeführt",
        happyCustomers: "3.500+ Zufriedene Kunden",
        countries: "45+ Länder Bedient",
        rating: "4,9/5 Durchschnittsbewertung"
      },
      ourStory: "Unsere Geschichte",
      ourStoryDesc: "Gegründet von lokalen Wüstenführern mit einer Leidenschaft für das Teilen der Magie der Sahara, begann Sghayra Tours als kleines Familienunternehmen. Heute sind wir stolz darauf, personalisierte Erlebnisse anzubieten, die die wahre Essenz des Wüstenlebens zeigen.",
      commitment: "Unser Engagement",
      commitmentDesc: "Wir verpflichten uns zu nachhaltigen Tourismuspraktiken, die lokalen Gemeinschaften zugutekommen, während wir unseren Gästen authentische, lebensverändernde Erlebnisse in einer der spektakulärsten Landschaften der Welt bieten."
    },
    ar: {
      title: "حول سغايرة تورز",
      subtitle: "بوابتك إلى الصحراء الكبرى",
      whoWeAre: "من نحن",
      whoWeAreDesc: "سغايرة تورز هي شركة سياحة رائدة متخصصة في تجارب الصحراء الكبرى الأصيلة. مقرها في تونس، نقوم بإرشاد المغامرين عبر المناظر الطبيعية الرائعة للصحراء منذ عام 2015.",
      ourMission: "مهمتنا",
      ourMissionDesc: "تقديم تجارب صحراوية لا تُنسى مع احترام التقاليد المحلية والحفاظ على الجمال الطبيعي للصحراء للأجيال القادمة.",
      whyChooseUs: "لماذا تختار سغايرة تورز",
      experience: "سنوات من الخبرة",
      experienceDesc: "أكثر من 8 سنوات من الخبرة في السياحة الصحراوية",
      localGuides: "مرشدون محليون خبراء",
      localGuidesDesc: "مرشدون محليون بمعرفة عميقة بالصحراء",
      safety: "الأمان أولاً",
      safetyDesc: "جميع الجولات تتبع بروتوكولات أمان صارمة",
      authentic: "تجارب أصيلة",
      authenticDesc: "حياة صحراوية حقيقية مع المجتمعات المحلية",
      stats: {
        toursCompleted: "1200+ جولة مكتملة",
        happyCustomers: "3500+ عميل سعيد",
        countries: "45+ دولة خدمناها",
        rating: "4.9/5 متوسط التقييم"
      },
      ourStory: "قصتنا",
      ourStoryDesc: "تأسست من قبل مرشدين صحراويين محليين لديهم شغف لمشاركة سحر الصحراء، بدأت سغايرة تورز كشركة عائلية صغيرة. اليوم، نفتخر بتقديم تجارب شخصية تُظهر الجوهر الحقيقي لحياة الصحراء.",
      commitment: "التزامنا",
      commitmentDesc: "نحن ملتزمون بممارسات السياحة المستدامة التي تفيد المجتمعات المحلية بينما نوفر لضيوفنا تجارب أصيلة تغير الحياة في واحدة من أروع المناظر الطبيعية في العالم."
    }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;

  const features = [
    {
      icon: Calendar,
      title: t.experience,
      description: t.experienceDesc
    },
    {
      icon: Users,
      title: t.localGuides,
      description: t.localGuidesDesc
    },
    {
      icon: Star,
      title: t.safety,
      description: t.safetyDesc
    },
    {
      icon: MapPin,
      title: t.authentic,
      description: t.authenticDesc
    }
  ];

  const stats = [
    { number: "1,200+", label: t.stats.toursCompleted },
    { number: "3,500+", label: t.stats.happyCustomers },
    { number: "45+", label: t.stats.countries },
    { number: "4.9/5", label: t.stats.rating }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            {siteSettings?.company_info?.name
              ? `About ${siteSettings.company_info.name[currentLanguage as keyof typeof siteSettings.company_info.name] || siteSettings.company_info.name.en}`
              : t.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {siteSettings?.company_info?.tagline
              ? siteSettings.company_info.tagline[currentLanguage as keyof typeof siteSettings.company_info.tagline] || siteSettings.company_info.tagline.en
              : t.subtitle}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Who We Are */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
            {t.whoWeAre}
          </h2>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto text-center leading-relaxed">
            {siteSettings?.company_info?.about
              ? siteSettings.company_info.about[currentLanguage as keyof typeof siteSettings.company_info.about] || siteSettings.company_info.about.en
              : t.whoWeAreDesc}
          </p>
        </div>

        {/* Mission */}
        <div className="mb-20">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-center">{t.ourMission}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground text-center leading-relaxed">
                {t.ourMissionDesc}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Why Choose Us */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
            {t.whyChooseUs}
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
                {t.ourStory}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                {t.ourStoryDesc}
              </p>
              <Badge variant="secondary" className="text-sm">
                Established 2015
              </Badge>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-8">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <MapPin className="h-16 w-16 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Commitment */}
        <div>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {t.commitment}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                {t.commitmentDesc}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}