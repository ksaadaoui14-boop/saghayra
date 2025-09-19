import { storage } from "./storage";

// Seed activities data based on the mock data from frontend
const seedActivities = [
  {
    title: {
      en: "2-Day Camel Trek",
      fr: "Trek à dos de chameau de 2 jours",
      de: "2-Tage Kameltrekking",
      ar: "رحلة الجمال لمدة يومين"
    },
    description: {
      en: "Experience the magic of the Sahara with an authentic camel trekking adventure through golden dunes.",
      fr: "Découvrez la magie du Sahara avec une aventure authentique de trekking à dos de chameau à travers les dunes dorées.",
      de: "Erleben Sie die Magie der Sahara mit einem authentischen Kameltrekking-Abenteuer durch goldene Dünen.",
      ar: "اختبر سحر الصحراء مع مغامرة أصيلة لرحلة الجمال عبر الكثبان الذهبية."
    },
    highlights: {
      en: ["Camel Riding", "Desert Camp", "Traditional Dinner", "Stargazing"],
      fr: ["Promenade à dos de chameau", "Camp du désert", "Dîner traditionnel", "Observation des étoiles"],
      de: ["Kamelreiten", "Wüstencamp", "Traditionelles Abendessen", "Sterne beobachten"],
      ar: ["ركوب الجمل", "مخيم صحراوي", "عشاء تقليدي", "مراقبة النجوم"]
    },
    category: "adventure",
    duration: "2 days, 1 night",
    groupSize: "2-8 people",
    prices: {
      TND: 180,
      USD: 60,
      EUR: 55
    },
    imageUrl: "/generated_images/Camel_riding_tour_detail_e5164afc.png",
    isActive: true
  },
  {
    title: {
      en: "Desert Dinner Experience",
      fr: "Expérience de dîner dans le désert",
      de: "Wüsten-Abendessen Erlebnis",
      ar: "تجربة عشاء الصحراء"
    },
    description: {
      en: "Enjoy traditional Berber cuisine under the stars with live music and cultural performances.",
      fr: "Savourez la cuisine berbère traditionnelle sous les étoiles avec de la musique live et des spectacles culturels.",
      de: "Genießen Sie traditionelle Berber-Küche unter den Sternen mit Live-Musik und kulturellen Aufführungen.",
      ar: "استمتع بالمأكولات البربرية التقليدية تحت النجوم مع الموسيقى الحية والعروض الثقافية."
    },
    highlights: {
      en: ["Traditional Food", "Live Music", "Cultural Show", "Tea Ceremony"],
      fr: ["Nourriture traditionnelle", "Musique live", "Spectacle culturel", "Cérémonie du thé"],
      de: ["Traditionelle Küche", "Live-Musik", "Kulturshow", "Tee-Zeremonie"],
      ar: ["طعام تقليدي", "موسيقى حية", "عرض ثقافي", "حفل الشاي"]
    },
    category: "cultural",
    duration: "Evening (4 hours)",
    groupSize: "2-20 people",
    prices: {
      TND: 54,
      USD: 18,
      EUR: 16
    },
    imageUrl: "/generated_images/Desert_camp_dining_experience_e983ce5b.png",
    isActive: true
  },
  {
    title: {
      en: "Cultural Activities Day",
      fr: "Journée d'activités culturelles",
      de: "Kultureller Aktivitätstag",
      ar: "يوم الأنشطة الثقافية"
    },
    description: {
      en: "Immerse yourself in Berber culture with henna art, traditional crafts, and local music.",
      fr: "Plongez-vous dans la culture berbère avec l'art du henné, l'artisanat traditionnel et la musique locale.",
      de: "Tauchen Sie ein in die Berber-Kultur mit Henna-Kunst, traditionellem Handwerk und lokaler Musik.",
      ar: "انغمس في الثقافة البربرية مع فن الحناء والحرف التقليدية والموسيقى المحلية."
    },
    highlights: {
      en: ["Henna Art", "Traditional Crafts", "Local Music", "Village Tour"],
      fr: ["Art du henné", "Artisanat traditionnel", "Musique locale", "Visite du village"],
      de: ["Henna-Kunst", "Traditionelles Handwerk", "Lokale Musik", "Dorfbesichtigung"],
      ar: ["فن الحناء", "الحرف التقليدية", "الموسيقى المحلية", "جولة القرية"]
    },
    category: "cultural",
    duration: "Full day (8 hours)",
    groupSize: "4-15 people",
    prices: {
      TND: 90,
      USD: 30,
      EUR: 27
    },
    imageUrl: "/generated_images/Traditional_henna_art_activity_1883deb4.png",
    isActive: true
  }
];

export async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");
    
    // Clear existing activities (for development)
    const existingActivities = await storage.getAllActivities();
    console.log(`Found ${existingActivities.length} existing activities`);
    
    // Create activities
    for (const activityData of seedActivities) {
      const activity = await storage.createActivity(activityData);
      console.log(`✅ Created activity: ${(activity.title as any).en} (ID: ${activity.id})`);
    }
    
    console.log("🎉 Database seeding completed successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("Seeding finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}