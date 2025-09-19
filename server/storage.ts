import { 
  type User, 
  type InsertUser, 
  type AdminUser, 
  type InsertAdminUser,
  type Activity, 
  type InsertActivity,
  type Booking, 
  type InsertBooking,
  type GalleryItem, 
  type InsertGalleryItem,
  type Availability,
  type InsertAvailability,
  type SiteSetting,
  type InsertSiteSetting,
  users,
  adminUsers,
  activities,
  bookings,
  galleryItems,
  availability,
  siteSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, ne } from "drizzle-orm";

// Storage interface for all CRUD operations
export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Admin Users
  getAdminUser(id: string): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  getAdminUserByEmail(email: string): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  updateAdminUserLastLogin(id: string): Promise<void>;

  // Activities
  getAllActivities(activeOnly?: boolean): Promise<Activity[]>;
  getActivity(id: string): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: string, activity: Partial<InsertActivity>): Promise<Activity | undefined>;
  deleteActivity(id: string): Promise<boolean>;

  // Bookings
  getAllBookings(): Promise<(Booking & { activity: Activity })[]>;
  getBooking(id: string): Promise<(Booking & { activity: Activity }) | undefined>;
  getBookingsByEmail(email: string): Promise<Booking[]>;
  getBookingsByDateAndActivity(activityId: string, bookingDate: Date): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;
  updateBookingPayment(id: string, paymentStatus: string, paymentId?: string): Promise<Booking | undefined>;

  // Gallery
  getAllGalleryItems(activeOnly?: boolean): Promise<GalleryItem[]>;
  getGalleryItem(id: string): Promise<GalleryItem | undefined>;
  createGalleryItem(item: InsertGalleryItem): Promise<GalleryItem>;
  updateGalleryItem(id: string, item: Partial<InsertGalleryItem>): Promise<GalleryItem | undefined>;
  deleteGalleryItem(id: string): Promise<boolean>;

  // Availability
  getAvailability(activityId: string, fromDate: Date, toDate: Date): Promise<{ date: string; availableSpots: number; totalCapacity: number; isBlocked: boolean; }[]>;
  getAvailabilityForDate(activityId: string, date: Date): Promise<{ availableSpots: number; totalCapacity: number; isBlocked: boolean; } | null>;
  createAvailability(availability: InsertAvailability): Promise<Availability>;
  updateAvailability(id: string, availability: Partial<InsertAvailability>): Promise<Availability | undefined>;

  // Site Settings
  getAllSiteSettings(activeOnly?: boolean): Promise<SiteSetting[]>;
  getSiteSetting(key: string): Promise<SiteSetting | undefined>;
  createOrUpdateSiteSetting(key: string, value: any, isActive?: boolean): Promise<SiteSetting>;
  deleteSiteSetting(key: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Admin Users
  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return admin || undefined;
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return admin || undefined;
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return admin || undefined;
  }

  async createAdminUser(insertAdmin: InsertAdminUser): Promise<AdminUser> {
    const [admin] = await db
      .insert(adminUsers)
      .values(insertAdmin)
      .returning();
    return admin;
  }

  async updateAdminUserLastLogin(id: string): Promise<void> {
    await db
      .update(adminUsers)
      .set({ lastLogin: new Date() })
      .where(eq(adminUsers.id, id));
  }

  // Activities
  async getAllActivities(activeOnly = false): Promise<Activity[]> {
    const query = db.select().from(activities);
    if (activeOnly) {
      return await query.where(eq(activities.isActive, true)).orderBy(activities.createdAt);
    }
    return await query.orderBy(activities.createdAt);
  }

  async getActivity(id: string): Promise<Activity | undefined> {
    const [activity] = await db.select().from(activities).where(eq(activities.id, id));
    return activity || undefined;
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(insertActivity)
      .returning();
    return activity;
  }

  async updateActivity(id: string, updateActivity: Partial<InsertActivity>): Promise<Activity | undefined> {
    const [activity] = await db
      .update(activities)
      .set({ ...updateActivity, updatedAt: new Date() })
      .where(eq(activities.id, id))
      .returning();
    return activity || undefined;
  }

  async deleteActivity(id: string): Promise<boolean> {
    const result = await db.delete(activities).where(eq(activities.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Bookings
  async getAllBookings(): Promise<(Booking & { activity: Activity })[]> {
    return await db
      .select()
      .from(bookings)
      .leftJoin(activities, eq(bookings.activityId, activities.id))
      .orderBy(desc(bookings.createdAt))
      .then(rows => 
        rows.map(row => ({
          ...row.bookings,
          activity: row.activities!
        }))
      );
  }

  async getBooking(id: string): Promise<(Booking & { activity: Activity }) | undefined> {
    const [result] = await db
      .select()
      .from(bookings)
      .leftJoin(activities, eq(bookings.activityId, activities.id))
      .where(eq(bookings.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.bookings,
      activity: result.activities!
    };
  }

  async getBookingsByEmail(email: string): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.customerEmail, email))
      .orderBy(desc(bookings.createdAt));
  }

  async getBookingsByDateAndActivity(activityId: string, bookingDate: Date): Promise<Booking[]> {
    // Get bookings for specific activity and date (excluding cancelled bookings)
    const startOfDay = new Date(bookingDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(bookingDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    return await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.activityId, activityId),
          gte(bookings.bookingDate, startOfDay),
          lte(bookings.bookingDate, endOfDay),
          ne(bookings.status, "cancelled") // Exclude cancelled bookings
        )
      );
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values(insertBooking)
      .returning();
    return booking;
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const [booking] = await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return booking || undefined;
  }

  async updateBookingPayment(id: string, paymentStatus: string, paymentId?: string): Promise<Booking | undefined> {
    const updateData: any = { paymentStatus, updatedAt: new Date() };
    if (paymentId) updateData.paymentId = paymentId;

    const [booking] = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, id))
      .returning();
    return booking || undefined;
  }

  // Gallery
  async getAllGalleryItems(activeOnly = false): Promise<GalleryItem[]> {
    const query = db.select().from(galleryItems);
    if (activeOnly) {
      return await query
        .where(eq(galleryItems.isActive, true))
        .orderBy(galleryItems.sortOrder, galleryItems.createdAt);
    }
    return await query.orderBy(galleryItems.sortOrder, galleryItems.createdAt);
  }

  async getGalleryItem(id: string): Promise<GalleryItem | undefined> {
    const [item] = await db.select().from(galleryItems).where(eq(galleryItems.id, id));
    return item || undefined;
  }

  async createGalleryItem(insertItem: InsertGalleryItem): Promise<GalleryItem> {
    const [item] = await db
      .insert(galleryItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async updateGalleryItem(id: string, updateItem: Partial<InsertGalleryItem>): Promise<GalleryItem | undefined> {
    const [item] = await db
      .update(galleryItems)
      .set(updateItem)
      .where(eq(galleryItems.id, id))
      .returning();
    return item || undefined;
  }

  async deleteGalleryItem(id: string): Promise<boolean> {
    const result = await db.delete(galleryItems).where(eq(galleryItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Availability
  async getAvailability(activityId: string, fromDate: Date, toDate: Date): Promise<{ date: string; availableSpots: number; totalCapacity: number; isBlocked: boolean; }[]> {
    // Get activity capacity
    const activity = await this.getActivity(activityId);
    if (!activity) {
      return [];
    }

    // Generate date range
    const dates: Date[] = [];
    const current = new Date(fromDate);
    while (current <= toDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    // Get existing bookings for each date
    const results = await Promise.all(
      dates.map(async (date) => {
        const dateStart = new Date(date.setUTCHours(0, 0, 0, 0));
        const dateEnd = new Date(date.setUTCHours(23, 59, 59, 999));
        
        const existingBookings = await db
          .select()
          .from(bookings)
          .where(
            and(
              eq(bookings.activityId, activityId),
              gte(bookings.bookingDate, dateStart),
              lte(bookings.bookingDate, dateEnd),
              ne(bookings.status, "cancelled")
            )
          );
        
        const totalBookedSlots = existingBookings.reduce((total, booking) => total + booking.groupSize, 0);
        const availableSpots = Math.max(0, activity.capacity - totalBookedSlots);
        
        return {
          date: date.toISOString().split('T')[0],
          availableSpots,
          totalCapacity: activity.capacity,
          isBlocked: false, // Can be extended for manually blocked dates
        };
      })
    );

    return results;
  }

  async getAvailabilityForDate(activityId: string, date: Date): Promise<{ availableSpots: number; totalCapacity: number; isBlocked: boolean; } | null> {
    // Get activity capacity
    const activity = await this.getActivity(activityId);
    if (!activity) {
      return null;
    }

    const dateStart = new Date(date.setUTCHours(0, 0, 0, 0));
    const dateEnd = new Date(date.setUTCHours(23, 59, 59, 999));
    
    const existingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.activityId, activityId),
          gte(bookings.bookingDate, dateStart),
          lte(bookings.bookingDate, dateEnd),
          ne(bookings.status, "cancelled")
        )
      );
    
    const totalBookedSlots = existingBookings.reduce((total, booking) => total + booking.groupSize, 0);
    const availableSpots = Math.max(0, activity.capacity - totalBookedSlots);
    
    return {
      availableSpots,
      totalCapacity: activity.capacity,
      isBlocked: false, // Can be extended for manually blocked dates
    };
  }

  async createAvailability(insertAvailability: InsertAvailability): Promise<Availability> {
    const [availabilityRecord] = await db
      .insert(availability)
      .values(insertAvailability)
      .returning();
    return availabilityRecord;
  }

  async updateAvailability(id: string, updateAvailability: Partial<InsertAvailability>): Promise<Availability | undefined> {
    const [availabilityRecord] = await db
      .update(availability)
      .set({ ...updateAvailability, updatedAt: new Date() })
      .where(eq(availability.id, id))
      .returning();
    return availabilityRecord || undefined;
  }

  // Site Settings
  async getAllSiteSettings(activeOnly = false): Promise<SiteSetting[]> {
    const query = db.select().from(siteSettings);
    if (activeOnly) {
      return await query.where(eq(siteSettings.isActive, true)).orderBy(siteSettings.key);
    }
    return await query.orderBy(siteSettings.key);
  }

  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting || undefined;
  }

  async createOrUpdateSiteSetting(key: string, value: any, isActive?: boolean): Promise<SiteSetting> {
    // Check if setting already exists
    const existingSetting = await this.getSiteSetting(key);
    
    if (existingSetting) {
      // Update existing setting
      const updateData: any = { value, updatedAt: new Date() };
      if (isActive !== undefined) {
        updateData.isActive = isActive;
      }
      
      const [updated] = await db
        .update(siteSettings)
        .set(updateData)
        .where(eq(siteSettings.key, key))
        .returning();
      return updated;
    } else {
      // Create new setting
      const insertData: any = { key, value };
      if (isActive !== undefined) {
        insertData.isActive = isActive;
      }
      
      const [created] = await db
        .insert(siteSettings)
        .values(insertData)
        .returning();
      return created;
    }
  }

  async deleteSiteSetting(key: string): Promise<boolean> {
    const result = await db.delete(siteSettings).where(eq(siteSettings.key, key));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();
