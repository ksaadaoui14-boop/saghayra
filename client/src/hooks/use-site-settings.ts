import { useQuery } from "@tanstack/react-query";

export interface SiteSettings {
  company_info?: {
    name: { en: string; fr: string; de: string; ar: string };
    tagline?: { en: string; fr: string; de: string; ar: string };
    about: { en: string; fr: string; de: string; ar: string };
    logoUrl?: string;
    faviconUrl?: string;
    isActive: boolean;
  };
  contact_details?: {
    phone: string;
    email: string;
    whatsapp?: string;
    address: { en: string; fr: string; de: string; ar: string };
    isActive: boolean;
  };
  social_media?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    isActive: boolean;
  };
  booking_info?: {
    termsAndConditions: { en: string; fr: string; de: string; ar: string };
    privacyPolicy: { en: string; fr: string; de: string; ar: string };
    cancellationPolicy: { en: string; fr: string; de: string; ar: string };
    bookingInstructions?: { en: string; fr: string; de: string; ar: string };
    contactEmail?: string;
    contactPhone?: string;
    depositPercentage: number;
    isBookingEnabled: boolean;
    isActive: boolean;
  };
  location_info?: {
    address: { en: string; fr: string; de: string; ar: string };
    latitude: number;
    longitude: number;
    googleMapsUrl?: string;
    displayOnFooter: boolean;
    displayOnContact: boolean;
    isActive: boolean;
  };
  about_page_content?: {
    type: "about_page_content";
    title: { en: string; fr?: string; de?: string; ar?: string };
    subtitle: { en: string; fr?: string; de?: string; ar?: string };
    whoWeAre: { en: string; fr?: string; de?: string; ar?: string };
    whoWeAreDesc: { en: string; fr?: string; de?: string; ar?: string };
    ourMission: { en: string; fr?: string; de?: string; ar?: string };
    ourMissionDesc: { en: string; fr?: string; de?: string; ar?: string };
    whyChooseUs: { en: string; fr?: string; de?: string; ar?: string };
    experience: { en: string; fr?: string; de?: string; ar?: string };
    experienceDesc: { en: string; fr?: string; de?: string; ar?: string };
    localGuides: { en: string; fr?: string; de?: string; ar?: string };
    localGuidesDesc: { en: string; fr?: string; de?: string; ar?: string };
    safety: { en: string; fr?: string; de?: string; ar?: string };
    safetyDesc: { en: string; fr?: string; de?: string; ar?: string };
    authentic: { en: string; fr?: string; de?: string; ar?: string };
    authenticDesc: { en: string; fr?: string; de?: string; ar?: string };
    toursCompleted: { en: string; fr?: string; de?: string; ar?: string };
    happyCustomers: { en: string; fr?: string; de?: string; ar?: string };
    countries: { en: string; fr?: string; de?: string; ar?: string };
    rating: { en: string; fr?: string; de?: string; ar?: string };
    ourStory: { en: string; fr?: string; de?: string; ar?: string };
    ourStoryDesc: { en: string; fr?: string; de?: string; ar?: string };
    commitment: { en: string; fr?: string; de?: string; ar?: string };
    commitmentDesc: { en: string; fr?: string; de?: string; ar?: string };
    isActive: boolean;
  };
}

export const useSiteSettings = () => {
  return useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
    staleTime: 0, // No cache - always fresh
    gcTime: 0, // Don't cache at all (was cacheTime in v4)
    refetchOnMount: "always", // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
};