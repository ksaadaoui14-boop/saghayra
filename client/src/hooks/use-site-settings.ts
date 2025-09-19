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