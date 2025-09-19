import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import type { AdminUser } from '@shared/schema';

// JWT payload interface
interface JWTPayload {
  adminId: string;
  username: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Extended request interface for authenticated admin
interface AuthenticatedRequest extends Request {
  admin?: AdminUser;
}

// JWT configuration
const JWT_SECRET = process.env.SESSION_SECRET;
const JWT_EXPIRES_IN = '24h'; // 24 hours

if (!JWT_SECRET) {
  throw new Error('SESSION_SECRET environment variable is required for JWT authentication');
}

// Hash password utility
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Verify password utility
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

// Generate JWT token
export function generateJWT(admin: AdminUser): string {
  const payload: JWTPayload = {
    adminId: admin.id,
    username: admin.username,
    email: admin.email,
    role: admin.role,
  };
  
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as any;
    return {
      adminId: decoded.adminId,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
      iat: decoded.iat,
      exp: decoded.exp
    };
  } catch (error) {
    console.warn('JWT verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

// Admin authentication middleware
export async function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // Check for JWT token in Authorization header (Bearer token) or cookies
    const authHeader = req.headers.authorization;
    const cookieToken = req.headers.cookie?.split(';')
      .find(cookie => cookie.trim().startsWith('admin_token='))
      ?.split('=')[1];
    
    let token: string | undefined;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    } else if (cookieToken) {
      token = cookieToken;
    }
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required', 
        details: 'JWT token missing. Please log in to access admin features.' 
      });
    }
    
    // Verify the JWT token
    const payload = verifyJWT(token);
    if (!payload) {
      return res.status(401).json({ 
        error: 'Invalid or expired token', 
        details: 'Please log in again to continue.' 
      });
    }
    
    // Get the admin user from database to ensure they still exist
    const admin = await storage.getAdminUser(payload.adminId);
    if (!admin) {
      return res.status(401).json({ 
        error: 'Admin user not found', 
        details: 'The admin account may have been removed.' 
      });
    }
    
    // Update last login timestamp
    await storage.updateAdminUserLastLogin(admin.id);
    
    // Add admin to request object for downstream use
    req.admin = admin;
    
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(500).json({ 
      error: 'Authentication system error', 
      details: 'Please try again or contact support.' 
    });
  }
}

// Admin login function
export async function adminLogin(username: string, password: string): Promise<{ admin: AdminUser; token: string } | null> {
  try {
    // Find admin by username or email
    let admin = await storage.getAdminUserByUsername(username);
    if (!admin) {
      admin = await storage.getAdminUserByEmail(username);
    }
    
    if (!admin) {
      return null; // Admin not found
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(password, admin.password);
    if (!isValidPassword) {
      return null; // Invalid password
    }
    
    // Generate JWT token
    const token = generateJWT(admin);
    
    // Update last login
    await storage.updateAdminUserLastLogin(admin.id);
    
    return { admin, token };
  } catch (error) {
    console.error('Admin login error:', error);
    return null;
  }
}

// Create default admin user if none exist
export async function createDefaultAdminIfNeeded(): Promise<void> {
  try {
    // Check if any admin users exist
    const existingAdmin = await storage.getAdminUserByUsername('admin');
    if (existingAdmin) {
      return; // Admin already exists
    }
    
    // Create default admin
    const defaultPassword = 'admin123!'; // Should be changed in production
    const hashedPassword = await hashPassword(defaultPassword);
    
    const defaultAdmin = {
      username: 'admin',
      email: 'admin@sghayratours.com',
      password: hashedPassword,
      role: 'super_admin'
    };
    
    await storage.createAdminUser(defaultAdmin);
    
    console.log('✅ Default admin user created:');
    console.log('   Username: admin');
    console.log('   Email: admin@sghayratours.com');
    console.log('   Password: admin123!');
    console.log('   ⚠️  IMPORTANT: Change the default password after first login!');
    
  } catch (error) {
    console.error('❌ Failed to create default admin user:', error);
  }
}