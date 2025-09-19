import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Image, Video, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface GalleryItem {
  id: string;
  title: { en: string; fr: string; de: string; ar: string };
  description: { en: string; fr: string; de: string; ar: string };
  type: string; // 'image' | 'video'
  url: string;
  thumbnailUrl?: string;
  category?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

interface GalleryProps {
  currentLanguage: string;
}

const categories = [
  "desert", "adventure", "cultural", "wildlife", "landscape", "people", "sunset", "camp", "general"
];

export default function Gallery({ currentLanguage }: GalleryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  // Fetch gallery items (only active ones for public display)
  const { data: galleryItems = [], isLoading, error } = useQuery({
    queryKey: ["/api/gallery"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  }) as { data: GalleryItem[]; isLoading: boolean; error: any };

  // Filter gallery items
  const filteredItems = galleryItems.filter((item: GalleryItem) => {
    const title = item.title[currentLanguage as keyof typeof item.title] || item.title.en;
    const description = item.description[currentLanguage as keyof typeof item.description] || item.description.en;
    
    const matchesSearch = 
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const getTypeIcon = (type: string) => {
    return type === 'video' ? <Video className="h-4 w-4" /> : <Image className="h-4 w-4" />;
  };

  const getLocalizedText = (textObj: any, fallback = "") => {
    if (!textObj) return fallback;
    return textObj[currentLanguage as keyof typeof textObj] || textObj.en || fallback;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Failed to Load Gallery</h2>
          <p className="text-muted-foreground">We're sorry, but the gallery couldn't be loaded at this time.</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/20 dark:to-orange-950/20 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">
              {currentLanguage === 'fr' ? 'Galerie Photo' : 
               currentLanguage === 'de' ? 'Fotogalerie' :
               currentLanguage === 'ar' ? 'معرض الصور' : 'Photo Gallery'}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {currentLanguage === 'fr' ? 'Découvrez la beauté du Sahara tunisien à travers notre collection de photos et vidéos captivantes.' :
               currentLanguage === 'de' ? 'Entdecken Sie die Schönheit der tunesischen Sahara durch unsere fesselnde Sammlung von Fotos und Videos.' :
               currentLanguage === 'ar' ? 'اكتشف جمال الصحراء التونسية من خلال مجموعتنا الساحرة من الصور ومقاطع الفيديو.' :
               'Discover the beauty of the Tunisian Sahara through our captivating collection of photos and videos.'}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={
                      currentLanguage === 'fr' ? 'Rechercher par titre ou catégorie...' :
                      currentLanguage === 'de' ? 'Nach Titel oder Kategorie suchen...' :
                      currentLanguage === 'ar' ? 'البحث بالعنوان أو الفئة...' :
                      'Search by title or category...'
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full lg:w-48" data-testid="select-category">
                  <SelectValue placeholder={
                    currentLanguage === 'fr' ? 'Filtrer par catégorie' :
                    currentLanguage === 'de' ? 'Nach Kategorie filtern' :
                    currentLanguage === 'ar' ? 'تصفية حسب الفئة' :
                    'Filter by category'
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {currentLanguage === 'fr' ? 'Toutes les catégories' :
                     currentLanguage === 'de' ? 'Alle Kategorien' :
                     currentLanguage === 'ar' ? 'جميع الفئات' :
                     'All Categories'}
                  </SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full lg:w-48" data-testid="select-type">
                  <SelectValue placeholder={
                    currentLanguage === 'fr' ? 'Filtrer par type' :
                    currentLanguage === 'de' ? 'Nach Typ filtern' :
                    currentLanguage === 'ar' ? 'تصفية حسب النوع' :
                    'Filter by type'
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {currentLanguage === 'fr' ? 'Tous les types' :
                     currentLanguage === 'de' ? 'Alle Typen' :
                     currentLanguage === 'ar' ? 'جميع الأنواع' :
                     'All Types'}
                  </SelectItem>
                  <SelectItem value="image">
                    {currentLanguage === 'fr' ? 'Images' :
                     currentLanguage === 'de' ? 'Bilder' :
                     currentLanguage === 'ar' ? 'صور' :
                     'Images'}
                  </SelectItem>
                  <SelectItem value="video">
                    {currentLanguage === 'fr' ? 'Vidéos' :
                     currentLanguage === 'de' ? 'Videos' :
                     currentLanguage === 'ar' ? 'فيديوهات' :
                     'Videos'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video bg-muted animate-pulse" />
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded" />
                    <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="space-y-4">
                <Image className="h-16 w-16 mx-auto text-muted-foreground" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">
                    {searchTerm || categoryFilter !== "all" || typeFilter !== "all"
                      ? (currentLanguage === 'fr' ? 'Aucun résultat trouvé' :
                         currentLanguage === 'de' ? 'Keine Ergebnisse gefunden' :
                         currentLanguage === 'ar' ? 'لم يتم العثور على نتائج' :
                         'No results found')
                      : (currentLanguage === 'fr' ? 'Galerie vide' :
                         currentLanguage === 'de' ? 'Galerie leer' :
                         currentLanguage === 'ar' ? 'المعرض فارغ' :
                         'Gallery is empty')
                    }
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm || categoryFilter !== "all" || typeFilter !== "all"
                      ? (currentLanguage === 'fr' ? 'Essayez de modifier vos critères de recherche' :
                         currentLanguage === 'de' ? 'Versuchen Sie, Ihre Suchkriterien zu ändern' :
                         currentLanguage === 'ar' ? 'حاول تعديل معايير البحث' :
                         'Try adjusting your search criteria')
                      : (currentLanguage === 'fr' ? 'Nous ajoutons régulièrement de nouveaux contenus' :
                         currentLanguage === 'de' ? 'Wir fügen regelmäßig neue Inhalte hinzu' :
                         currentLanguage === 'ar' ? 'نضيف محتوى جديد بانتظام' :
                         'We regularly add new content')
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item: GalleryItem) => (
              <Card 
                key={item.id} 
                className="hover-elevate overflow-hidden cursor-pointer"
                onClick={() => setSelectedItem(item)}
                data-testid={`gallery-item-${item.id}`}
              >
                <div className="aspect-video relative bg-muted">
                  {item.type === 'image' ? (
                    <img 
                      src={item.url} 
                      alt={getLocalizedText(item.title)}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkw4IDEyTDEwIDEwTDEyIDEyTDE2IDhMMjAgMTJWMTZIMTJaIiBmaWxsPSIjOWNhM2FmIi8+CjwvcHZnPgo=';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                      <Video className="h-12 w-12 text-gray-500" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-xs bg-black/50 text-white border-0">
                      {getTypeIcon(item.type)}
                      <span className="ml-1">
                        {item.type === 'video' ? (
                          currentLanguage === 'fr' ? 'Vidéo' :
                          currentLanguage === 'de' ? 'Video' :
                          currentLanguage === 'ar' ? 'فيديو' :
                          'Video'
                        ) : (
                          currentLanguage === 'fr' ? 'Photo' :
                          currentLanguage === 'de' ? 'Foto' :
                          currentLanguage === 'ar' ? 'صورة' :
                          'Photo'
                        )}
                      </span>
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                    <Eye className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">
                      {getLocalizedText(item.title)}
                    </h3>
                    {item.category && (
                      <Badge variant="outline" className="text-xs">
                        {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Full Screen View Dialog */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-left">
                {getLocalizedText(selectedItem.title)}
              </DialogTitle>
            </DialogHeader>
            <div className="p-6 pt-4">
              <div className="space-y-4">
                <div className="relative bg-muted rounded-lg overflow-hidden">
                  {selectedItem.type === 'image' ? (
                    <img 
                      src={selectedItem.url} 
                      alt={getLocalizedText(selectedItem.title)}
                      className="w-full max-h-[60vh] object-contain"
                    />
                  ) : (
                    <video 
                      src={selectedItem.url}
                      controls
                      className="w-full max-h-[60vh]"
                      poster={selectedItem.thumbnailUrl}
                    >
                      {currentLanguage === 'fr' ? 'Votre navigateur ne supporte pas les vidéos.' :
                       currentLanguage === 'de' ? 'Ihr Browser unterstützt keine Videos.' :
                       currentLanguage === 'ar' ? 'متصفحك لا يدعم الفيديو.' :
                       'Your browser does not support videos.'}
                    </video>
                  )}
                </div>
                
                {getLocalizedText(selectedItem.description) && (
                  <div className="space-y-2">
                    <h4 className="font-medium">
                      {currentLanguage === 'fr' ? 'Description' :
                       currentLanguage === 'de' ? 'Beschreibung' :
                       currentLanguage === 'ar' ? 'الوصف' :
                       'Description'}
                    </h4>
                    <p className="text-muted-foreground">
                      {getLocalizedText(selectedItem.description)}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center gap-2 pt-2">
                  <Badge variant="outline">
                    {getTypeIcon(selectedItem.type)}
                    <span className="ml-1">
                      {selectedItem.type === 'video' ? (
                        currentLanguage === 'fr' ? 'Vidéo' :
                        currentLanguage === 'de' ? 'Video' :
                        currentLanguage === 'ar' ? 'فيديو' :
                        'Video'
                      ) : (
                        currentLanguage === 'fr' ? 'Photo' :
                        currentLanguage === 'de' ? 'Foto' :
                        currentLanguage === 'ar' ? 'صورة' :
                        'Photo'
                      )}
                    </span>
                  </Badge>
                  {selectedItem.category && (
                    <Badge variant="outline">
                      {selectedItem.category.charAt(0).toUpperCase() + selectedItem.category.slice(1)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}