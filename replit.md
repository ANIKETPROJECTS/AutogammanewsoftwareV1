# Auto Gamma - Automotive Service Management System

## Overview

Auto Gamma is a full-stack automotive service management dashboard application. It provides functionality for managing an auto workshop including job cards, customer inquiries, technician assignments, appointments, invoicing, and master data management (services, PPF, accessories). The application features a modern React frontend with a Node.js/Express backend, using MongoDB for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme configuration (red/white automotive branding)
- **Charts**: Recharts for dashboard analytics visualization
- **Animations**: Framer Motion for page transitions and entry animations
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with ESM modules
- **Database**: MongoDB with Mongoose ODM
- **Session Management**: Express-session with MemoryStore (development)
- **API Design**: REST endpoints defined in shared route contracts with Zod schemas

### Build System
- **Development**: Vite dev server with HMR, proxied through Express
- **Production**: Vite builds client to `dist/public`, esbuild bundles server to `dist/index.cjs`
- **TypeScript**: Single tsconfig with path aliases (`@/` for client, `@shared/` for shared code)

### Authentication Flow
- Session-based authentication with cookies
- Protected routes redirect unauthenticated users to login
- User state managed via React Query with `/api/user` endpoint polling

### Code Organization
```
client/           # React frontend
  src/
    components/   # UI components (shadcn/ui based)
    hooks/        # Custom React hooks (auth, dashboard, toast)
    pages/        # Route page components
    lib/          # Utilities (queryClient, cn helper)
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route definitions
  storage.ts      # MongoDB data access layer
  db.ts           # Database connection
shared/           # Shared between client/server
  schema.ts       # Zod schemas and TypeScript types
  routes.ts       # API contract definitions
```

### Design Patterns
- **Typed API Contracts**: Routes defined in `shared/routes.ts` with Zod schemas for input validation and response typing
- **Repository Pattern**: `storage.ts` abstracts MongoDB operations behind an interface
- **Component Composition**: shadcn/ui components follow Radix UI primitive patterns with Tailwind styling

## External Dependencies

### Database
- **MongoDB**: Primary database (requires `MONGODB_URI` environment variable)
- **Drizzle Config Present**: The codebase includes Drizzle ORM configuration for PostgreSQL, but the active implementation uses MongoDB/Mongoose

### Frontend Libraries
- **@tanstack/react-query**: Server state management
- **Radix UI**: Accessible component primitives (dialog, dropdown, tabs, etc.)
- **Recharts**: Dashboard charting
- **Framer Motion**: Animations
- **wouter**: Client-side routing

### Backend Libraries
- **Express 5**: HTTP server framework
- **Mongoose**: MongoDB ODM
- **express-session**: Session middleware
- **memorystore**: In-memory session storage

### Development Tools
- **Vite**: Frontend build tool with React plugin
- **esbuild**: Server bundling for production
- **drizzle-kit**: Database migrations (PostgreSQL support available)

### Environment Variables Required
- `MONGODB_URI`: MongoDB connection string
- `SESSION_SECRET`: Express session secret (defaults to "default_secret" in development)
- `DATABASE_URL`: PostgreSQL connection (for Drizzle, if switching databases)