import ActivityCard from '../ActivityCard';
import camelImage from "@assets/generated_images/Camel_riding_tour_detail_e5164afc.png";

const mockActivity = {
  id: "camel-2day",
  title: "2-Day Camel Trek Adventure", 
  description: "Experience the magic of the Sahara with our authentic camel trekking adventure through golden dunes.",
  image: camelImage,
  duration: "2 days, 1 night",
  groupSize: "2-8 people",
  price: 150,
  rating: 4.9,
  reviews: 127,
  highlights: ["Camel Riding", "Desert Camp", "Traditional Dinner", "Stargazing"],
  category: "Adventure"
};

export default function ActivityCardExample() {
  const handleBookNow = (activityId: string) => {
    console.log(`Booking activity: ${activityId}`);
  };

  return (
    <div className="p-8 bg-background">
      <div className="max-w-sm">
        <ActivityCard 
          activity={mockActivity}
          currency="USD"
          currencySymbol="$"
          onBookNow={handleBookNow}
          currentLanguage="en"
        />
      </div>
    </div>
  );
}