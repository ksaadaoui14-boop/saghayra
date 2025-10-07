import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LocationDisplay } from "@/components/LocationDisplay";
import { LocationMap } from "@/components/LocationMap";
import { useSiteSettings } from "@/hooks/use-site-settings";

interface ContactProps {
  currentLanguage: string;
}

export default function Contact({ currentLanguage }: ContactProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { data: settings } = useSiteSettings();
  
  // Type assertion to help TypeScript understand the data structure
  const siteSettings = settings as any;
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const translations = {
    en: {
      title: "Contact Sghayra Tours",
      subtitle: "Get in touch with our team for your desert adventure",
      getInTouch: "Get in Touch",
      contactInfo: "Contact Information",
      phone: "Phone",
      email: "Email",
      address: "Address",
      hours: "Business Hours",
      form: {
        name: "Full Name",
        namePlaceholder: "Enter your full name",
        email: "Email Address",
        emailPlaceholder: "Enter your email address",
        phone: "Phone Number",
        phonePlaceholder: "Enter your phone number",
        subject: "Subject",
        subjectPlaceholder: "What can we help you with?",
        message: "Message",
        messagePlaceholder: "Tell us about your dream desert experience...",
        submit: "Send Message",
        submitting: "Sending..."
      },
      contactMethods: [
        {
          icon: Phone,
          title: "Call Us",
          value: siteSettings?.contact_details?.phone || "+216 12 345 678",
          description: "Mon-Fri 9AM-6PM GMT+1"
        },
        {
          icon: Mail,
          title: "Email Us",
          value: siteSettings?.contact_details?.email || "info@sghayratours.com",
          description: "We'll respond within 24 hours"
        },
        {
          icon: Clock,
          title: "Business Hours",
          value: "9:00 AM - 6:00 PM",
          description: "Monday to Friday (GMT+1)"
        }
      ],
      successMessage: "Message sent successfully! We'll get back to you soon.",
      errorMessage: "Failed to send message. Please try again."
    },
    fr: {
      title: "Contacter Sghayra Tours",
      subtitle: "Contactez notre équipe pour votre aventure dans le désert",
      getInTouch: "Nous Contacter",
      contactInfo: "Informations de Contact",
      phone: "Téléphone",
      email: "Email",
      address: "Adresse",
      hours: "Heures d'Ouverture",
      form: {
        name: "Nom Complet",
        namePlaceholder: "Entrez votre nom complet",
        email: "Adresse Email",
        emailPlaceholder: "Entrez votre adresse email",
        phone: "Numéro de Téléphone",
        phonePlaceholder: "Entrez votre numéro de téléphone",
        subject: "Sujet",
        subjectPlaceholder: "Comment pouvons-nous vous aider?",
        message: "Message",
        messagePlaceholder: "Parlez-nous de votre expérience de rêve dans le désert...",
        submit: "Envoyer le Message",
        submitting: "Envoi..."
      },
      contactMethods: [
        {
          icon: Phone,
          title: "Appelez-Nous",
          value: siteSettings?.contact_details?.phone || "+216 12 345 678",
          description: "Lun-Ven 9h-18h GMT+1"
        },
        {
          icon: Mail,
          title: "Envoyez-Nous un Email",
          value: siteSettings?.contact_details?.email || "info@sghayratours.com",
          description: "Nous répondrons dans les 24 heures"
        },
        {
          icon: Clock,
          title: "Heures d'Ouverture",
          value: "9h00 - 18h00",
          description: "Lundi au Vendredi (GMT+1)"
        }
      ],
      successMessage: "Message envoyé avec succès! Nous vous répondrons bientôt.",
      errorMessage: "Échec de l'envoi du message. Veuillez réessayer."
    },
    de: {
      title: "Sghayra Tours Kontaktieren",
      subtitle: "Kontaktieren Sie unser Team für Ihr Wüstenabenteuer",
      getInTouch: "Kontakt Aufnehmen",
      contactInfo: "Kontaktinformationen",
      phone: "Telefon",
      email: "E-Mail",
      address: "Adresse",
      hours: "Geschäftszeiten",
      form: {
        name: "Vollständiger Name",
        namePlaceholder: "Geben Sie Ihren vollständigen Namen ein",
        email: "E-Mail-Adresse",
        emailPlaceholder: "Geben Sie Ihre E-Mail-Adresse ein",
        phone: "Telefonnummer",
        phonePlaceholder: "Geben Sie Ihre Telefonnummer ein",
        subject: "Betreff",
        subjectPlaceholder: "Womit können wir Ihnen helfen?",
        message: "Nachricht",
        messagePlaceholder: "Erzählen Sie uns von Ihrem Traum-Wüstenerlebnis...",
        submit: "Nachricht Senden",
        submitting: "Senden..."
      },
      contactMethods: [
        {
          icon: Phone,
          title: "Rufen Sie Uns An",
          value: siteSettings?.contact_details?.phone || "+216 12 345 678",
          description: "Mo-Fr 9-18 Uhr GMT+1"
        },
        {
          icon: Mail,
          title: "E-Mail Senden",
          value: siteSettings?.contact_details?.email || "info@sghayratours.com",
          description: "Wir antworten innerhalb von 24 Stunden"
        },
        {
          icon: Clock,
          title: "Geschäftszeiten",
          value: "9:00 - 18:00 Uhr",
          description: "Montag bis Freitag (GMT+1)"
        }
      ],
      successMessage: "Nachricht erfolgreich gesendet! Wir melden uns bald bei Ihnen.",
      errorMessage: "Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut."
    },
    ar: {
      title: "اتصل بسغايرة تورز",
      subtitle: "تواصل مع فريقنا لمغامرتك في الصحراء",
      getInTouch: "تواصل معنا",
      contactInfo: "معلومات الاتصال",
      phone: "الهاتف",
      email: "البريد الإلكتروني",
      address: "العنوان",
      hours: "ساعات العمل",
      form: {
        name: "الاسم الكامل",
        namePlaceholder: "أدخل اسمك الكامل",
        email: "عنوان البريد الإلكتروني",
        emailPlaceholder: "أدخل عنوان بريدك الإلكتروني",
        phone: "رقم الهاتف",
        phonePlaceholder: "أدخل رقم هاتفك",
        subject: "الموضوع",
        subjectPlaceholder: "كيف يمكننا مساعدتك؟",
        message: "الرسالة",
        messagePlaceholder: "أخبرنا عن تجربة أحلامك في الصحراء...",
        submit: "إرسال الرسالة",
        submitting: "جاري الإرسال..."
      },
      contactMethods: [
        {
          icon: Phone,
          title: "اتصل بنا",
          value: siteSettings?.contact_details?.phone || "+216 12 345 678",
          description: "الإثنين-الجمعة 9ص-6م GMT+1"
        },
        {
          icon: Mail,
          title: "راسلنا",
          value: siteSettings?.contact_details?.email || "info@sghayratours.com",
          description: "سنرد خلال 24 ساعة"
        },
        {
          icon: Clock,
          title: "ساعات العمل",
          value: "9:00 ص - 6:00 م",
          description: "الإثنين إلى الجمعة (GMT+1)"
        }
      ],
      successMessage: "تم إرسال الرسالة بنجاح! سنتواصل معك قريباً.",
      errorMessage: "فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى."
    }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success!",
        description: t.successMessage,
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      toast({
        title: "Error",
        description: t.errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            {t.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-8">
              {t.contactInfo}
            </h2>
            
            <div className="space-y-6">
              {t.contactMethods.map((method, index) => (
                <Card key={index} className="hover-elevate">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <method.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {method.title}
                        </h3>
                        <p className="text-lg text-foreground font-medium">
                          {method.value}
                        </p>
                        <p className="text-muted-foreground">
                          {method.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Location Display */}
              {siteSettings?.location_info && siteSettings.location_info.isActive && siteSettings.location_info.displayOnContact && (
                <LocationDisplay
                  locationInfo={siteSettings.location_info}
                  language={currentLanguage as 'en' | 'fr' | 'de' | 'ar'}
                  variant="full"
                  className="mt-6"
                />
              )}
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{t.getInTouch}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        {t.form.name}
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder={t.form.namePlaceholder}
                        required
                        data-testid="input-contact-name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        {t.form.email}
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder={t.form.emailPlaceholder}
                        required
                        data-testid="input-contact-email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        {t.form.phone}
                      </label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder={t.form.phonePlaceholder}
                        data-testid="input-contact-phone"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        {t.form.subject}
                      </label>
                      <Input
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        placeholder={t.form.subjectPlaceholder}
                        required
                        data-testid="input-contact-subject"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      {t.form.message}
                    </label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder={t.form.messagePlaceholder}
                      rows={6}
                      required
                      data-testid="textarea-contact-message"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                    data-testid="button-contact-submit"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t.form.submitting}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {t.form.submit}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {currentLanguage === 'en' && 'Find Us in Douz'}
                {currentLanguage === 'fr' && 'Trouvez-nous à Douz'}
                {currentLanguage === 'de' && 'Finden Sie uns in Douz'}
                {currentLanguage === 'ar' && 'اعثر علينا في دوز'}
              </CardTitle>
              <p className="text-muted-foreground">
                {currentLanguage === 'en' && 'Visit us at our location in the gateway to the Sahara Desert'}
                {currentLanguage === 'fr' && 'Visitez-nous à notre emplacement à la porte du désert du Sahara'}
                {currentLanguage === 'de' && 'Besuchen Sie uns an unserem Standort am Tor zur Sahara-Wüste'}
                {currentLanguage === 'ar' && 'قم بزيارتنا في موقعنا في بوابة الصحراء الكبرى'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Douz, Kebili Governorate, Tunisia</span>
              </div>
              <LocationMap
                latitude={33.4511}
                longitude={9.0322}
                zoom={13}
                height="450px"
                markerText="Sghayra Tours - Douz, Tunisia"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}