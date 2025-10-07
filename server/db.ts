import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Get the absolute path to the .env file in the root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

// Setup Neon WebSocket with custom options for Replit environment
class SecureWebSocket extends ws {
  constructor(address: string | URL, protocols?: string | string[]) {
    const options = {
      rejectUnauthorized: false, // Allow self-signed certs in Replit dev environment
    };
    super(address, protocols, options);
  }
}

neonConfig.webSocketConstructor = SecureWebSocket as any;

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Create connection pool and Drizzle client
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
