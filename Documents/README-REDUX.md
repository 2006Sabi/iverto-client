# Vigilant Vision Guardian AI - Dynamic UI with Redux

## Overview

This document outlines the implementation of dynamic state management using Redux Toolkit and RTK Query for the Vigilant Vision Guardian AI frontend application.

## Architecture

### State Management Structure

```
src/store/
├── index.ts              # Store configuration
├── hooks.ts              # Typed Redux hooks
├── api/
│   ├── baseApi.ts        # Base API configuration
│   ├── authApi.ts        # Authentication endpoints
│   ├── cameraApi.ts      # Camera management endpoints
│   ├── anomalyApi.ts     # Anomaly detection endpoints
│   └── dashboardApi.ts   # Dashboard statistics endpoints
├── slices/
│   ├── authSlice.ts      # Authentication state
│   └── uiSlice.ts        # UI state management
└── types/
    └── api.ts            # TypeScript interfaces
```

## Features Implemented

### 1. Authentication Management
- **Login/Logout**: Real authentication with JWT tokens
- **Token Refresh**: Automatic token refresh handling
- **Persistent Sessions**: localStorage integration
- **Loading States**: Proper loading indicators during auth operations

### 2. Real-time Data Fetching
- **Camera Status**: Live camera status monitoring
- **Anomaly Detection**: Real-time anomaly alerts
- **Dashboard Stats**: System health and performance metrics
- **Auto-refresh**: Polling for real-time updates

### 3. UI State Management
- **View Navigation**: Centralized active view state
- **Notifications**: Global notification system
- **Theme Management**: Dark/light mode support
- **Online/Offline**: Network status handling

### 4. Loading & Error Handling
- **Loading Skeletons**: Beautiful loading placeholders
- **Error States**: Comprehensive error handling
- **Empty States**: User-friendly empty data displays
- **Retry Logic**: Built-in retry mechanisms

## API Integration

### Endpoints Connected
- `POST /auth/login` - User authentication
- `POST /auth/logout` - User logout
- `GET /cameras` - Fetch cameras with pagination
- `GET /cameras/stats` - Camera statistics
- `GET /anomalies/recent` - Recent anomalies
- `GET /anomalies/stats` - Anomaly statistics
- `GET /dashboard/stats` - Dashboard statistics

### Real-time Features
- **Auto-polling**: Dashboard stats refresh every 30s
- **Live Updates**: System health checks every 15s
- **Metrics Monitoring**: Real-time metrics every 5s

## Components Updated

### 1. LoginScreen
- Integrated with `useLoginMutation`
- Real API authentication
- Error handling and validation
- Loading states with spinners

### 2. SecurityStats
- Connected to multiple API endpoints
- Real-time data visualization
- Dynamic status indicators
- Loading skeletons

### 3. Index (Main Dashboard)
- Redux state management
- Real camera and anomaly data
- Dynamic navigation
- Proper error boundaries

### 4. App Component
- Redux Provider setup
- Authentication initialization
- Online/offline detection
- Global state management

## TypeScript Integration

### Type Safety
- Comprehensive TypeScript interfaces
- Typed Redux hooks (`useAppSelector`, `useAppDispatch`)
- API response typing
- Error type handling

### Interfaces Defined
- `User`, `Camera`, `Anomaly` models
- Request/Response types
- Query parameter types
- API error types

## Loading Components

### Available Loaders
- `<Spinner />` - Basic loading spinner
- `<PageLoader />` - Full-page loading screen
- `<CardSkeleton />` - Card loading placeholder
- `<CameraGridSkeleton />` - Camera grid loading
- `<StatsGridSkeleton />` - Statistics loading
- `<ListItemSkeleton />` - List item loading

### Error/Empty States
- `<ErrorState />` - Error display with retry
- `<EmptyState />` - Empty data display

## Configuration

### API Base URL
Currently configured to: `http://13.203.202.92:3000/api`

### Polling Intervals
- Dashboard stats: 30 seconds
- System health: 15 seconds  
- Real-time metrics: 5 seconds

## Development

### Running the Application
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Environment Variables
Create a `.env` file:
```
VITE_API_URL=http://13.203.202.92:3000/api
```

## Backend Compatibility

This frontend is designed to work with the comprehensive backend API created in the `/server` directory. Ensure the backend server is running on port 3000 for full functionality.

### Required Backend Endpoints
- Authentication endpoints (`/auth/*`)
- Camera management (`/cameras/*`) 
- Anomaly detection (`/anomalies/*`)
- Dashboard statistics (`/dashboard/*`)

## Future Enhancements

### Planned Features
1. **WebSocket Integration**: Real-time alerts and notifications
2. **Offline Support**: Service worker for offline functionality
3. **Advanced Filtering**: Complex query builders
4. **Data Visualization**: Charts and graphs for analytics
5. **Mobile Optimization**: Responsive design improvements

### Performance Optimizations
1. **Code Splitting**: Route-based code splitting
2. **Caching**: Advanced RTK Query caching strategies
3. **Virtualization**: Large list virtualization
4. **Image Optimization**: Lazy loading and compression

## Testing

### Testing Strategy
- Unit tests for Redux slices
- Integration tests for API endpoints
- Component testing with React Testing Library
- E2E testing with Playwright

### Test Commands
```bash
npm run test          # Run unit tests
npm run test:e2e      # Run E2E tests
npm run test:coverage # Generate coverage report
```

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Ensure backend server is running on port 3000
   - Check CORS configuration
   - Verify API endpoint URLs

2. **Authentication Issues**
   - Clear localStorage if tokens are corrupted
   - Check JWT token expiration
   - Verify refresh token logic

3. **Loading States**
   - Check network connectivity
   - Verify API response formats
   - Look for console errors

### Debug Tips
- Use Redux DevTools Extension
- Check Network tab in browser DevTools
- Monitor console for API errors
- Use React Developer Tools

## Contributing

When contributing to the Redux implementation:

1. Follow TypeScript best practices
2. Add proper error handling
3. Include loading states
4. Write comprehensive types
5. Add JSDoc comments
6. Test API integrations

## Security Considerations

- JWT tokens stored in localStorage (consider httpOnly cookies for production)
- API calls include credentials
- Proper error message handling
- Input validation on frontend
- CSRF protection via backend integration 