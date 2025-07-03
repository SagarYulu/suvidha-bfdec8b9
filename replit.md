# Yulu Employee Issue Management System

## Overview

This is a full-stack web application for managing employee issues and feedback in a multi-tenant environment. The system provides separate interfaces for employees (mobile-first) and administrators (desktop dashboard), with comprehensive issue tracking, analytics, and user management capabilities.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type safety
- **Vite** as the build tool and development server
- **Tailwind CSS** with shadcn/ui components for consistent styling
- **React Router** for client-side routing
- **TanStack Query** for server state management and caching
- **Zustand** for local state management

### Backend Architecture
- **Express.js** server with TypeScript
- **PostgreSQL** database with Drizzle ORM
- **Neon Database** as the PostgreSQL provider
- Session-based authentication with pg-simple store
- RESTful API design with `/api` prefix

### Database Design
- **Drizzle ORM** with PostgreSQL dialect
- Schema-first approach with TypeScript types
- Migration system for database versioning
- Connection pooling with Neon serverless

## Key Components

### Authentication & Authorization
- **Role-Based Access Control (RBAC)** system
- Multiple user types: employees, admins, security-admins
- Session management with secure cookies
- Protected routes based on user permissions

### Issue Management
- **Hierarchical issue types** with categories and subcategories
- **Priority levels**: low, medium, high, critical
- **Status tracking**: open, in_progress, resolved, closed
- **Assignment system** for routing issues to appropriate handlers
- **Comment system** for communication between users and admins

### Analytics & Reporting
- **Real-time dashboards** with filtering capabilities
- **Sentiment analysis** for feedback tracking
- **SLA monitoring** with breach detection
- **Trend analysis** for issue patterns
- **Export functionality** for CSV/Excel reports

### User Management
- **Bulk user upload** with CSV validation
- **Multi-tenant support** with city/cluster organization
- **Employee profile management**
- **Dashboard user administration**

## Data Flow

### Issue Creation Flow
1. Employee submits issue through mobile interface
2. Issue is validated and stored in database
3. Issue is automatically assigned based on type and priority
4. Notifications sent to relevant stakeholders
5. Issue tracking begins with SLA monitoring

### Issue Resolution Flow
1. Admin views assigned issues in dashboard
2. Admin updates issue status and adds comments
3. Employee receives notifications of updates
4. Upon resolution, feedback request is sent to employee
5. Feedback is collected and analyzed for sentiment

### Analytics Pipeline
1. Raw data collected from issues, comments, and feedback
2. Data is processed and aggregated for reporting
3. Metrics calculated including TAT, SLA compliance, sentiment scores
4. Dashboards updated in real-time with new data

## External Dependencies

### Database & Infrastructure
- **Neon Database**: PostgreSQL hosting with serverless scaling
- **Drizzle Kit**: Database migrations and schema management

### UI & Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **shadcn/ui**: Pre-built component library

### State Management & API
- **TanStack Query**: Server state management with caching
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation for type safety

### Development Tools
- **TypeScript**: Type safety across the entire stack
- **ESBuild**: Fast JavaScript bundling
- **Vite**: Development server with HMR

## Deployment Strategy

### Development
- Hot module replacement with Vite
- Database migrations with Drizzle
- Environment-specific configurations
- Replit-specific development features

### Production Build
- Client-side assets built with Vite
- Server bundled with ESBuild
- Static file serving from Express
- Database connection pooling

### Environment Configuration
- Environment variables for database connection
- Separate configurations for development/production
- Secure session management
- CORS configuration for API endpoints

## Changelog

- July 03, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.