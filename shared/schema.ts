import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (regular website users - kept for future use)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Admin users table (for content management)
export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"), // admin, super_admin
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  lastLogin: timestamp("last_login"),
});

// Activities/Tours table
export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: jsonb("title").notNull(), // {en: "title", fr: "titre", de: "titel", ar: "عنوان"}
  description: jsonb("description").notNull(),
  highlights: jsonb("highlights").notNull(), // array of strings per language
  category: text("category").notNull(), // adventure, cultural, etc.
  duration: text("duration").notNull(),
  groupSize: text("group_size").notNull(),
  capacity: integer("capacity").notNull().default(8), // Maximum number of people per booking date
  prices: jsonb("prices").notNull(), // {TND: 180, USD: 60, EUR: 55}
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  activityId: varchar("activity_id").notNull().references(() => activities.id),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  bookingDate: timestamp("booking_date").notNull(),
  groupSize: integer("group_size").notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull(), // TND, USD, EUR
  status: text("status").notNull().default("pending"), // pending, confirmed, cancelled, completed
  paymentStatus: text("payment_status").notNull().default("unpaid"), // unpaid, deposit_paid, fully_paid, refunded
  paymentMethod: text("payment_method"), // stripe, paypal
  paymentId: text("payment_id"), // external payment ID
  specialRequests: text("special_requests"),
  language: text("language").notNull().default("en"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Gallery items table
export const galleryItems = pgTable("gallery_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: jsonb("title").notNull(),
  description: jsonb("description").notNull(),
  type: text("type").notNull(), // image, video
  url: text("url").notNull(), // main file URL
  thumbnailUrl: text("thumbnail_url"), // thumbnail for videos
  storageKey: text("storage_key"), // object storage key/path
  bucketId: text("bucket_id"), // object storage bucket ID
  contentType: text("content_type"), // MIME type
  fileSize: integer("file_size"), // file size in bytes
  category: text("category"), // activity type or general category
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Availability table for tracking daily capacity
export const availability = pgTable("availability", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  activityId: varchar("activity_id").notNull().references(() => activities.id),
  date: timestamp("date").notNull(), // Use timestamp to match bookingDate
  availableSpots: integer("available_spots").notNull(),
  totalCapacity: integer("total_capacity").notNull(),
  isBlocked: boolean("is_blocked").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Site settings table for managing company details and site configuration
export const siteSettings = pgTable("site_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(), // unique identifier for the setting (e.g., 'company_info', 'contact_details')
  value: jsonb("value").notNull(), // stores the setting data as JSON
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Relations
export const activitiesRelations = relations(activities, ({ many }) => ({
  bookings: many(bookings),
  availability: many(availability),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  activity: one(activities, {
    fields: [bookings.activityId],
    references: [activities.id],
  }),
}));

export const availabilityRelations = relations(availability, ({ one }) => ({
  activity: one(activities, {
    fields: [availability.activityId],
    references: [activities.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).pick({
  username: true,
  email: true,
  password: true,
  role: true,
});

// Define strict multilingual schemas
const multilingualTextSchema = z.object({
  en: z.string().min(1),
  fr: z.string().min(1),
  de: z.string().min(1),
  ar: z.string().min(1),
});

const multilingualArraySchema = z.object({
  en: z.array(z.string()).min(1),
  fr: z.array(z.string()).min(1),
  de: z.array(z.string()).min(1),
  ar: z.array(z.string()).min(1),
});

const pricesSchema = z.object({
  TND: z.number().positive(),
  USD: z.number().positive(),
  EUR: z.number().positive(),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  category: true,
  duration: true,
  groupSize: true,
  imageUrl: true,
  isActive: true,
}).extend({
  title: multilingualTextSchema,
  description: multilingualTextSchema,
  highlights: multilingualArraySchema,
  prices: pricesSchema,
});

// Booking request schema for API (customer input only)
// Note: totalPrice is calculated server-side for security
export const createBookingRequestSchema = z.object({
  activityId: z.string().min(1, "Activity ID is required"),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Valid email address is required"),
  customerPhone: z.string().optional(),
  bookingDate: z.coerce.date().refine(date => date > new Date(), "Booking date must be in the future"),
  groupSize: z.coerce.number().int().min(1, "Group size must be at least 1").max(20, "Group size cannot exceed 20"),
  currency: z.enum(["TND", "USD", "EUR"]),
  paymentMethod: z.enum(["stripe", "paypal"]).optional(),
  specialRequests: z.string().optional(),
  language: z.enum(["en", "fr", "de", "ar"]).default("en"),
});

// Full booking schema for database operations
export const insertBookingSchema = createInsertSchema(bookings).pick({
  activityId: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  bookingDate: true,
  groupSize: true,
  totalPrice: true,
  depositAmount: true,
  currency: true,
  paymentMethod: true,
  specialRequests: true,
  language: true,
});

export const insertGalleryItemSchema = createInsertSchema(galleryItems).pick({
  title: true,
  description: true,
  type: true,
  url: true,
  thumbnailUrl: true,
  category: true,
  isActive: true,
  sortOrder: true,
});

// Site settings schemas
export const contactInfoSchema = z.object({
  phone: z.string(),
  email: z.string().email(),
  address: multilingualTextSchema,
  whatsapp: z.string().optional(),
});

export const socialMediaSchema = z.object({
  facebook: z.string().url("Please enter a valid URL").optional(),
  instagram: z.string().url("Please enter a valid URL").optional(), 
  twitter: z.string().url("Please enter a valid URL").optional(),
  linkedin: z.string().url("Please enter a valid URL").optional(),
  youtube: z.string().url("Please enter a valid URL").optional(),
  tiktok: z.string().url("Please enter a valid URL").optional(),
});

export const companyInfoSchema = z.object({
  name: multilingualTextSchema,
  tagline: multilingualTextSchema.optional(),
  about: multilingualTextSchema,
  logoUrl: z.string().min(1, "Logo URL is required").optional(),
  faviconUrl: z.string().min(1, "Favicon URL is required").optional(),
});

export const bookingInfoSchema = z.object({
  termsAndConditions: multilingualTextSchema,
  privacyPolicy: multilingualTextSchema,
  cancellationPolicy: multilingualTextSchema,
  bookingInstructions: multilingualTextSchema.optional(),
  contactEmail: z.string().email("Please enter a valid email address").optional(),
  contactPhone: z.string().optional(),
  depositPercentage: z.number().min(1).max(100).default(10),
  isBookingEnabled: z.boolean().default(true),
});

export const siteSettingValueSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("company_info"), ...companyInfoSchema.shape }),
  z.object({ type: z.literal("contact_details"), ...contactInfoSchema.shape }),
  z.object({ type: z.literal("social_media"), ...socialMediaSchema.shape }),
  z.object({ type: z.literal("booking_info"), ...bookingInfoSchema.shape }),
]);

export const insertSiteSettingSchema = createInsertSchema(siteSettings).pick({
  key: true,
  value: true,
  isActive: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Booking = typeof bookings.$inferSelect;
export type CreateBookingRequest = z.infer<typeof createBookingRequestSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type GalleryItem = typeof galleryItems.$inferSelect;
export type InsertGalleryItem = z.infer<typeof insertGalleryItemSchema>;

export type Availability = typeof availability.$inferSelect;
export type InsertAvailability = typeof availability.$inferInsert;

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type SiteSettingValue = z.infer<typeof siteSettingValueSchema>;
