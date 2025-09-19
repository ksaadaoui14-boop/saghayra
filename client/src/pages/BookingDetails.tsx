import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  MapPin, 
  Star, 
  Calendar, 
  CreditCard,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Shield,
  FileText,
  Globe
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSiteSettings } from "@/hooks/use-site-settings";
import type { Activity } from "@shared/schema";

interface BookingDetailsProps {
  currentLanguage: string;
  currentCurrency: string;
}

// Form validation schema
const bookingSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email address"),
  customerPhone: z.string().optional(),
  activityId: z.string().min(1, "Please select an activity"),
  bookingDate: z.string().min(1, "Please select a booking date"),
  groupSize: z.coerce.number().min(1, "Group size must be at least 1").max(20, "Group size cannot exceed 20"),
  specialRequests: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookingDetails({ currentLanguage, currentCurrency }: BookingDetailsProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState("");

  const { data: settings } = useSiteSettings();
  const currencySymbols = { TND: "د.ت", USD: "$", EUR: "€" };
  const currencySymbol = currencySymbols[currentCurrency as keyof typeof currencySymbols];

  // Check if booking is enabled
  const isBookingEnabled = settings?.booking_info?.isBookingEnabled ?? true;

  // Form setup
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      activityId: "",
      bookingDate: "",
      groupSize: 2,
      specialRequests: "",
    },
  });

  // Fetch activities
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['/api/activities'],
    select: (data: Activity[]) => data.filter(activity => activity.isActive),
  });

  // Get selected activity details
  const selectedActivity = activities.find(activity => activity.id === selectedActivityId);

  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: async (bookingData: BookingFormData) => {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingData,
          currency: currentCurrency,
          language: currentLanguage,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      setBookingSuccess(true);
      setBookingId(data.id);
      form.reset();
      
      toast({
        title: "Booking Confirmed!",
        description: `Your booking has been created. Booking ID: ${data.id}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleActivitySelect = (activityId: string) => {
    setSelectedActivityId(activityId);
    form.setValue("activityId", activityId);
  };

  const handleSubmit = (data: BookingFormData) => {
    bookingMutation.mutate(data);
  };

  const getLocalizedText = (textObj: any, fallback = "") => {
    if (!textObj) return fallback;
    return textObj[currentLanguage as keyof typeof textObj] || textObj.en || fallback;
  };

  const getMinBookingDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const calculateTotalPrice = () => {
    if (!selectedActivity) return 0;
    const price = (selectedActivity.prices as any)[currentCurrency] || (selectedActivity.prices as any).USD;
    return price * form.watch("groupSize");
  };

  const calculateDepositAmount = () => {
    const depositPercentage = settings?.booking_info?.depositPercentage || 10;
    return Math.round(calculateTotalPrice() * (depositPercentage / 100));
  };

  // Helper to get policy text from admin settings or fallback to translations
  const getPolicyText = (policyType: 'cancellationPolicy' | 'termsAndConditions' | 'privacyPolicy', fallback: string) => {
    if (settings?.booking_info?.[policyType]) {
      return getLocalizedText(settings.booking_info[policyType], fallback);
    }
    return fallback;
  };

  const getDepositText = () => {
    const percentage = settings?.booking_info?.depositPercentage || 10;
    const translations = {
      en: `Only ${percentage}% deposit required to secure your booking`,
      fr: `Seulement ${percentage}% d'acompte requis pour sécuriser votre réservation`,
      de: `Nur ${percentage}% Anzahlung erforderlich, um Ihre Buchung zu sichern`,
      ar: `يُطلب ${percentage}% فقط كدفعة مقدمة لتأمين حجزك`
    };
    return translations[currentLanguage as keyof typeof translations] || translations.en;
  };

  // Translations
  const translations = {
    en: {
      title: "Book Your Desert Adventure",
      subtitle: "Choose your activity and reserve your spot",
      selectActivity: "Select Activity",
      activityDetails: "Activity Details",
      duration: "Duration",
      groupSize: "Group Size",
      capacity: "Max Capacity",
      price: "Price",
      perPerson: "per person",
      customerInfo: "Customer Information",
      customerName: "Full Name",
      customerEmail: "Email Address",
      customerPhone: "Phone Number (Optional)",
      bookingDate: "Preferred Date",
      specialRequests: "Special Requests (Optional)",
      totalPrice: "Total Price",
      depositRequired: "Deposit Required (10%)",
      submitBooking: "Confirm Booking",
      bookingSuccess: "Booking Confirmed!",
      bookingSuccessMessage: "Thank you for your booking! You will receive a confirmation email shortly.",
      bookingId: "Booking ID",
      backToHome: "Back to Home",
      contactInfo: "Contact Information",
      bookingPolicies: "Booking Policies",
      cancellationPolicy: "Free cancellation up to 24 hours before the trip",
      paymentPolicy: "Only 10% deposit required to secure your booking",
      safetyPolicy: "All activities are conducted with professional guides",
      languageSupport: "Multilingual guide support available",
      viewBooking: "View Booking Details",
      noActivities: "No activities available",
      loadingActivities: "Loading available activities...",
    },
    fr: {
      title: "Réservez Votre Aventure Désertique",
      subtitle: "Choisissez votre activité et réservez votre place",
      selectActivity: "Sélectionner une Activité",
      activityDetails: "Détails de l'Activité",
      duration: "Durée",
      groupSize: "Taille du Groupe",
      capacity: "Capacité Max",
      price: "Prix",
      perPerson: "par personne",
      customerInfo: "Informations Client",
      customerName: "Nom Complet",
      customerEmail: "Adresse Email",
      customerPhone: "Numéro de Téléphone (Optionnel)",
      bookingDate: "Date Préférée",
      specialRequests: "Demandes Spéciales (Optionnel)",
      totalPrice: "Prix Total",
      depositRequired: "Acompte Requis (10%)",
      submitBooking: "Confirmer la Réservation",
      bookingSuccess: "Réservation Confirmée!",
      bookingSuccessMessage: "Merci pour votre réservation! Vous recevrez un email de confirmation sous peu.",
      bookingId: "ID de Réservation",
      backToHome: "Retour à l'Accueil",
      contactInfo: "Informations de Contact",
      bookingPolicies: "Politiques de Réservation",
      cancellationPolicy: "Annulation gratuite jusqu'à 24 heures avant le voyage",
      paymentPolicy: "Seulement 10% d'acompte requis pour sécuriser votre réservation",
      safetyPolicy: "Toutes les activités sont menées avec des guides professionnels",
      languageSupport: "Support de guide multilingue disponible",
      viewBooking: "Voir les Détails de la Réservation",
      noActivities: "Aucune activité disponible",
      loadingActivities: "Chargement des activités disponibles...",
    },
    de: {
      title: "Buchen Sie Ihr Wüstenabenteuer",
      subtitle: "Wählen Sie Ihre Aktivität und reservieren Sie Ihren Platz",
      selectActivity: "Aktivität Auswählen",
      activityDetails: "Aktivitätsdetails",
      duration: "Dauer",
      groupSize: "Gruppengröße",
      capacity: "Max. Kapazität",
      price: "Preis",
      perPerson: "pro Person",
      customerInfo: "Kundeninformationen",
      customerName: "Vollständiger Name",
      customerEmail: "E-Mail-Adresse",
      customerPhone: "Telefonnummer (Optional)",
      bookingDate: "Bevorzugtes Datum",
      specialRequests: "Spezielle Wünsche (Optional)",
      totalPrice: "Gesamtpreis",
      depositRequired: "Anzahlung Erforderlich (10%)",
      submitBooking: "Buchung Bestätigen",
      bookingSuccess: "Buchung Bestätigt!",
      bookingSuccessMessage: "Vielen Dank für Ihre Buchung! Sie erhalten in Kürze eine Bestätigungs-E-Mail.",
      bookingId: "Buchungs-ID",
      backToHome: "Zurück zur Startseite",
      contactInfo: "Kontaktinformationen",
      bookingPolicies: "Buchungsrichtlinien",
      cancellationPolicy: "Kostenlose Stornierung bis 24 Stunden vor der Reise",
      paymentPolicy: "Nur 10% Anzahlung erforderlich, um Ihre Buchung zu sichern",
      safetyPolicy: "Alle Aktivitäten werden mit professionellen Führern durchgeführt",
      languageSupport: "Mehrsprachige Führungsunterstützung verfügbar",
      viewBooking: "Buchungsdetails Anzeigen",
      noActivities: "Keine Aktivitäten verfügbar",
      loadingActivities: "Verfügbare Aktivitäten werden geladen...",
    },
    ar: {
      title: "احجز مغامرتك الصحراوية",
      subtitle: "اختر نشاطك واحجز مكانك",
      selectActivity: "اختر النشاط",
      activityDetails: "تفاصيل النشاط",
      duration: "المدة",
      groupSize: "حجم المجموعة",
      capacity: "السعة القصوى",
      price: "السعر",
      perPerson: "للشخص الواحد",
      customerInfo: "معلومات العميل",
      customerName: "الاسم الكامل",
      customerEmail: "عنوان البريد الإلكتروني",
      customerPhone: "رقم الهاتف (اختياري)",
      bookingDate: "التاريخ المفضل",
      specialRequests: "طلبات خاصة (اختياري)",
      totalPrice: "السعر الإجمالي",
      depositRequired: "عربون مطلوب (10%)",
      submitBooking: "تأكيد الحجز",
      bookingSuccess: "تم تأكيد الحجز!",
      bookingSuccessMessage: "شكرًا لك على حجزك! ستتلقى رسالة تأكيد عبر البريد الإلكتروني قريبًا.",
      bookingId: "رقم الحجز",
      backToHome: "العودة للرئيسية",
      contactInfo: "معلومات الاتصال",
      bookingPolicies: "سياسات الحجز",
      cancellationPolicy: "إلغاء مجاني حتى 24 ساعة قبل الرحلة",
      paymentPolicy: "فقط 10% عربون مطلوب لتأمين حجزك",
      safetyPolicy: "جميع الأنشطة تُقام مع مرشدين محترفين",
      languageSupport: "دعم المرشد متعدد اللغات متاح",
      viewBooking: "عرض تفاصيل الحجز",
      noActivities: "لا توجد أنشطة متاحة",
      loadingActivities: "جاري تحميل الأنشطة المتاحة...",
    },
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;
  const isRTL = currentLanguage === 'ar';

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">{t.bookingSuccess}</h2>
              <p className="text-muted-foreground mb-4">{t.bookingSuccessMessage}</p>
              <div className="bg-muted p-3 rounded-lg">
                <div className="text-sm font-medium">{t.bookingId}</div>
                <div className="text-lg font-mono text-primary">{bookingId}</div>
              </div>
            </div>
            <div className="space-y-2">
              <Button onClick={() => setLocation("/")} className="w-full">
                {t.backToHome}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setBookingSuccess(false)} 
                className="w-full"
              >
                {t.viewBooking}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="mb-4"
            data-testid="button-back-home"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToHome}
          </Button>
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t.selectActivity}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">{t.loadingActivities}</p>
                  </div>
                ) : activities.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t.noActivities}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activities.map((activity) => {
                      const title = getLocalizedText(activity.title);
                      const price = (activity.prices as any)[currentCurrency] || (activity.prices as any).USD;
                      const isSelected = selectedActivityId === activity.id;
                      
                      return (
                        <Card 
                          key={activity.id}
                          className={`cursor-pointer transition-all hover-elevate ${isSelected ? 'ring-2 ring-primary' : ''}`}
                          onClick={() => handleActivitySelect(activity.id)}
                          data-testid={`card-activity-${activity.id}`}
                        >
                          <CardContent className="p-4">
                            <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-3">
                              <img 
                                src={activity.imageUrl || "/api/placeholder/300/200"} 
                                alt={title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <h3 className="font-semibold mb-2">{title}</h3>
                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {activity.duration}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {activity.groupSize}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-lg font-bold text-primary">
                                {currencySymbol}{price}
                              </div>
                              <Badge variant={isSelected ? "default" : "outline"}>
                                {isSelected ? "Selected" : "Select"}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Information Form */}
            {selectedActivity && isBookingEnabled && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {t.customerInfo}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customerName">{t.customerName}</Label>
                        <Input
                          id="customerName"
                          {...form.register("customerName")}
                          data-testid="input-customer-name"
                        />
                        {form.formState.errors.customerName && (
                          <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.customerName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="customerEmail">{t.customerEmail}</Label>
                        <Input
                          id="customerEmail"
                          type="email"
                          {...form.register("customerEmail")}
                          data-testid="input-customer-email"
                        />
                        {form.formState.errors.customerEmail && (
                          <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.customerEmail.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="customerPhone">{t.customerPhone}</Label>
                        <Input
                          id="customerPhone"
                          type="tel"
                          {...form.register("customerPhone")}
                          data-testid="input-customer-phone"
                        />
                      </div>

                      <div>
                        <Label htmlFor="bookingDate">{t.bookingDate}</Label>
                        <Input
                          id="bookingDate"
                          type="date"
                          min={getMinBookingDate()}
                          {...form.register("bookingDate")}
                          data-testid="input-booking-date"
                        />
                        {form.formState.errors.bookingDate && (
                          <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.bookingDate.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="groupSize">{t.groupSize}</Label>
                        <Select 
                          value={form.watch("groupSize").toString()} 
                          onValueChange={(value) => form.setValue("groupSize", parseInt(value))}
                        >
                          <SelectTrigger data-testid="select-group-size">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: Math.min(selectedActivity.capacity, 20) }, (_, i) => i + 1).map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 1 ? 'person' : 'people'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {form.formState.errors.groupSize && (
                          <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.groupSize.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="specialRequests">{t.specialRequests}</Label>
                      <Textarea
                        id="specialRequests"
                        {...form.register("specialRequests")}
                        rows={3}
                        data-testid="textarea-special-requests"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={bookingMutation.isPending}
                      className="w-full"
                      size="lg"
                      data-testid="button-submit-booking"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {bookingMutation.isPending ? 
                        "Processing..." : 
                        `${t.submitBooking} (${currencySymbol}${calculateTotalPrice().toFixed(2)})`
                      }
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Activity Details */}
            {selectedActivity && (
              <Card>
                <CardHeader>
                  <CardTitle>{t.activityDetails}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">{getLocalizedText(selectedActivity.title)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getLocalizedText(selectedActivity.description).substring(0, 100)}...
                    </p>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t.duration}</span>
                      <span className="text-sm font-medium">{selectedActivity.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t.capacity}</span>
                      <span className="text-sm font-medium">{selectedActivity.capacity} people</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t.price}</span>
                      <span className="text-sm font-medium">
                        {currencySymbol}{(selectedActivity.prices as any)[currentCurrency] || (selectedActivity.prices as any).USD} {t.perPerson}
                      </span>
                    </div>
                  </div>
                  
                  {form.watch("groupSize") > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{t.totalPrice}</span>
                          <span className="text-lg font-bold text-primary">
                            {currencySymbol}{calculateTotalPrice().toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>{t.depositRequired}</span>
                          <span className="font-medium text-green-600">
                            {currencySymbol}{calculateDepositAmount().toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Booking Disabled Message */}
            {selectedActivity && !isBookingEnabled && (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {currentLanguage === 'en' && "Booking Currently Unavailable"}
                    {currentLanguage === 'fr' && "Réservation Actuellement Indisponible"}
                    {currentLanguage === 'de' && "Buchung Derzeit Nicht Verfügbar"}
                    {currentLanguage === 'ar' && "الحجز غير متاح حاليا"}
                  </h3>
                  <p className="text-muted-foreground">
                    {currentLanguage === 'en' && "New bookings are temporarily disabled. Please contact us directly for assistance."}
                    {currentLanguage === 'fr' && "Les nouvelles réservations sont temporairement désactivées. Veuillez nous contacter directement pour assistance."}
                    {currentLanguage === 'de' && "Neue Buchungen sind vorübergehend deaktiviert. Bitte kontaktieren Sie uns direkt für Unterstützung."}
                    {currentLanguage === 'ar' && "الحجوزات الجديدة معطلة مؤقتا. يرجى الاتصال بنا مباشرة للمساعدة."}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  {t.contactInfo}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {settings?.booking_info?.contactPhone || settings?.contact_details?.phone || "+216 XX XXX XXX"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {settings?.booking_info?.contactEmail || settings?.contact_details?.email || "info@sghayratours.com"}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{getLocalizedText(settings?.contact_details?.address) || "Douz, Tunisia"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Booking Policies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {t.bookingPolicies}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">
                    {getPolicyText('cancellationPolicy', t.cancellationPolicy)}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="h-4 w-4 text-blue-500 mt-0.5" />
                  <span className="text-sm">
                    {getDepositText()}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-orange-500 mt-0.5" />
                  <span className="text-sm">
                    {getPolicyText('termsAndConditions', t.safetyPolicy)}
                  </span>
                </div>
                {settings?.booking_info?.bookingInstructions && getLocalizedText(settings.booking_info.bookingInstructions) && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-4 w-4 text-purple-500 mt-0.5" />
                    <span className="text-sm">
                      {getLocalizedText(settings.booking_info.bookingInstructions)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}