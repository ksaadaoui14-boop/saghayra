import Gallery from '../Gallery';
import camelImage from "@assets/generated_images/Camel_riding_tour_detail_e5164afc.png";
import campImage from "@assets/generated_images/Desert_camp_dining_experience_e983ce5b.png";
import hennaImage from "@assets/generated_images/Traditional_henna_art_activity_1883deb4.png";
import heroImage from "@assets/generated_images/Sahara_desert_hero_background_840d4412.png";

const mockGalleryItems = [
  {
    id: "camel-trek",
    type: "image" as const,
    src: camelImage,
    thumbnail: camelImage,
    title: "Camel Trekking Adventure",
    description: "Experience authentic camel riding through the Sahara dunes"
  },
  {
    id: "desert-camp", 
    type: "image" as const,
    src: campImage,
    thumbnail: campImage,
    title: "Desert Camp Experience",
    description: "Traditional Berber camp with authentic dining and music"
  },
  {
    id: "henna-art",
    type: "image" as const, 
    src: hennaImage,
    thumbnail: hennaImage,
    title: "Traditional Henna Art",
    description: "Beautiful henna artistry by local Berber artists"
  },
  {
    id: "sahara-sunset",
    type: "image" as const,
    src: heroImage,
    thumbnail: heroImage, 
    title: "Sahara Desert Sunset",
    description: "Breathtaking sunset views over the golden dunes"
  },
  {
    id: "desert-video",
    type: "video" as const,
    src: heroImage, // Would be video URL in real app
    thumbnail: heroImage,
    title: "Desert Adventure Video", 
    description: "Watch highlights from our desert adventures"
  }
];

export default function GalleryExample() {
  return (
    <Gallery 
      items={mockGalleryItems}
      currentLanguage="en"
    />
  );
}