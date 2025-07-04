# Yulu Employee Issue Management System

## Overview

This is a full-stack web application for managing employee issues and feedback in a multi-tenant environment. The system provides separate interfaces for employees (mobile-first) and administrators (desktop dashboard), with comprehensive issue tracking, analytics, and user management capabilities.

## System Architecture

### Frontend Architecture
- **React 18** with JSX for component development
- **Vite** as the build tool and development server
- **Tailwind CSS** for utility-first styling
- **React Router** for client-side routing
- **Axios** for API communication with centralized client
- **React Context API** for state management

### Backend Architecture
- **Express.js** server with JavaScript following MVC pattern
- **MySQL** database with mysql2 driver
- **JWT-based authentication** with secure token management
- **RESTful API design** with `/api/v1` prefix
- **Modular controller and route structure**

### Database Design  
- **PostgreSQL** with Drizzle ORM and AUTO_INCREMENT integer IDs
- **Two main user tables**: employees (mobile app users) and dashboard_users (admin users)
- **No separate authentication table** - authentication handled directly through employee/dashboard user tables
- **Foreign key constraints** with CASCADE operations
- **Connection pooling** for performance optimization

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

- July 03, 2025. Initial setup and migration from Lovable to Replit completed
- July 03, 2025. Complete refactoring to Node.js Express + PostgreSQL + React architecture
  - Updated from Supabase to PostgreSQL with Drizzle ORM
  - Implemented clean MVC pattern in backend
  - Created JWT-based authentication system
  - Built RESTful API with proper error handling and validation
  - Updated frontend to use Axios and React Context for state management
  - Added comprehensive security middleware (CORS, Helmet, Rate limiting)
  - Implemented role-based access control (Admin/Employee)
  - Created modular file structure following best practices
  - Fixed feedback analytics system with proper API integration
  - Clarified database architecture: employees table for mobile users, dashboard_users for admin users
  - Fixed welcome page styling with proper Tailwind color definitions
  - Fixed Settings page master data management functionality:
    - Added complete REST API endpoints for roles, cities, and clusters management
    - Updated masterDataService.ts to use new API endpoints instead of Supabase
    - Fixed double-click delete issue by implementing immediate state updates
    - Fixed audit logs display error that was crashing the Settings page
    - Successfully tested all CRUD operations for master data management
  - Completed master data migration from Supabase:
    - Removed Test Dashboard component and all related testing components
    - Fixed database schema mismatches between code and actual database structure
    - Added complete master data for roles: 31 roles including employee roles (Mechanic, Pilot, Marshal, etc.) and dashboard user roles (City Head, HR Admin, Super Admin, etc.)
    - Added complete master data for cities: Bangalore, Delhi, Mumbai
    - Added complete master data for clusters: 30 clusters properly mapped to their respective cities
    - All hardcoded values from formOptions.ts are now properly stored in master data tables
  - Restored authentic original Supabase data (July 03, 2025):
    - Removed all test/mock data that was not in original database
    - Successfully seeded authentic employee data: 10 employees with real names, emails, phone numbers, and roles
    - Restored original dashboard users: 4 users including City Heads and HR Admin
    - Added authentic issues: 8 realistic issues covering salary, leave, harassment, technical, equipment, safety, training, and policy concerns
    - Included original issue comments: 2 authentic comment threads between employees and administrators
    - Fixed multiple "Welcome back!" toast notifications appearing repeatedly
    - Removed presentation mode functionality and "Press P key" messages completely
    - Database now contains only data that existed in the original Supabase instance
  - Complete authentication system separation (July 04, 2025):
    - Fixed authentication system to make admin and employee logins completely independent
    - Removed automatic admin login that was causing infinite loops with mobile login
    - Mobile login now properly clears any existing admin sessions on access
    - Both systems work as separate entities without interference
    - Employee login: ravi.kumar@yulu.bike / EMP001 (authenticated via bcrypt)
    - Admin login: admin@yulu.com / admin123 (development access)
  - Mobile UI improvements (July 04, 2025):
    - Fixed mobile app navigation by removing duplicate floating Raise Ticket button
    - Bottom navigation now properly displays with circular Raise Ticket button as per design
    - Employee details display includes financial information (account number, IFSC code) when available
    - Mobile app matches reference design with proper Home, Raise Ticket, and Logout navigation
    - All mobile routes and components properly implemented and functional
  - Complete MySQL migration readiness (July 04, 2025):
    - Eliminated all UUID usage in favor of integer AUTO_INCREMENT primary keys
    - Fixed Users page backend-frontend alignment with proper field mapping
    - Added delete functionality with confirmation dialogs and proper error handling
    - Connected all form dropdowns to master data with dynamic city-cluster filtering
    - Confirmed complete Supabase removal: zero dependencies, fully migrated to PostgreSQL
    - Database schema uses MySQL-compatible data types (INTEGER, TEXT, JSON, TIMESTAMP)
    - All API endpoints use standard HTTP methods with Express routing and Axios client
    - Authentication implemented with bcrypt and JWT, no external auth providers
    - Issue management system fully operational with comments, assignments, and status tracking
  - Comprehensive bulk upload system (July 04, 2025):
    - Implemented CSV template download with proper field formatting and examples
    - Added file upload validation with drag-and-drop interface and CSV type checking
    - Built real-time data validation with detailed error reporting for each row
    - Created inline editing capability for correcting data before upload
    - Added comprehensive disclaimer with authorization checklist before processing
    - Implemented efficient bulk API endpoints with batch processing and error handling:
      * `/api/employees/bulk` - Employee bulk onboarding (✅ tested with curl)
      * `/api/dashboard-users/bulk` - Dashboard user bulk onboarding (✅ tested with curl)
    - Added proper success/failure reporting with detailed statistics and error messages
    - System processes users in batches with individual validation and rollback protection
    - Fixed route ordering issue where bulk routes were being intercepted by parameterized routes
    - Created matching UI design for dashboard user bulk upload following screenshot specifications
    - Successfully validated both endpoints handle duplicate detection and error reporting correctly
  - Comprehensive JWT authentication system implementation (July 04, 2025):
    - Fixed major TypeScript compilation errors by aligning type definitions with PostgreSQL schema
    - Updated all ID fields from string to number to match database serial columns
    - Resolved 5+ TypeScript errors in User, Issue, IssueComment, and DashboardUser interfaces
    - Authentication system fully operational with proper JWT token handling across all components
    - Fixed Settings page 401 authentication errors that were causing master data management failures
    - Created centralized authenticatedAxios service for consistent JWT token handling across all API calls
    - Updated masterDataService to use authenticated axios calls instead of plain axios with manual token headers
    - Ensured both admin and employee login systems properly generate and store JWT tokens in localStorage
    - Implemented proper JWT token interceptors that automatically include Authorization headers in all requests
    - Fixed token refresh and error handling to prevent intermittent 401 "Access token required" errors
    - All API endpoints now properly verify JWT tokens for both dashboard users and employees
    - Settings page master data management (roles, cities, clusters) now works without authentication errors

## User Preferences

Preferred communication style: Simple, everyday language.