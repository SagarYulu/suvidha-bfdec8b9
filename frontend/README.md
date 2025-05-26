
# Yulu Grievance Portal - Frontend

## Overview
This is the frontend application for the Yulu Grievance Portal, built with React, TypeScript, and Vite.

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Start the Development Server
```bash
npm run dev
```

The application will start on `http://localhost:3000`

### 4. Build for Production
```bash
npm run build
```

## Features

### Admin Dashboard
- Issue management and tracking
- User assignment and comments
- Analytics and reporting
- Filter and search functionality

### Employee Mobile App
- Issue creation and tracking
- Comment threads
- Feedback submission
- Status updates

### Authentication
- Role-based access control
- JWT token management
- Secure login/logout

## Tech Stack
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Query
- React Router
- Radix UI Components
- Recharts for analytics

## Project Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── services/      # API services
├── contexts/      # React contexts
├── hooks/         # Custom hooks
├── config/        # Configuration files
└── types/         # TypeScript types
```

## Demo Credentials

### Admin Login
- Email: admin@yulu.com
- Password: admin123

### Employee Login
- Employee ID: Any valid employee ID from database
- Password: 123456
