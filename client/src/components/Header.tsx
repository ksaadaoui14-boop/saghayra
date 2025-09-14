import { useState } from "react";
import { Link } from "wouter";
import { Menu, X, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSelector from "./LanguageSelector";
import CurrencySelector from "./CurrencySelector";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  currentLanguage: string;
  currentCurrency: string;
  onLanguageChange: (language: string) => void;
  onCurrencyChange: (currency: string) => void;
}

export default function Header({ 
  currentLanguage, 
  currentCurrency, 
  onLanguageChange, 
  onCurrencyChange 
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Activities", href: "/activities" },
    { name: "Gallery", href: "/gallery" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      {/* Top bar */}
      <div className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2 text-sm">
            <div className="hidden md:flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Phone className="w-3 h-3" />
                <span>+216 XX XXX XXX</span>
              </div>
              <div className="flex items-center space-x-1">
                <Mail className="w-3 h-3" />
                <span>info@sghayratours.com</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>Douz, Tunisia</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <LanguageSelector 
                currentLanguage={currentLanguage} 
                onLanguageChange={onLanguageChange} 
              />
              <CurrencySelector 
                currentCurrency={currentCurrency} 
                onCurrencyChange={onCurrencyChange} 
              />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/">
            <div className="flex items-center space-x-2 hover-elevate rounded-md px-2 py-1">
              <div className="text-2xl font-serif font-bold text-primary">
                Sghayra Tours
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                Authentic Desert Adventures
              </div>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button variant="ghost" className="text-foreground hover:text-primary">
                  {item.name}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Book Now button */}
          <div className="hidden md:flex items-center space-x-4">
            <Button data-testid="button-book-now" className="bg-primary hover:bg-primary/90">
              Book Now
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border">
          <div className="px-4 py-4 space-y-4">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-foreground hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
            <Button className="w-full bg-primary hover:bg-primary/90" data-testid="button-book-now-mobile">
              Book Now
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}