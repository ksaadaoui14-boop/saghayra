import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, MapPin, Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ActivityCard from "@/components/ActivityCard";
import type { Activity } from "@shared/schema";

interface ActivitiesProps {
  currentLanguage: string;
  currentCurrency: string;
}

export default function Activities({ currentLanguage, currentCurrency }: ActivitiesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  const currencySymbols = { TND: "د.ت", USD: "$", EUR: "€" };
  const currencySymbol = currencySymbols[currentCurrency as keyof typeof currencySymbols];

  // Fetch activities from API  
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['/api/activities'],
    select: (data: Activity[]) => {
      return data.map((activity, index) => ({
        id: activity.id,
        title: (activity.title as any)[currentLanguage] || (activity.title as any).en,
        description: (activity.description as any)[currentLanguage] || (activity.description as any).en,
        image: activity.imageUrl || "/api/placeholder/400/300", 
        duration: activity.duration,
        groupSize: activity.groupSize,
        price: (activity.prices as any)[currentCurrency] || (activity.prices as any).USD,
        rating: 4.8 + (Math.random() * 0.2),
        reviews: 89 + index * 25,
        highlights: (activity.highlights as any)[currentLanguage] || (activity.highlights as any).en || [],
        category: activity.category
      }));
    }
  });


  // Filter activities based on search and category
  const filteredActivities = activities?.filter((activity) => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || activity.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  // Get unique categories for filter
  const categories = Array.from(new Set(activities?.map(a => a.category) || []));

  const translations = {
    en: {
      title: "Desert Adventures",
      subtitle: "Discover authentic Sahara experiences",
      searchPlaceholder: "Search activities...",
      filterByCategory: "Filter by Category",
      allCategories: "All Categories",
      noActivities: "No activities found",
      noActivitiesDesc: "Try adjusting your search or filter criteria",
      loading: "Loading activities...",
      error: "Failed to load activities",
      activitiesCount: "activities found",
      adventure: "Adventure",
      cultural: "Cultural",
      nature: "Nature",
      relaxation: "Relaxation"
    },
    fr: {
      title: "Aventures du Désert",
      subtitle: "Découvrez des expériences authentiques du Sahara",
      searchPlaceholder: "Rechercher des activités...",
      filterByCategory: "Filtrer par Catégorie",
      allCategories: "Toutes les Catégories",
      noActivities: "Aucune activité trouvée",
      noActivitiesDesc: "Essayez d'ajuster votre recherche ou vos critères de filtre",
      loading: "Chargement des activités...",
      error: "Échec du chargement des activités",
      activitiesCount: "activités trouvées",
      adventure: "Aventure",
      cultural: "Culturel",
      nature: "Nature",
      relaxation: "Détente"
    },
    de: {
      title: "Wüstenabenteuer",
      subtitle: "Entdecken Sie authentische Sahara-Erlebnisse",
      searchPlaceholder: "Aktivitäten suchen...",
      filterByCategory: "Nach Kategorie filtern",
      allCategories: "Alle Kategorien",
      noActivities: "Keine Aktivitäten gefunden",
      noActivitiesDesc: "Versuchen Sie, Ihre Such- oder Filterkriterien anzupassen",
      loading: "Aktivitäten werden geladen...",
      error: "Fehler beim Laden der Aktivitäten",
      activitiesCount: "Aktivitäten gefunden",
      adventure: "Abenteuer",
      cultural: "Kulturell",
      nature: "Natur",
      relaxation: "Entspannung"
    },
    ar: {
      title: "مغامرات الصحراء",
      subtitle: "اكتشف تجارب الصحراء الأصيلة",
      searchPlaceholder: "البحث عن الأنشطة...",
      filterByCategory: "تصفية حسب الفئة",
      allCategories: "جميع الفئات",
      noActivities: "لم يتم العثور على أنشطة",
      noActivitiesDesc: "حاول تعديل معايير البحث أو التصفية",
      loading: "تحميل الأنشطة...",
      error: "فشل في تحميل الأنشطة",
      activitiesCount: "أنشطة موجودة",
      adventure: "مغامرة",
      cultural: "ثقافي",
      nature: "طبيعة",
      relaxation: "استرخاء"
    }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p className="text-destructive mb-4">{t.error}</p>
            <Button onClick={() => window.location.reload()} data-testid="button-retry">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              {t.title}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </div>

          {/* Search and Filter */}
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder={t.searchPlaceholder}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-activities"
                    />
                  </div>
                </div>
                <div className="md:w-64">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger data-testid="select-category-filter">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder={t.filterByCategory} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.allCategories}</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {t[category as keyof typeof t] || category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="container mx-auto px-4 py-16">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {filteredActivities.length} {t.activitiesCount}
            </h2>
            {(searchTerm || categoryFilter !== "all") && (
              <div className="flex gap-2 mt-2">
                {searchTerm && (
                  <Badge variant="secondary" className="gap-2">
                    Search: "{searchTerm}"
                    <button 
                      onClick={() => setSearchTerm("")}
                      className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {categoryFilter !== "all" && (
                  <Badge variant="secondary" className="gap-2">
                    Category: {t[categoryFilter as keyof typeof t] || categoryFilter}
                    <button 
                      onClick={() => setCategoryFilter("all")}
                      className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Activities Grid */}
        {filteredActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                currency={currentCurrency}
                currencySymbol={currencySymbol}
                currentLanguage={currentLanguage}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t.noActivities}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t.noActivitiesDesc}
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("all");
                }}
                variant="outline"
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}