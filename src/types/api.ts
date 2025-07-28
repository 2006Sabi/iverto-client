// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  isApproved?: boolean;
  companyName?: string;
  role?: "user" | "admin";
  created_at?: string;
  credits?: number;
  apiKey?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  companyName: string;
}

export interface SendOTPRequest {
  email: string;
  name: string;
  companyName: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
  name: string;
  password: string;
  companyName: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    refreshToken: string;
    user: User;
  };
}

// Camera types
export interface Camera {
  _id: string;
  name: string;
  location: string;
  url: string;
  httpUrl: string; // New field for HTTP stream URL
  status: "Online" | "Offline";
  anomalyEntities: string[]; // Array of anomaly entity IDs
  created_at: string;
  updated_at: string;
}

export interface CreateCameraRequest {
  name: string;
  location: string;
  url: string;
  httpUrl: string; // New field for HTTP stream URL
  anomalyEntities: string[]; // Array of anomaly entity IDs to monitor
}

export interface UpdateCameraRequest {
  name?: string;
  location?: string;
  url?: string;
  httpUrl?: string; // New field for HTTP stream URL
  status?: "Online" | "Offline";
}

// Anomaly types
export interface Anomaly {
  _id: string;
  camera_id: string;
  type:
    | "Intrusion"
    | "Loitering"
    | "Fire"
    | "Vandalism"
    | "Suspicious Activity";
  timestamp: string;
  duration: string;
  confidence: number;
  clip_url: string;
  status: "Active" | "Acknowledged" | "Resolved";
  location: string;
  description: string;
  created_at: string;
}

export interface CreateAnomalyRequest {
  camera_id: string;
  type:
    | "Intrusion"
    | "Loitering"
    | "Fire"
    | "Vandalism"
    | "Suspicious Activity";
  timestamp: string;
  duration: string;
  confidence: number;
  clip_url: string;
  location: string;
  description: string;
}

export interface UpdateAnomalyRequest {
  status: "Active" | "Acknowledged" | "Resolved";
}

// Dashboard types
export interface DashboardStats {
  totalCameras: number;
  activeCameras: number;
  offlineCameras: number;
  anomaliesToday: number;
  highPriorityAnomalies: number;
  systemUptime: string;
  averageProcessingFps: number;
  recentAnomalies: Anomaly[];
  activeCamerasList: Camera[];
  systemStartTime?: string;
}

// Common response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Query parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface CameraQueryParams extends PaginationParams {
  status?: "Online" | "Offline";
  search?: string;
}

export interface AnomalyQueryParams extends PaginationParams {
  type?: string;
  status?: "Active" | "Acknowledged" | "Resolved";
  camera_id?: string;
  minConfidence?: number;
  startDate?: string;
  endDate?: string;
}

export interface AnomalyEntity {
  _id: string;
  name: string;
  code: string;
  description: string;
  user_id: User;
  created_by: User;
  is_active: boolean;
  created_at: string;
  createdAt: string;
  updatedAt: string;
}
