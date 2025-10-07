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
  Mail
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Activity } from "@shared/schema";
import { LocationMap } from "@/components/LocationMap";

interface ActivityDetailProps {
  activityId: string;
  currentLanguage: string;
  currentCurrency: string;
}

// Form validation schema
const bookingSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email address"),
  customerPhone: z.string().optional(),
  bookingDate: z.string().min(1, "Please select a booking date"),
  groupSize: z.coerce.number().min(1, "Group size must be at least 1").max(20, "Group size cannot exceed 20"),
  specialRequests: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function ActivityDetail({ activityId, currentLanguage, currentCurrency }: ActivityDetailProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const currencySymbols = { TND: "د.ت", USD: "$", EUR: "€" };
  const currencySymbol = currencySymbols[currentCurrency as keyof typeof currencySymbols];

  // Form setup
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      bookingDate: "",
      groupSize: 2,
      specialRequests: "",
    },
  });

  // Fetch activity details
  const { data: activity, isLoading, error } = useQuery({
    queryKey: ['/api/activities', activityId],
    queryFn: async () => {
      const response = await fetch(`/api/activities/${activityId}`);
      if (!response.ok) throw new Error('Failed to fetch activity');
      return await response.json() as Activity;
    },
    enabled: !!activityId,
  });

  // Fetch gallery items for this activity
  const { data: galleryItems = [] } = useQuery({
    queryKey: ['/api/gallery'],
    select: (data: any[]) => {
      return data.filter(item => 
        item.category === activity?.category || 
        item.category === 'general'
      ).slice(0, 6); // Show max 6 gallery images
    },
    enabled: !!activity,
  });

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
          activityId,
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
      setShowBookingForm(false);
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

  // Translations
  const translations = {
    en: {
      duration: "Duration",
      groupSize: "Group Size",
      capacity: "Max Capacity",
      price: "Price",
      perPerson: "per person",
      bookNow: "Book Now",
      highlights: "Highlights",
      description: "Description",
      gallery: "Gallery",
      location: "Activity Location",
      viewOnMap: "View on Map",
      bookingForm: "Book This Experience",
      customerName: "Full Name",
      customerEmail: "Email Address",
      customerPhone: "Phone Number (Optional)",
      bookingDate: "Preferred Date",
      specialRequests: "Special Requests (Optional)",
      submitBooking: "Confirm Booking",
      cancel: "Cancel",
      backToActivities: "Back to Activities",
      bookingSuccess: "Booking Confirmed!",
      bookingSuccessMessage: "Thank you for your booking! You will receive a confirmation email shortly.",
      contactInfo: "Contact Information",
      notFound: "Activity not found",
      loadingError: "Failed to load activity details",
    },
    fr: {
      duration: "Durée",
      groupSize: "Taille du Groupe",
      capacity: "Capacité Max",
      price: "Prix",
      perPerson: "par personne",
      bookNow: "Réserver",
      highlights: "Points Forts",
      description: "Description",
      gallery: "Galerie",
      location: "Lieu de l'Activité",
      viewOnMap: "Voir sur la Carte",
      bookingForm: "Réserver cette Expérience",
      customerName: "Nom Complet",
      customerEmail: "Adresse Email",
      customerPhone: "Numéro de Téléphone (Optionnel)",
      bookingDate: "Date Préférée",
      specialRequests: "Demandes Spéciales (Optionnel)",
      submitBooking: "Confirmer la Réservation",
      cancel: "Annuler",
      backToActivities: "Retour aux Activités",
      bookingSuccess: "Réservation Confirmée!",
      bookingSuccessMessage: "Merci pour votre réservation! Vous recevrez un email de confirmation sous peu.",
      contactInfo: "Informations de Contact",
      notFound: "Activité non trouvée",
      loadingError: "Échec du chargement des détails de l'activité",
    },
    de: {
      duration: "Dauer",
      groupSize: "Gruppengröße",
      capacity: "Max. Kapazität",
      price: "Preis",
      perPerson: "pro Person",
      bookNow: "Jetzt Buchen",
      highlights: "Highlights",
      description: "Beschreibung",
      gallery: "Galerie",
      location: "Aktivitätsort",
      viewOnMap: "Auf Karte Anzeigen",
      bookingForm: "Diese Erfahrung Buchen",
      customerName: "Vollständiger Name",
      customerEmail: "E-Mail-Adresse",
      customerPhone: "Telefonnummer (Optional)",
      bookingDate: "Bevorzugtes Datum",
      specialRequests: "Spezielle Wünsche (Optional)",
      submitBooking: "Buchung Bestätigen",
      cancel: "Stornieren",
      backToActivities: "Zurück zu Aktivitäten",
      bookingSuccess: "Buchung Bestätigt!",
      bookingSuccessMessage: "Vielen Dank für Ihre Buchung! Sie erhalten in Kürze eine Bestätigungs-E-Mail.",
      contactInfo: "Kontaktinformationen",
      notFound: "Aktivität nicht gefunden",
      loadingError: "Fehler beim Laden der Aktivitätsdetails",
    },
    ar: {
      duration: "المدة",
      groupSize: "حجم المجموعة",
      capacity: "السعة القصوى",
      price: "السعر",
      perPerson: "للشخص الواحد",
      bookNow: "احجز الآن",
      highlights: "المميزات",
      description: "الوصف",
      gallery: "المعرض",
      location: "موقع النشاط",
      viewOnMap: "عرض على الخريطة",
      bookingForm: "احجز هذه التجربة",
      customerName: "الاسم الكامل",
      customerEmail: "عنوان البريد الإلكتروني",
      customerPhone: "رقم الهاتف (اختياري)",
      bookingDate: "التاريخ المفضل",
      specialRequests: "طلبات خاصة (اختياري)",
      submitBooking: "تأكيد الحجز",
      cancel: "إلغاء",
      backToActivities: "العودة إلى الأنشطة",
      bookingSuccess: "تم تأكيد الحجز!",
      bookingSuccessMessage: "شكرًا لك على حجزك! ستتلقى رسالة تأكيد عبر البريد الإلكتروني قريبًا.",
      contactInfo: "معلومات الاتصال",
      notFound: "النشاط غير موجود",
      loadingError: "فشل في تحميل تفاصيل النشاط",
    },
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading activity details...</p>
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold">{t.notFound}</h2>
          <p className="text-muted-foreground">{t.loadingError}</p>
          <Button onClick={() => setLocation("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToActivities}
          </Button>
        </div>
      </div>
    );
  }

  const title = getLocalizedText(activity.title);
  const description = getLocalizedText(activity.description);
  const highlights = getLocalizedText(activity.highlights) || [];
  const price = (activity.prices as any)[currentCurrency] || (activity.prices as any).USD;

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto p-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold text-green-600">{t.bookingSuccess}</h2>
          <p className="text-muted-foreground">{t.bookingSuccessMessage}</p>
          <div className="space-y-2">
            <Button onClick={() => setLocation("/")} className="w-full">
              {t.backToActivities}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setBookingSuccess(false)} 
              className="w-full"
            >
              View Activity Details
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToActivities}
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{title}</h1>
              <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>Douz, Tunisia</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.9 (120+ reviews)</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {currencySymbol}{price}
              </div>
              <div className="text-sm text-muted-foreground">{t.perPerson}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <img 
                src={activity.imageUrl || "/api/placeholder/800/400"} 
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>{t.description}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{description}</p>
              </CardContent>
            </Card>

            {/* Highlights */}
            {highlights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t.highlights}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {highlights.map((highlight: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Gallery */}
            {galleryItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t.gallery}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {galleryItems.map((item: any) => (
                      <div key={item.id} className="aspect-square bg-muted rounded-lg overflow-hidden">
                        <img 
                          src={item.url} 
                          alt={getLocalizedText(item.title)}
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location Map */}
            {activity.latitude && activity.longitude && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    {t.location}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LocationMap
                    latitude={parseFloat(activity.latitude)}
                    longitude={parseFloat(activity.longitude)}
                    zoom={14}
                    height="400px"
                    markerText={title}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activity Info */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{t.duration}</div>
                    <div className="text-sm text-muted-foreground">{activity.duration}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{t.groupSize}</div>
                    <div className="text-sm text-muted-foreground">{activity.groupSize}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{t.capacity}: {activity.capacity}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Booking Card */}
            {!showBookingForm ? (
              <Card>
                <CardContent className="p-6">
                  <Button 
                    onClick={() => setShowBookingForm(true)} 
                    className="w-full"
                    size="lg"
                    data-testid="button-book-now"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {t.bookNow}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{t.bookingForm}</CardTitle>
                  <CardDescription>
                    {currencySymbol}{price} {t.perPerson}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                          {Array.from({ length: Math.min(activity.capacity, 20) }, (_, i) => i + 1).map((num) => (
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

                    <div>
                      <Label htmlFor="specialRequests">{t.specialRequests}</Label>
                      <Textarea
                        id="specialRequests"
                        {...form.register("specialRequests")}
                        rows={3}
                        data-testid="textarea-special-requests"
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowBookingForm(false)}
                        className="flex-1"
                      >
                        {t.cancel}
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={bookingMutation.isPending}
                        className="flex-1"
                        data-testid="button-submit-booking"
                      >
                        {bookingMutation.isPending ? 
                          "Booking..." : 
                          `${t.submitBooking} (${currencySymbol}${(price * form.watch("groupSize")).toFixed(2)})`
                        }
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>{t.contactInfo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">+216 XX XXX XXX</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">info@sghayratours.com</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}