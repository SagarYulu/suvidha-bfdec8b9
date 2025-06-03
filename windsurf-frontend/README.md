
# Grievance Portal Frontend

React frontend application for the Grievance Portal.

## Features

- Modern React with TypeScript
- Tailwind CSS for styling
- React Query for data fetching
- React Hook Form for form handling
- React Router for navigation
- Responsive design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your API URL
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Environment Variables

- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000/api)
- `REACT_APP_APP_NAME` - Application name
- `REACT_APP_VERSION` - Application version

## Deployment

### With Docker
```bash
docker build -t grievance-portal-frontend .
docker run -p 80:80 grievance-portal-frontend
```

### Static Hosting
```bash
npm run build
# Deploy the dist/ folder to your hosting provider
```

## Development

The application is configured to work with the backend API. Make sure the backend is running on the configured API URL.

### Project Structure
```
src/
  components/     # Reusable UI components
  contexts/       # React contexts
  pages/          # Page components
  services/       # API services
  config/         # Configuration files
  types/          # TypeScript type definitions
```
