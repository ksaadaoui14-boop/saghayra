import { MapPin, Phone, Mail, Facebook, Instagram, Youtube } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface FooterProps {
  currentLanguage: string;
}

export default function Footer({ currentLanguage }: FooterProps) {
  const isRTL = currentLanguage === 'ar';

  const translations = {
    en: {
      tagline: "Authentic Desert Adventures",
      quickLinks: "Quick Links",
      activities: "Activities", 
      gallery: "Gallery",
      about: "About Us",
      contact: "Contact",
      admin: "Admin",
      contactInfo: "Contact Information",
      address: "Douz, Kebili Governorate, Tunisia",
      followUs: "Follow Us",
      copyright: "© 2024 Sghayra Tours. All rights reserved.",
      links: {
        home: "Home",
        activities: "Our Activities",
        gallery: "Photo Gallery", 
        about: "About Sghayra Tours",
        contact: "Get in Touch",
        admin: "Admin Dashboard"
      }
    },
    fr: {
      tagline: "Aventures Authentiques du Désert",
      quickLinks: "Liens Rapides",
      activities: "Activités",
      gallery: "Galerie", 
      about: "À Propos",
      contact: "Contact",
      admin: "Admin",
      contactInfo: "Informations de Contact",
      address: "Douz, Gouvernorat de Kebili, Tunisie",
      followUs: "Suivez-Nous", 
      copyright: "© 2024 Sghayra Tours. Tous droits réservés.",
      links: {
        home: "Accueil",
        activities: "Nos Activités", 
        gallery: "Galerie Photos",
        about: "À Propos de Sghayra Tours",
        contact: "Nous Contacter",
        admin: "Tableau de Bord Admin"
      }
    },
    de: {
      tagline: "Authentische Wüstenabenteuer",
      quickLinks: "Schnelllinks",
      activities: "Aktivitäten",
      gallery: "Galerie",
      about: "Über Uns", 
      contact: "Kontakt",
      admin: "Admin",
      contactInfo: "Kontaktinformationen",
      address: "Douz, Gouvernement Kebili, Tunesien",
      followUs: "Folgen Sie Uns",
      copyright: "© 2024 Sghayra Tours. Alle Rechte vorbehalten.", 
      links: {
        home: "Startseite",
        activities: "Unsere Aktivitäten",
        gallery: "Fotogalerie",
        about: "Über Sghayra Tours", 
        contact: "Kontakt Aufnehmen",
        admin: "Admin Dashboard"
      }
    },
    ar: {
      tagline: "مغامرات صحراوية أصيلة",
      quickLinks: "روابط سريعة", 
      activities: "الأنشطة",
      gallery: "المعرض",
      about: "من نحن",
      contact: "اتصل بنا",
      admin: "الإدارة",
      contactInfo: "معلومات الاتصال",
      address: "دوز، ولاية قبلي، تونس",
      followUs: "تابعنا",
      copyright: "© 2024 سغيرة تورز. جميع الحقوق محفوظة.",
      links: {
        home: "الرئيسية",
        activities: "أنشطتنا", 
        gallery: "معرض الصور",
        about: "حول سغيرة تورز",
        contact: "تواصل معنا", 
        admin: "لوحة الإدارة"
      }
    }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;

  const socialLinks = [
    { icon: Facebook, href: "#", name: "Facebook" },
    { icon: Instagram, href: "#", name: "Instagram" }, 
    { icon: Youtube, href: "#", name: "YouTube" },
  ];

  const quickLinks = [
    { name: t.links.home, href: "/" },
    { name: t.links.activities, href: "/activities" },
    { name: t.links.gallery, href: "/gallery" },
    { name: t.links.about, href: "/about" },
    { name: t.links.contact, href: "/contact" },
    { name: t.links.admin, href: "/admin" },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 ${isRTL ? 'text-right' : ''}`}>
          {/* Brand */}
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-serif font-bold text-primary">Sghayra Tours</h3>
              <p className="text-muted-foreground">{t.tagline}</p>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              Experience the authentic beauty of the Tunisian Sahara with our expert local guides and traditional Berber hospitality.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">{t.quickLinks}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <Button 
                      variant="ghost" 
                      className={`p-0 h-auto text-muted-foreground hover:text-primary ${isRTL ? 'justify-end' : 'justify-start'}`}
                      data-testid={`link-footer-${link.href.slice(1) || 'home'}`}
                    >
                      {link.name}
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">{t.contactInfo}</h4>
            <div className="space-y-3">
              <div className={`flex items-center space-x-3 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{t.address}</span>
              </div>
              <div className={`flex items-center space-x-3 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">+216 XX XXX XXX</span>
              </div>
              <div className={`flex items-center space-x-3 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">info@sghayratours.com</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">{t.followUs}</h4>
            <div className={`flex space-x-4 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {socialLinks.map((social) => (
                <Button
                  key={social.name}
                  variant="outline"
                  size="icon"
                  className="hover:bg-primary hover:text-primary-foreground"
                  onClick={() => console.log(`Visit ${social.name}`)}
                  data-testid={`link-social-${social.name.toLowerCase()}`}
                >
                  <social.icon className="w-5 h-5" />
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={`mt-12 pt-8 border-t border-border text-center ${isRTL ? 'text-right' : ''}`}>
          <p className="text-sm text-muted-foreground">{t.copyright}</p>
        </div>
      </div>
    </footer>
  );
}