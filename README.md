# Iverto Security System - Frontend Application

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Features](#features)
5. [Project Structure](#project-structure)
6. [Setup & Installation](#setup--installation)
7. [Development](#development)
8. [State Management](#state-management)
9. [Caching System](#caching-system)
10. [Real-time Communication](#real-time-communication)
11. [Authentication](#authentication)
12. [API Integration](#api-integration)
13. [Components](#components)
14. [Pages](#pages)
15. [Styling & UI](#styling--ui)
16. [Error Handling](#error-handling)
17. [Performance Optimizations](#performance-optimizations)
18. [Testing](#testing)
19. [Deployment](#deployment)
20. [Troubleshooting](#troubleshooting)
21. [Contributing](#contributing)

## 🎯 Overview

Iverto is a comprehensive security monitoring system that provides real-time camera surveillance, anomaly detection, and alert management. The frontend application is built with React, TypeScript, and Redux Toolkit, featuring a modern UI with shadcn/ui components and real-time WebSocket communication.

### Key Capabilities
- **Real-time Camera Monitoring**: Live video feeds with status tracking
- **AI-Powered Anomaly Detection**: Automatic detection of security threats
- **Alert Management**: Real-time notifications and alert handling
- **Dashboard Analytics**: Comprehensive system statistics and health monitoring
- **User Authentication**: Secure login with JWT token management
- **Responsive Design**: Mobile-friendly interface

## 🏗️ Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   Redux Store   │    │   WebSocket     │
│   (Frontend)    │◄──►│   (State Mgmt)  │◄──►│   (Real-time)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   LocalStorage  │    │   RTK Query     │    │   Backend API   │
│   (Caching)     │    │   (API Layer)   │    │   (Server)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow
1. **App Initialization**: Load cached data → Initialize auth → Connect WebSocket
2. **User Navigation**: Use cached data for instant UI rendering
3. **Real-time Updates**: WebSocket events → Redux store → UI updates
4. **Manual Refresh**: Clear cache → API calls → Update UI

## 🛠️ Technology Stack

### Core Technologies
- **React 18.3.1**: Modern React with hooks and concurrent features
- **TypeScript 5.5.3**: Type-safe JavaScript development
- **Vite 5.4.1**: Fast build tool and development server
- **Redux Toolkit 2.8.2**: Modern Redux with RTK Query
- **React Router 6.26.2**: Client-side routing

### UI & Styling
- **Tailwind CSS 3.4.11**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components
- **Radix UI**: Accessible component primitives
- **Lucide React**: Beautiful icons
- **Sonner**: Toast notifications

### State Management & Data
- **Redux Toolkit**: Centralized state management
- **RTK Query**: API data fetching and caching
- **Socket.io Client**: Real-time WebSocket communication
- **React Hook Form**: Form handling and validation
- **Zod**: Schema validation

### Development Tools
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## ✨ Features

### 🔐 Authentication System
- **JWT Token Management**: Secure authentication with automatic token refresh
- **Persistent Sessions**: localStorage-based session persistence
- **Role-based Access**: User and admin role support
- **Protected Routes**: Route-level authentication guards

### 📹 Camera Management
- **Live Camera Feeds**: Real-time video stream monitoring
- **Camera Status Tracking**: Live/Offline status monitoring
- **Camera Operations**: Add, edit, and manage cameras
- **Grid Layout**: Responsive camera grid display

### 🚨 Anomaly Detection
- **Real-time Alerts**: Instant anomaly notifications
- **Multiple Detection Types**: Intrusion, Loitering, Fire, Vandalism, Suspicious Activity
- **Confidence Scoring**: AI confidence levels for each detection
- **Alert Management**: Acknowledge and resolve alerts

### 📊 Dashboard Analytics
- **System Statistics**: Camera counts, anomaly metrics, uptime
- **Real-time Metrics**: Live system performance data
- **Health Monitoring**: System status and performance indicators
- **Auto-refresh**: Automatic data updates every 30 seconds

### 🔄 Real-time Features
- **WebSocket Communication**: Live data synchronization
- **Instant Updates**: Real-time anomaly and camera status updates
- **Connection Management**: Automatic reconnection and error handling
- **Status Indicators**: Connection status display

### 💾 Caching System
- **LocalStorage Caching**: Persistent data storage with expiration
- **Smart Data Management**: Load once, use everywhere approach
- **Version Control**: Cache invalidation on app updates
- **Error Recovery**: Graceful fallback to API calls

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── AuthGuard.tsx    # Authentication wrapper
│   ├── AppSidebar.tsx   # Navigation sidebar
│   ├── SecurityStats.tsx # Dashboard statistics
│   └── ...
├── pages/               # Route components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Cameras.tsx      # Camera management
│   ├── Alerts.tsx       # Anomaly alerts
│   └── ...
├── store/               # Redux store configuration
│   ├── api/             # RTK Query API slices
│   ├── slices/          # Redux slices
│   └── index.ts         # Store configuration
├── hooks/               # Custom React hooks
│   ├── useCachedData.ts # Cached data hooks
│   ├── useAuth.ts       # Authentication hooks
│   └── ...
├── services/            # Business logic services
│   ├── dataInitializer.ts # Data initialization service
│   └── operationService.ts # Operation handling
├── contexts/            # React contexts
│   └── WebSocketContext.tsx # WebSocket provider
├── config/              # Configuration files
│   └── environment.ts   # Environment variables
├── types/               # TypeScript type definitions
│   └── api.ts          # API type interfaces
├── lib/                 # Utility libraries
│   └── utils.ts        # Common utilities
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## 🚀 Setup & Installation

### Prerequisites
- **Node.js**: Version 18 or higher
- **npm**: Package manager
- **Git**: Version control

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Iverto/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the client directory:
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_SOCKET_URL=http://localhost:3000
   VITE_APP_NAME=Iverto Security System
   VITE_APP_VERSION=1.0.0
   VITE_ENABLE_ANALYTICS=false
   VITE_ENABLE_DEBUG_MODE=true
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open [http://localhost:5173](http://localhost:5173) in your browser

### Build for Production
```bash
npm run build
npm run preview
```

## 💻 Development

### Available Scripts
- `npm run dev`: Start development server with hot reload
- `npm run build`: Build for production
- `npm run build:dev`: Build for development
- `npm run lint`: Run ESLint
- `npm run preview`: Preview production build

### Development Workflow
1. **Feature Development**: Create feature branches from main
2. **Code Style**: Follow TypeScript and ESLint rules
3. **Testing**: Write tests for new features
4. **Documentation**: Update documentation for API changes
5. **Review**: Submit pull requests for code review

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Enforced code style and best practices
- **Prettier**: Consistent code formatting
- **Component Structure**: Functional components with hooks
- **Error Handling**: Comprehensive error boundaries and fallbacks

## 🔄 State Management

### Redux Store Structure
```typescript
{
  // API slices (RTK Query)
  baseApi: {
    queries: { /* cached API data */ },
    mutations: { /* API mutations */ },
    provided: { /* cache tags */ }
  },
  
  // Regular slices
  auth: {
    user: User | null,
    token: string | null,
    isAuthenticated: boolean,
    isLoading: boolean
  },
  
  ui: {
    activeView: string,
    sidebarOpen: boolean,
    notifications: Notification[],
    isOnline: boolean
  },
  
  realtime: {
    connectionStatus: 'connected' | 'disconnected' | 'error',
    latestAnomalies: Anomaly[],
    activeAnomalies: Anomaly[],
    connectionErrors: string[]
  },
  
  data: {
    dashboardStats: DashboardStats | null,
    systemHealth: SystemHealth | null,
    cameras: Camera[],
    anomalies: Anomaly[],
    loading: Record<string, boolean>,
    errors: Record<string, string>
  }
}
```

### RTK Query API Slices
- **authApi**: Authentication endpoints (login, logout, profile)
- **cameraApi**: Camera management (CRUD operations, stats)
- **anomalyApi**: Anomaly handling (fetch, acknowledge, resolve)
- **dashboardApi**: Dashboard statistics and health data

### State Persistence
- **localStorage**: Authentication tokens and user data
- **Session Storage**: Temporary session data
- **Redux Persist**: Automatic state persistence (if configured)

## 💾 Caching System

### Architecture Overview
The application implements a sophisticated caching system that loads all data once on startup and stores it in localStorage for instant UI rendering.

### Key Features
- **Singleton Pattern**: Single data initializer instance
- **Metadata Storage**: Timestamp and version tracking
- **Automatic Expiration**: 5-minute cache expiration
- **Version Control**: Cache invalidation on app updates
- **Error Recovery**: Graceful fallback to API calls

### Storage Keys
```typescript
const STORAGE_KEYS = {
  DASHBOARD_STATS: 'inverto_dashboard_stats',
  SYSTEM_HEALTH: 'inverto_system_health',
  ANOMALIES: 'inverto_anomalies',
  CAMERAS: 'inverto_cameras',
  // ... more keys
};
```

### Data Structure
```typescript
interface StoredData {
  data: any;           // Actual data
  timestamp: number;   // Cache timestamp
  version: string;     // App version
}
```

### Usage Examples
```typescript
// Use cached data hooks
const { data, loading, error } = useCachedDashboardStats();
const { data, loading, error } = useCachedCameras();
const { data, loading, error } = useCachedAnomalies();

// Manual refresh
const { refreshData, refreshing } = useDataRefresh();
```

## 🔌 Real-time Communication

### WebSocket Integration
The application uses Socket.io for real-time communication with the backend server.

### Connection Management
```typescript
// WebSocket configuration
const socket = io(SOCKET_URL, {
  auth: { token },
  transports: ['websocket', 'polling'],
  timeout: 60000,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});
```

### Event Handling
- **anomaly:new**: New anomaly detection
- **camera:status**: Camera status updates
- **system:health**: System health updates
- **connection:status**: Connection status changes

### Real-time Features
- **Live Anomaly Alerts**: Instant notification of new anomalies
- **Camera Status Updates**: Real-time camera online/offline status
- **System Health Monitoring**: Live system performance data
- **Connection Status**: Real-time connection monitoring

### Usage
```typescript
// WebSocket context
const { isConnected, socket, connectionStatus } = useWebSocket();

// Subscribe to anomalies
const unsubscribe = subscribeToAnomalies((anomaly) => {
  console.log('New anomaly:', anomaly);
});
```

## 🔐 Authentication

### JWT Token Management
- **Access Token**: Short-lived token for API requests
- **Refresh Token**: Long-lived token for token renewal
- **Automatic Refresh**: Seamless token renewal
- **Token Storage**: Secure localStorage storage

### Authentication Flow
1. **Login**: User credentials → JWT tokens
2. **Token Storage**: Tokens stored in localStorage
3. **API Requests**: Automatic token inclusion in headers
4. **Token Refresh**: Automatic renewal on 401 responses
5. **Logout**: Clear tokens and redirect to login

### Protected Routes
```typescript
// AuthGuard component
<AuthGuard>
  <ProtectedComponent />
</AuthGuard>
```

### Authentication State
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  profileChecked: boolean;
}
```

## 🌐 API Integration

### Base API Configuration
```typescript
const baseQuery = fetchBaseQuery({
  baseUrl: config.apiUrl,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});
```

### API Endpoints
- **Authentication**: `/auth/login`, `/auth/logout`, `/auth/refresh`
- **Cameras**: `/cameras`, `/cameras/stats`, `/cameras/:id`
- **Anomalies**: `/anomalies`, `/anomalies/recent`, `/anomalies/:id`
- **Dashboard**: `/dashboard/stats`, `/dashboard/health`

### Error Handling
- **Network Errors**: Automatic retry with exponential backoff
- **Authentication Errors**: Automatic token refresh
- **Validation Errors**: User-friendly error messages
- **Server Errors**: Graceful degradation

### Request/Response Types
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

## 🧩 Components

### Core Components

#### Authentication Components
- **AuthGuard**: Route protection wrapper
- **LoginScreen**: User login interface
- **RegistrationScreen**: User registration interface
- **Profile**: User profile management

#### Navigation Components
- **AppSidebar**: Main navigation sidebar
- **NavigationHeader**: Top navigation header
- **DataRefreshButton**: Manual data refresh button

#### Camera Components
- **LiveCameraView**: Individual camera display
- **LiveCameraGrid**: Camera grid layout
- **AddCameraDialog**: Camera addition interface

#### Anomaly Components
- **AnomalyAlerts**: Anomaly list and management
- **GlobalAnomalyNotifier**: Global anomaly notifications

#### Dashboard Components
- **SecurityStats**: System statistics display
- **DebugInfo**: Development debugging information

### UI Components (shadcn/ui)
- **Button**: Various button variants
- **Card**: Content containers
- **Dialog**: Modal dialogs
- **Form**: Form components with validation
- **Toast**: Notification system
- **Table**: Data tables
- **Charts**: Data visualization

### Component Patterns
- **Functional Components**: Modern React with hooks
- **TypeScript**: Full type safety
- **Error Boundaries**: Graceful error handling
- **Loading States**: Skeleton loaders and spinners
- **Responsive Design**: Mobile-first approach

## 📄 Pages

### Main Pages

#### Dashboard (`/dashboard`)
- **Purpose**: Main application dashboard
- **Features**: System overview, statistics, recent anomalies
- **Components**: SecurityStats, LiveCameraGrid, AnomalyAlerts

#### Cameras (`/cameras`)
- **Purpose**: Camera management and monitoring
- **Features**: Camera grid, status monitoring, camera operations
- **Components**: LiveCameraGrid, AddCameraDialog

#### Alerts (`/alerts`)
- **Purpose**: Anomaly alert management
- **Features**: Alert list, acknowledge/resolve actions
- **Components**: AnomalyAlerts

#### Profile (`/profile`)
- **Purpose**: User profile management
- **Features**: Profile editing, settings
- **Components**: Profile form

#### Authentication Pages
- **Login (`/login`)**: User authentication
- **Register (`/register`)**: User registration
- **NotFound (`*`)**: 404 error page

### Page Structure
```typescript
// Page component example
const Dashboard = () => {
  const { data, loading, error } = useCachedDashboardStats();
  
  if (loading) return <PageLoader />;
  if (error) return <ErrorState error={error} />;
  
  return (
    <div className="dashboard">
      <SecurityStats data={data} />
      <LiveCameraGrid />
      <AnomalyAlerts />
    </div>
  );
};
```

## 🎨 Styling & UI

### Design System
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Component library
- **Radix UI**: Accessible primitives
- **Custom Theme**: Brand-specific styling

### Color Palette
```css
/* Primary colors */
--primary: #3b82f6;
--primary-foreground: #ffffff;

/* Secondary colors */
--secondary: #f1f5f9;
--secondary-foreground: #0f172a;

/* Accent colors */
--accent: #f59e0b;
--accent-foreground: #ffffff;

/* Status colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
```

### Responsive Design
- **Mobile First**: Base styles for mobile devices
- **Breakpoints**: sm, md, lg, xl, 2xl
- **Flexible Layouts**: Grid and flexbox layouts
- **Touch Friendly**: Mobile-optimized interactions

### Component Styling
```typescript
// Tailwind classes
className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"

// Custom CSS classes
className="dashboard-card"

// Dynamic styling
className={cn(
  "base-classes",
  variant === "primary" && "primary-classes",
  size === "large" && "large-classes"
)}
```

## ⚠️ Error Handling

### Error Boundaries
```typescript
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    return <ErrorFallback onRetry={() => window.location.reload()} />;
  }
  
  return <div onError={() => setHasError(true)}>{children}</div>;
};
```

### API Error Handling
- **Network Errors**: Retry mechanisms with exponential backoff
- **Authentication Errors**: Automatic token refresh
- **Validation Errors**: User-friendly error messages
- **Server Errors**: Graceful degradation

### User Feedback
- **Toast Notifications**: Success, error, and info messages
- **Loading States**: Skeleton loaders and spinners
- **Error States**: Retry buttons and error messages
- **Empty States**: Helpful messages for empty data

### Error Recovery
- **Automatic Retry**: Failed requests retry automatically
- **Manual Refresh**: User-initiated data refresh
- **Cache Fallback**: Use cached data when API fails
- **Graceful Degradation**: Continue working with limited functionality

## ⚡ Performance Optimizations

### Code Splitting
- **Route-based Splitting**: Lazy load page components
- **Component Splitting**: Split large components
- **Dynamic Imports**: Load components on demand

### Caching Strategies
- **RTK Query Caching**: Automatic API response caching
- **LocalStorage Caching**: Persistent data storage
- **Memory Caching**: In-memory data caching
- **Cache Invalidation**: Smart cache management

### Bundle Optimization
- **Tree Shaking**: Remove unused code
- **Minification**: Compress production builds
- **Gzip Compression**: Reduce transfer sizes
- **CDN Usage**: Distribute static assets

### Rendering Optimizations
- **React.memo**: Prevent unnecessary re-renders
- **useMemo**: Memoize expensive calculations
- **useCallback**: Memoize function references
- **Virtual Scrolling**: Handle large lists efficiently

### Image Optimization
- **Lazy Loading**: Load images on demand
- **WebP Format**: Modern image format support
- **Responsive Images**: Different sizes for different devices
- **Image Compression**: Optimize image file sizes

## 🧪 Testing

### Testing Strategy
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API integration testing
- **E2E Tests**: End-to-end user flow testing
- **Visual Tests**: UI component testing

### Testing Tools
- **Jest**: JavaScript testing framework
- **React Testing Library**: Component testing utilities
- **MSW**: API mocking
- **Playwright**: E2E testing

### Test Structure
```
tests/
├── unit/              # Unit tests
├── integration/       # Integration tests
├── e2e/              # End-to-end tests
└── __mocks__/        # Mock files
```

### Example Tests
```typescript
// Component test
describe('SecurityStats', () => {
  it('renders statistics correctly', () => {
    render(<SecurityStats data={mockData} />);
    expect(screen.getByText('Total Cameras')).toBeInTheDocument();
  });
});

// Hook test
describe('useCachedData', () => {
  it('returns cached data', async () => {
    const { result } = renderHook(() => useCachedDashboardStats());
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });
});
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Configuration
```env
# Production environment variables
VITE_API_URL=https://api.iverto.com/api
VITE_SOCKET_URL=https://api.iverto.com
VITE_APP_NAME=Iverto Security System
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_MODE=false
```

### Deployment Platforms

#### Vercel
```bash
npm install -g vercel
vercel --prod
```

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### CI/CD Pipeline
```yaml
# GitHub Actions example
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
```

## 🔧 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run lint
```

#### Runtime Errors
```bash
# Check browser console for errors
# Verify environment variables
# Check API server connectivity
```

#### Performance Issues
```bash
# Analyze bundle size
npm run build -- --analyze

# Check for memory leaks
# Monitor network requests
```

### Debug Tools
- **Redux DevTools**: State inspection and time-travel debugging
- **React DevTools**: Component tree and props inspection
- **Network Tab**: API request monitoring
- **Console Logs**: Application logging

### Debug Mode
```typescript
// Enable debug mode
VITE_ENABLE_DEBUG_MODE=true

// Debug components
<DebugInfo />
```

### Error Reporting
- **Console Logging**: Detailed error logging
- **Error Boundaries**: Graceful error handling
- **User Feedback**: Toast notifications for errors
- **Analytics**: Error tracking (if enabled)

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

### Code Standards
- **TypeScript**: Strict type checking
- **ESLint**: Code style enforcement
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format

### Pull Request Process
1. **Description**: Clear description of changes
2. **Testing**: Include tests for new features
3. **Documentation**: Update documentation
4. **Review**: Code review required
5. **CI/CD**: All checks must pass

### Commit Message Format
```
type(scope): description

feat(auth): add OAuth login support
fix(api): resolve token refresh issue
docs(readme): update installation instructions
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- **Documentation**: Check this README and inline code comments
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact the development team

---

**Last Updated**: Current version as of latest changes
**Version**: 1.0.0
**Maintainers**: Iverto Development Team