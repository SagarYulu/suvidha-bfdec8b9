
# Grievance Portal Frontend

React frontend application for the Grievance Portal, built with TypeScript, Tailwind CSS, and React Query.

## Features

- **Modern React**: Built with React 18 and TypeScript
- **Authentication**: JWT-based auth with role-based access control
- **State Management**: React Query for server state, Context API for client state
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Automatic data refreshing and optimistic updates
- **Form Handling**: React Hook Form with validation
- **Notifications**: Toast notifications for user feedback

## Prerequisites

- Node.js 16+
- npm or yarn
- Backend API running on http://localhost:5000

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**:
   ```bash
   npm start
   ```

## Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues

## Environment Variables

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# App Configuration
REACT_APP_NAME=Grievance Portal
REACT_APP_VERSION=1.0.0

# Features
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_NOTIFICATIONS=true

# File Upload
REACT_APP_MAX_FILE_SIZE=5242880
REACT_APP_ALLOWED_FILE_TYPES=image/*,application/pdf
```

## Project Structure

```
src/
├── components/         # Reusable UI components
│   └── Layout.tsx     # Main layout component
├── contexts/          # React Context providers
│   └── AuthContext.tsx
├── pages/             # Page components
│   ├── Login.tsx
│   ├── Home.tsx
│   ├── Dashboard.tsx
│   └── Issues.tsx
├── services/          # API services
│   ├── api.ts         # Base API client
│   ├── authService.ts # Authentication API
│   └── issueService.ts # Issues API
├── App.tsx            # Main app component
└── index.tsx          # Entry point
```

## Features Overview

### Authentication
- Admin login with email/password
- Employee login with employee ID/password
- JWT token management
- Role-based route protection

### Dashboard
- Overview statistics
- Recent issues
- Status and priority breakdowns
- Role-specific data views

### Issues Management
- Create, view, update issues
- File attachment support
- Status and priority management
- Advanced filtering and search
- Comments and internal notes

### User Management (Admin)
- User creation and management
- Role assignment
- Bulk operations
- Audit logging

## API Integration

The frontend communicates with the Node.js backend through RESTful APIs:

- **Authentication**: `/api/auth/*`
- **Issues**: `/api/issues/*`
- **Users**: `/api/users/*`
- **Analytics**: `/api/analytics/*`

All API calls include JWT tokens for authentication and use interceptors for error handling.

## State Management

- **Server State**: React Query for caching, synchronization, and background updates
- **Client State**: React Context API for authentication and global app state
- **Form State**: React Hook Form for form validation and submission

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Responsive Design**: Mobile-first approach
- **Component Library**: Custom components built with Tailwind
- **Icons**: Lucide React icon library

## Error Handling

- Global error boundaries
- API error interceptors
- User-friendly error messages
- Fallback UI components

## Performance

- Code splitting with React.lazy
- Image optimization
- Bundle size optimization
- Efficient re-rendering with React Query

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## Building for Production

```bash
# Build the app
npm run build

# Serve locally to test
npx serve -s build
```

## Docker

```bash
# Build Docker image
docker build -t grievance-frontend .

# Run container
docker run -p 3000:80 grievance-frontend
```

## Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy build folder** to your web server (nginx, Apache, etc.)

3. **Configure environment variables** for production

4. **Set up reverse proxy** if needed

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Create pull requests for review

## Troubleshooting

### Common Issues

1. **API Connection Issues**:
   - Check `REACT_APP_API_URL` in `.env`
   - Ensure backend is running
   - Check network connectivity

2. **Authentication Problems**:
   - Clear browser storage
   - Check JWT token expiration
   - Verify credentials

3. **Build Issues**:
   - Clear `node_modules` and reinstall
   - Check Node.js version compatibility
   - Verify environment variables

### Development Tips

- Use React Developer Tools browser extension
- Enable detailed error messages in development
- Monitor network requests in browser DevTools
- Use the React Query DevTools for debugging
