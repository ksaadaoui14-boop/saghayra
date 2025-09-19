import { useState } from "react";
import { Calendar, Users, Clock, CreditCard, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface BookingWidgetProps {
  currentLanguage: string;
  currentCurrency: string;
}

const activities = [
  { id: "camel-2day", name: "2-Day Camel Trek", price: { TND: 180, USD: 60, EUR: 55 }, duration: "2 days" },
  { id: "camel-3day", name: "3-Day Desert Adventure", price: { TND: 270, USD: 90, EUR: 82 }, duration: "3 days" },
  { id: "camel-5day", name: "5-Day Sahara Journey", price: { TND: 450, USD: 150, EUR: 137 }, duration: "5 days" },
  { id: "desert-dinner", name: "Desert Dinner Experience", price: { TND: 75, USD: 25, EUR: 23 }, duration: "Evening" },
  { id: "cultural-day", name: "Cultural Activities Day", price: { TND: 120, USD: 40, EUR: 37 }, duration: "Full day" },
];

const currencySymbols = {
  TND: "د.ت",
  USD: "$", 
  EUR: "€"
};

export default function BookingWidget({ currentLanguage, currentCurrency }: BookingWidgetProps) {
  const [selectedActivity, setSelectedActivity] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [groupSize, setGroupSize] = useState(2);
  const [step, setStep] = useState(1);

  const selectedActivityData = activities.find(a => a.id === selectedActivity);
  const totalPrice = selectedActivityData ? selectedActivityData.price[currentCurrency as keyof typeof selectedActivityData.price] * groupSize : 0;
  const depositAmount = Math.round(totalPrice * 0.1);

  const translations = {
    en: {
      title: "Book Your Desert Adventure",
      selectActivity: "Select Activity", 
      selectDate: "Select Date",
      groupSize: "Group Size",
      people: "people",
      totalPrice: "Total Price",
      deposit: "Deposit Required (10%)",
      bookNow: "Book Now",
      payDeposit: "Pay Deposit",
      nextStep: "Next Step",
      contactWhatsApp: "Contact WhatsApp"
    },
    fr: {
      title: "Réservez Votre Aventure Désertique",
      selectActivity: "Sélectionner l'Activité",
      selectDate: "Sélectionner la Date", 
      groupSize: "Taille du Groupe",
      people: "personnes",
      totalPrice: "Prix Total",
      deposit: "Acompte Requis (10%)",
      bookNow: "Réserver Maintenant",
      payDeposit: "Payer l'Acompte",
      nextStep: "Étape Suivante",
      contactWhatsApp: "Contacter WhatsApp"
    },
    de: {
      title: "Buchen Sie Ihr Wüstenabenteuer",
      selectActivity: "Aktivität Auswählen",
      selectDate: "Datum Auswählen",
      groupSize: "Gruppengröße", 
      people: "Personen",
      totalPrice: "Gesamtpreis",
      deposit: "Anzahlung Erforderlich (10%)",
      bookNow: "Jetzt Buchen",
      payDeposit: "Anzahlung Bezahlen",
      nextStep: "Nächster Schritt",
      contactWhatsApp: "WhatsApp Kontakt"
    },
    ar: {
      title: "احجز مغامرتك الصحراوية",
      selectActivity: "اختر النشاط",
      selectDate: "اختر التاريخ",
      groupSize: "حجم المجموعة",
      people: "أشخاص", 
      totalPrice: "السعر الإجمالي",
      deposit: "عربون مطلوب (10%)",
      bookNow: "احجز الآن",
      payDeposit: "ادفع العربون",
      nextStep: "الخطوة التالية",
      contactWhatsApp: "تواصل واتساب"
    }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;
  const isRTL = currentLanguage === 'ar';

  const handleBooking = () => {
    console.log('Booking submitted:', {
      activity: selectedActivity,
      date: selectedDate,
      groupSize,
      totalPrice,
      depositAmount,
      currency: currentCurrency
    });
    alert(`Booking submitted! Total: ${currencySymbols[currentCurrency as keyof typeof currencySymbols]}${totalPrice}, Deposit: ${currencySymbols[currentCurrency as keyof typeof currencySymbols]}${depositAmount}`);
  };

  const handleWhatsAppContact = () => {
    const whatsappUrl = "https://wa.me/21640676420";
    window.open(whatsappUrl, '_blank');
    console.log('WhatsApp contact opened');
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className={`text-xl font-semibold ${isRTL ? 'text-right' : ''}`}>
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step 1: Select Activity */}
        <div className="space-y-3">
          <Label htmlFor="activity" className={isRTL ? 'text-right block' : ''}>{t.selectActivity}</Label>
          <Select value={selectedActivity} onValueChange={setSelectedActivity}>
            <SelectTrigger data-testid="select-activity">
              <SelectValue placeholder={t.selectActivity} />
            </SelectTrigger>
            <SelectContent>
              {activities.map((activity) => (
                <SelectItem key={activity.id} value={activity.id}>
                  <div className="flex justify-between items-center w-full">
                    <span>{activity.name}</span>
                    <span className="ml-4 text-muted-foreground">
                      {currencySymbols[currentCurrency as keyof typeof currencySymbols]}
                      {activity.price[currentCurrency as keyof typeof activity.price]}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedActivity && (
          <>
            {/* Step 2: Select Date */}
            <div className="space-y-3">
              <Label className={isRTL ? 'text-right block' : ''}>{t.selectDate}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start" data-testid="button-select-date">
                    <Calendar className="w-4 h-4 mr-2" />
                    {selectedDate ? selectedDate.toLocaleDateString() : t.selectDate}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Step 3: Group Size */}
            <div className="space-y-3">
              <Label className={isRTL ? 'text-right block' : ''}>
                {t.groupSize} ({t.people})
              </Label>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGroupSize(Math.max(1, groupSize - 1))}
                  disabled={groupSize <= 1}
                  data-testid="button-decrease-group-size"
                >
                  -
                </Button>
                <span className="px-4 py-2 border rounded text-center min-w-16" data-testid="text-group-size">
                  {groupSize}
                </span>
                <Button
                  variant="outline"
                  size="sm" 
                  onClick={() => setGroupSize(Math.min(20, groupSize + 1))}
                  disabled={groupSize >= 20}
                  data-testid="button-increase-group-size"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Price Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="font-medium">{t.totalPrice}:</span>
                <span className="font-bold text-lg" data-testid="text-total-price">
                  {currencySymbols[currentCurrency as keyof typeof currencySymbols]}{totalPrice}
                </span>
              </div>
              <div className={`flex justify-between items-center text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{t.deposit}:</span>
                <span data-testid="text-deposit-amount">
                  {currencySymbols[currentCurrency as keyof typeof currencySymbols]}{depositAmount}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                className="w-full bg-primary hover:bg-primary/90" 
                onClick={handleBooking}
                disabled={!selectedDate || !selectedActivity}
                data-testid="button-book-activity"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {t.payDeposit}
              </Button>
              
              <Button 
                variant="outline"
                className="w-full"
                onClick={handleWhatsAppContact}
                data-testid="button-whatsapp-contact"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {t.contactWhatsApp}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}