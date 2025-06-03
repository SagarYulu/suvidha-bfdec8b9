
# Windsurf Frontend - Yulu Issue Resolution

A clean React frontend for the Yulu Issue Resolution System built with TypeScript, Tailwind CSS, and modern UI components.

## Features

- **Authentication**: JWT-based login system
- **Issue Management**: Create, view, and track issues
- **Dashboard**: Analytics and overview
- **Responsive Design**: Works on all devices
- **Modern UI**: Clean, professional interface

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
1. Copy `.env.example` to `.env`
2. Update the API URL if needed (default: http://localhost:5000/api)

### 3. Start Development Server
```bash
npm run dev
```

The app will be available at http://localhost:3000

## Build for Production
```bash
npm run build
```

## Project Structure

```
windsurf-frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components
│   │   └── Layout.tsx      # Main layout component
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication context
│   ├── pages/              # Page components
│   │   ├── Home.tsx        # Landing page
│   │   ├── Login.tsx       # Login page
│   │   ├── Dashboard.tsx   # Analytics dashboard
│   │   ├── Issues.tsx      # Issues list
│   │   └── ...
│   ├── services/           # API services
│   │   ├── api.ts          # Axios configuration
│   │   ├── authService.ts  # Authentication API
│   │   └── issueService.ts # Issues API
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── package.json            # Dependencies
├── vite.config.ts          # Vite configuration
└── tailwind.config.js      # Tailwind configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The frontend communicates with the backend API through:

- **Base URL**: Configured in `.env` file
- **Authentication**: JWT tokens stored in localStorage
- **Interceptors**: Automatic token attachment and error handling

## Default Login

Use the default admin credentials:
- Email: `admin@yulu.com`
- Password: `admin123`

## Tech Stack

- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons
