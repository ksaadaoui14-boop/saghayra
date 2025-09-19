import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertActivitySchema, type Activity, type InsertActivity } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

// Temporary admin authentication middleware  
// TODO: Replace with proper admin authentication system in Task 5
function requireAdminAuth(req: any, res: any, next: any) {
  const adminToken = req.headers['x-admin-token'];
  const expectedToken = process.env.ADMIN_TOKEN;
  
  // In production, ADMIN_TOKEN must be set - no default fallback
  if (!expectedToken) {
    console.error("ADMIN_TOKEN environment variable not set - admin endpoints disabled");
    return res.status(503).json({ error: "Admin functionality not configured" });
  }
  
  if (!adminToken || adminToken !== expectedToken) {
    console.warn(`Unauthorized admin access attempt from ${req.ip || 'unknown IP'}`);
    return res.status(401).json({ error: "Unauthorized - Admin access required" });
  }
  
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);

  return httpServer;
}
