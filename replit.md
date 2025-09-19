# Sghayra Tours - Multilingual Tourism Website

## Overview

Sghayra Tours is a comprehensive multilingual tourism platform specializing in authentic Sahara desert experiences. The application provides a booking system for various desert activities including camel trekking, traditional dining, and cultural activities, with support for multiple languages (English, French, German, Arabic) and currencies (TND, USD, EUR). The platform features a public-facing website for customers and a secure admin dashboard for content and booking management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **State Management**: TanStack Query (React Query) for server state and caching
- **Styling**: Tailwind CSS with custom desert-inspired design system featuring warm sand/ochre colors
- **Internationalization**: Multilingual support for 4 languages with RTL support for Arabic
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js RESTful API
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with httpOnly cookies for admin users
- **File Structure**: Shared schema definitions between frontend and backend using TypeScript

### Database Design
- **Schema**: Defined in shared/schema.ts using Drizzle ORM
- **Tables**: Users, AdminUsers, Activities, Bookings, GalleryItems, Availability
- **Features**: Multilingual content storage using JSONB fields, price management across multiple currencies
- **Migrations**: Managed through Drizzle Kit with PostgreSQL as the target database

### Authentication & Authorization
- **Admin Authentication**: JWT tokens stored in httpOnly cookies for security
- **Password Security**: bcryptjs for password hashing with salt rounds
- **Route Protection**: Middleware-based authentication for admin endpoints
- **Default Admin**: Automatic creation of default admin user on first startup

### API Design
- **RESTful Architecture**: Conventional REST endpoints for all resources
- **Error Handling**: Standardized error responses with proper HTTP status codes
- **Validation**: Zod schemas for request/response validation
- **CORS**: Configured for cross-origin requests with credentials support

### Design System
- **Color Palette**: Desert-inspired theme with sand, ochre, and blue night colors
- **Typography**: Inter for body text, Playfair Display for headings
- **Components**: Consistent spacing using Tailwind's 4-unit system
- **Responsive**: Mobile-first design with adaptive layouts
- **Dark Mode**: Full dark mode support with CSS custom properties

## External Dependencies

### Database Services
- **Neon Database**: PostgreSQL hosting service via @neondatabase/serverless
- **Connection Pooling**: WebSocket-based connections for optimal performance

### Payment Processing
- **Stripe**: Primary payment processor with React Stripe.js integration
- **PayPal**: Secondary payment option via PayPal Server SDK
- **Payment Features**: 10% deposit system, multi-currency support, webhook handling

### Email Services
- **SendGrid**: Email delivery service for booking confirmations and notifications
- **Email Templates**: Multilingual email support for customer communications

### File Storage & Media
- **Asset Management**: Local file storage with planned cloud storage integration
- **Image Handling**: Support for gallery images and activity photos
- **Upload System**: Multer-based file upload capabilities (planned)

### Development & Build Tools
- **Vite**: Fast development server and build tool with React plugin
- **TypeScript**: Full TypeScript support across frontend and backend
- **ESBuild**: Production bundling for server-side code
- **Tailwind CSS**: Utility-first CSS framework with PostCSS

### Monitoring & Development
- **Replit Integration**: Development environment plugins and runtime error handling
- **Query Devtools**: TanStack Query development tools for debugging
- **Type Safety**: End-to-end TypeScript with shared schemas

### UI Component Libraries
- **Radix UI**: Accessible component primitives for complex UI elements
- **Lucide React**: Consistent icon system
- **React Hook Form**: Performant form management with validation
- **Class Variance Authority**: Type-safe component variant management