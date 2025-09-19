import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertActivitySchema, createBookingRequestSchema, insertGalleryItemSchema, bookings, type Activity, type InsertActivity, type Booking, type CreateBookingRequest, type GalleryItem, type InsertGalleryItem } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { db } from "./db";
import { sql, eq, and, gte, lte, ne } from "drizzle-orm";
import { requireAdminAuth, adminLogin, createDefaultAdminIfNeeded } from "./auth";
import { z } from "zod";

// Simple hash function for generating consistent lock IDs
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

// Admin login schema for validation
const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize default admin user if none exists
  await createDefaultAdminIfNeeded();

  // Admin Authentication API Routes
  
  // POST /api/admin/login - Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const result = adminLoginSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validationError.message 
        });
      }
      
      const { username, password } = result.data;
      const loginResult = await adminLogin(username, password);
      
      if (!loginResult) {
        // Don't reveal whether username or password was wrong for security
        return res.status(401).json({ 
          error: "Invalid credentials",
          details: "Username or password is incorrect"
        });
      }
      
      const { admin, token } = loginResult;
      
      // Set secure HTTP-only cookie with the JWT token
      res.cookie('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict',
        path: '/', // Match logout path
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
      
      // Return admin info (without password)
      const { password: _, ...adminInfo } = admin;
      res.json({
        success: true,
        admin: adminInfo,
        message: "Login successful"
        // Note: JWT token is only provided via httpOnly cookie for security
      });
      
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ error: "Login failed due to server error" });
    }
  });
  
  // POST /api/admin/logout - Admin logout
  app.post("/api/admin/logout", async (req, res) => {
    // Clear the admin token cookie with matching options
    res.clearCookie('admin_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    res.json({ success: true, message: "Logout successful" });
  });
  
  // GET /api/admin/me - Get current admin info
  app.get("/api/admin/me", requireAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      const { password: _, ...adminInfo } = admin;
      res.json(adminInfo);
    } catch (error) {
      console.error("Error fetching admin info:", error);
      res.status(500).json({ error: "Failed to fetch admin info" });
    }
  });

  // Activities API Routes
  
  // GET /api/activities - Fetch all active activities for public display
  app.get("/api/activities", async (req, res) => {
    try {
      const activities = await storage.getAllActivities(true); // Only active activities
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // GET /api/activities/:id - Fetch specific activity
  app.get("/api/activities/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const activity = await storage.getActivity(id);
      
      if (!activity) {
        return res.status(404).json({ error: "Activity not found" });
      }
      
      res.json(activity);
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ error: "Failed to fetch activity" });
    }
  });

  // GET /api/admin/activities - Fetch all activities for admin (including inactive)
  app.get("/api/admin/activities", requireAdminAuth, async (req, res) => {
    try {
      const activities = await storage.getAllActivities(false); // All activities
      res.json(activities);
    } catch (error) {
      console.error("Error fetching admin activities:", error);
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // POST /api/admin/activities - Create new activity (admin only)
  app.post("/api/admin/activities", requireAdminAuth, async (req, res) => {
    try {
      const result = insertActivitySchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validationError.message 
        });
      }

      const activity = await storage.createActivity(result.data);
      res.status(201).json(activity);
    } catch (error) {
      console.error("Error creating activity:", error);
      res.status(500).json({ error: "Failed to create activity" });
    }
  });

  // PUT /api/admin/activities/:id - Update activity (admin only)
  app.put("/api/admin/activities/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate the update data (partial update allowed)
      const updateData = insertActivitySchema.partial().safeParse(req.body);
      
      if (!updateData.success) {
        const validationError = fromZodError(updateData.error);
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validationError.message 
        });
      }

      const activity = await storage.updateActivity(id, updateData.data);
      
      if (!activity) {
        return res.status(404).json({ error: "Activity not found" });
      }
      
      res.json(activity);
    } catch (error) {
      console.error("Error updating activity:", error);
      res.status(500).json({ error: "Failed to update activity" });
    }
  });

  // DELETE /api/admin/activities/:id - Delete activity (admin only)
  app.delete("/api/admin/activities/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteActivity(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Activity not found" });
      }
      
      res.json({ success: true, message: "Activity deleted successfully" });
    } catch (error) {
      console.error("Error deleting activity:", error);
      res.status(500).json({ error: "Failed to delete activity" });
    }
  });

  // Gallery API Routes

  // GET /api/gallery - Fetch all active gallery items for public display
  app.get("/api/gallery", async (req, res) => {
    try {
      const galleryItems = await storage.getAllGalleryItems(true); // Only active items
      res.json(galleryItems);
    } catch (error) {
      console.error("Error fetching gallery items:", error);
      res.status(500).json({ error: "Failed to fetch gallery items" });
    }
  });

  // GET /api/gallery/:id - Fetch specific gallery item (public - only active items)
  app.get("/api/gallery/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const item = await storage.getGalleryItem(id);
      
      if (!item || !item.isActive) {
        return res.status(404).json({ error: "Gallery item not found" });
      }
      
      res.json(item);
    } catch (error) {
      console.error("Error fetching gallery item:", error);
      res.status(500).json({ error: "Failed to fetch gallery item" });
    }
  });

  // GET /api/admin/gallery - Fetch all gallery items for admin (including inactive)
  app.get("/api/admin/gallery", requireAdminAuth, async (req, res) => {
    try {
      const galleryItems = await storage.getAllGalleryItems(false); // All items
      res.json(galleryItems);
    } catch (error) {
      console.error("Error fetching admin gallery items:", error);
      res.status(500).json({ error: "Failed to fetch gallery items" });
    }
  });

  // POST /api/admin/gallery - Create new gallery item (admin only)
  app.post("/api/admin/gallery", requireAdminAuth, async (req, res) => {
    try {
      const result = insertGalleryItemSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validationError.message 
        });
      }

      const galleryItem = await storage.createGalleryItem(result.data);
      res.status(201).json(galleryItem);
    } catch (error) {
      console.error("Error creating gallery item:", error);
      res.status(500).json({ error: "Failed to create gallery item" });
    }
  });

  // PUT /api/admin/gallery/:id - Update gallery item (admin only)
  app.put("/api/admin/gallery/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate the update data (partial update allowed)
      const updateData = insertGalleryItemSchema.partial().safeParse(req.body);
      
      if (!updateData.success) {
        const validationError = fromZodError(updateData.error);
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validationError.message 
        });
      }

      const galleryItem = await storage.updateGalleryItem(id, updateData.data);
      
      if (!galleryItem) {
        return res.status(404).json({ error: "Gallery item not found" });
      }
      
      res.json(galleryItem);
    } catch (error) {
      console.error("Error updating gallery item:", error);
      res.status(500).json({ error: "Failed to update gallery item" });
    }
  });

  // DELETE /api/admin/gallery/:id - Delete gallery item (admin only)
  app.delete("/api/admin/gallery/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteGalleryItem(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Gallery item not found" });
      }
      
      res.json({ success: true, message: "Gallery item deleted successfully" });
    } catch (error) {
      console.error("Error deleting gallery item:", error);
      res.status(500).json({ error: "Failed to delete gallery item" });
    }
  });

  // Bookings API Routes

  // GET /api/bookings/:email - Get bookings by customer email (PRIVATE - requires authentication)
  app.get("/api/bookings/:email", async (req, res) => {
    try {
      const { email } = req.params;
      const authToken = req.headers['x-customer-token'] as string;
      
      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: "Valid email address required" });
      }

      // SECURITY: Require customer authentication to prevent privacy violations
      // For now, require a simple token - in production, this would be a JWT or session
      if (!authToken || authToken !== 'customer-access-2024') {
        return res.status(401).json({ 
          error: "Authentication required", 
          details: "Customer bookings are private. Include X-Customer-Token header for access." 
        });
      }
      
      const bookings = await storage.getBookingsByEmail(email);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching customer bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // POST /api/bookings - Create new booking (public endpoint for customers)
  app.post("/api/bookings", async (req, res) => {
    try {
      const result = createBookingRequestSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validationError.message 
        });
      }

      // Verify the activity exists and is active
      const activity = await storage.getActivity(result.data.activityId);
      if (!activity || !activity.isActive) {
        return res.status(404).json({ error: "Activity not found or not available" });
      }

      // CRITICAL: Calculate price server-side for security
      // Get the price per person from activity pricing  
      const prices = activity.prices as { TND: number; USD: number; EUR: number };
      const pricePerPerson = prices[result.data.currency as keyof typeof prices];
      if (!pricePerPerson) {
        return res.status(400).json({ error: `Price not available for currency: ${result.data.currency}` });
      }

      // CRITICAL: Enforce capacity limits to prevent overbooking
      // Check if group size exceeds activity capacity
      if (result.data.groupSize > activity.capacity) {
        return res.status(400).json({ 
          error: "Group size exceeds activity capacity",
          maxCapacity: activity.capacity,
          requestedSize: result.data.groupSize
        });
      }

      // CONCURRENCY-SAFE: Use database transaction with advisory lock to prevent race conditions
      // Create a unique lock ID based on activity and date
      const lockDate = result.data.bookingDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      const lockKey = `${result.data.activityId}_${lockDate}`;
      const lockId = Math.abs(hashCode(lockKey)); // Convert to positive integer for pg_advisory_xact_lock

      // Execute booking creation in a transaction with advisory lock
      let booking;
      try {
        booking = await db.transaction(async (tx) => {
          // Acquire advisory lock for this activity+date combination
          await tx.execute(sql`SELECT pg_advisory_xact_lock(${lockId})`);
          
          // Re-check availability inside the lock to prevent race conditions
          const existingBookings = await tx
            .select()
            .from(bookings)
            .where(
              and(
                eq(bookings.activityId, result.data.activityId),
                gte(bookings.bookingDate, new Date(result.data.bookingDate.setUTCHours(0, 0, 0, 0))),
                lte(bookings.bookingDate, new Date(result.data.bookingDate.setUTCHours(23, 59, 59, 999))),
                ne(bookings.status, "cancelled")
              )
            );
          
          const totalBookedSlots = existingBookings.reduce((total, booking) => total + booking.groupSize, 0);
          const slotsRemaining = Math.max(0, activity.capacity - totalBookedSlots);

          if (result.data.groupSize > slotsRemaining) {
            throw new Error(`CAPACITY_EXCEEDED:${slotsRemaining}:${result.data.groupSize}`);
          }

          // Calculate price inside transaction for consistency
          const totalPrice = pricePerPerson * result.data.groupSize;
          const depositAmount = totalPrice * 0.1; // 10% deposit

          // Create booking data with proper precision
          const bookingData = {
            activityId: result.data.activityId,
            customerName: result.data.customerName,
            customerEmail: result.data.customerEmail,
            customerPhone: result.data.customerPhone || null,
            bookingDate: result.data.bookingDate,
            groupSize: result.data.groupSize,
            totalPrice: totalPrice.toFixed(2),
            depositAmount: depositAmount.toFixed(2),
            currency: result.data.currency,
            paymentMethod: result.data.paymentMethod || null,
            specialRequests: result.data.specialRequests || null,
            language: result.data.language,
          };

          // Insert booking within the transaction
          const [newBooking] = await tx.insert(bookings).values(bookingData).returning();
          return newBooking;
        });
      } catch (error: any) {
        if (error.message.startsWith('CAPACITY_EXCEEDED:')) {
          const [, slotsRemaining, requestedSize] = error.message.split(':');
          return res.status(409).json({ 
            error: "Not enough slots available for requested group size",
            available: false,
            slotsRemaining: parseInt(slotsRemaining),
            requestedSize: parseInt(requestedSize)
          });
        }
        throw error; // Re-throw other errors
      }

      // Return booking with activity details
      const bookingWithActivity = await storage.getBooking(booking.id);
      
      res.status(201).json(bookingWithActivity);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  // GET /api/admin/bookings - Get all bookings (admin only)
  app.get("/api/admin/bookings", requireAdminAuth, async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching admin bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // GET /api/admin/bookings/:id - Get specific booking (admin only)
  app.get("/api/admin/bookings/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const booking = await storage.getBooking(id);
      
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ error: "Failed to fetch booking" });
    }
  });

  // PUT /api/admin/bookings/:id/status - Update booking status (admin only)
  app.put("/api/admin/bookings/:id/status", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ 
          error: "Invalid status", 
          details: `Status must be one of: ${validStatuses.join(', ')}` 
        });
      }

      const booking = await storage.updateBookingStatus(id, status);
      
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ error: "Failed to update booking status" });
    }
  });

  // PUT /api/admin/bookings/:id/payment - Update booking payment status (admin only, also used by payment webhooks)
  app.put("/api/admin/bookings/:id/payment", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { paymentStatus, paymentId } = req.body;
      
      const validPaymentStatuses = ['unpaid', 'deposit_paid', 'fully_paid', 'refunded'];
      if (!paymentStatus || !validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({ 
          error: "Invalid payment status", 
          details: `Payment status must be one of: ${validPaymentStatuses.join(', ')}` 
        });
      }

      const booking = await storage.updateBookingPayment(id, paymentStatus, paymentId);
      
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error updating booking payment:", error);
      res.status(500).json({ error: "Failed to update booking payment" });
    }
  });

  // GET /api/activities/:activityId/availability - Check availability for specific activity and date range
  app.get("/api/activities/:activityId/availability", async (req, res) => {
    try {
      const { activityId } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ 
          error: "Both startDate and endDate query parameters are required" 
        });
      }

      // Verify activity exists
      const activity = await storage.getActivity(activityId);
      if (!activity || !activity.isActive) {
        return res.status(404).json({ error: "Activity not found or not available" });
      }

      // Real availability checking based on bookings and capacity
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      // Real availability checking with capacity
      const availableDates = [];
      const currentDate = new Date(start);
      
      while (currentDate <= end) {
        // Get existing bookings for this date
        const existingBookings = await storage.getBookingsByDateAndActivity(activityId, new Date(currentDate));
        
        // Calculate total booked slots (sum of group sizes)
        const totalBookedSlots = existingBookings.reduce((total, booking) => total + booking.groupSize, 0);
        
        // Calculate remaining slots
        const slotsRemaining = Math.max(0, activity.capacity - totalBookedSlots);
        
        availableDates.push({
          date: currentDate.toISOString().split('T')[0],
          available: slotsRemaining > 0,
          slotsRemaining
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      res.json({
        activityId,
        availability: availableDates
      });
    } catch (error) {
      console.error("Error checking availability:", error);
      res.status(500).json({ error: "Failed to check availability" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
