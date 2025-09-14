import { useState } from "react";
import { Play, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  thumbnail: string;
  title: string;
  description: string;
}

interface GalleryProps {
  items: GalleryItem[];
  currentLanguage: string;
}

export default function Gallery({ items, currentLanguage }: GalleryProps) {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isRTL = currentLanguage === 'ar';

  const translations = {
    en: {
      title: "Experience Gallery",
      subtitle: "Discover the beauty of our desert adventures",
      viewAll: "View All",
      close: "Close"
    },
    fr: {
      title: "Galerie d'Expériences", 
      subtitle: "Découvrez la beauté de nos aventures désertiques",
      viewAll: "Voir Tout",
      close: "Fermer"
    },
    de: {
      title: "Erlebnis-Galerie",
      subtitle: "Entdecken Sie die Schönheit unserer Wüstenabenteuer", 
      viewAll: "Alle Anzeigen",
      close: "Schließen"
    },
    ar: {
      title: "معرض التجارب",
      subtitle: "اكتشف جمال مغامراتنا الصحراوية",
      viewAll: "عرض الكل", 
      close: "إغلاق"
    }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;

  const openItem = (item: GalleryItem, index: number) => {
    setSelectedItem(item);
    setSelectedIndex(index);
  };

  const navigateItem = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (selectedIndex - 1 + items.length) % items.length
      : (selectedIndex + 1) % items.length;
    setSelectedIndex(newIndex);
    setSelectedItem(items[newIndex]);
  };

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-12 ${isRTL ? 'text-right' : ''}`}>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
            {t.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item, index) => (
            <div 
              key={item.id}
              className="relative group cursor-pointer hover-elevate rounded-lg overflow-hidden"
              onClick={() => openItem(item, index)}
              data-testid={`gallery-item-${item.id}`}
            >
              <div className="aspect-square relative">
                <img 
                  src={item.thumbnail} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  {item.type === 'video' ? (
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                  ) : (
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                      <div className="w-8 h-8 text-white">🔍</div>
                    </div>
                  )}
                </div>

                {/* Video indicator */}
                {item.type === 'video' && (
                  <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                    Video
                  </div>
                )}
              </div>

              {/* Title overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <h3 className="text-white font-medium text-sm">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => console.log('View all gallery items')}
            data-testid="button-view-all-gallery"
          >
            {t.viewAll}
          </Button>
        </div>
      </div>

      {/* Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          {selectedItem && (
            <div className="relative">
              {/* Navigation */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
                onClick={() => navigateItem('prev')}
                data-testid="button-gallery-prev"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
                onClick={() => navigateItem('next')}
                data-testid="button-gallery-next"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>

              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
                onClick={() => setSelectedItem(null)}
                data-testid="button-gallery-close"
              >
                <X className="w-6 h-6" />
              </Button>

              {/* Content */}
              <div className="relative">
                {selectedItem.type === 'video' ? (
                  <video 
                    src={selectedItem.src}
                    controls
                    className="w-full max-h-[70vh] object-contain"
                    autoPlay
                  />
                ) : (
                  <img 
                    src={selectedItem.src}
                    alt={selectedItem.title}
                    className="w-full max-h-[70vh] object-contain"
                  />
                )}
              </div>

              {/* Description */}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{selectedItem.title}</h3>
                <p className="text-muted-foreground">{selectedItem.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}