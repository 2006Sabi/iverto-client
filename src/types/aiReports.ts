// AI Reports API types
export interface AIReport {
  _id: string;
  user_id: string;
  camera_id: {
    _id: string;
    name: string;
    location: string;
  };
  awayTime: number;
  workingTime: number;
  idealTime: number;
  productivityScore: number;
  confidenceScore: number;
  startTime: string;
  endTime: string;
  created_at: string;
  updated_at: string;
}

export interface ProductivityAnalytics {
  totalReports: number;
  averageProductivityScore: number;
  averageAwayTime: number;
  averageWorkingTime: number;
  averageIdealTime: number;
  totalAwayTime: number;
  totalWorkingTime: number;
  totalIdealTime: number;
  reportsCount: number;
}

export interface StateData {
  _id: string;
  user_id: string;
  camera_id: {
    _id: string;
    name: string;
    location: string;
  };
  awayTime: number;
  workingTime: number;
  idealTime: number;
  productivityScore: number;
  confidenceScore: number;
  startTime: string;
  endTime: string;
  created_at: string;
  updated_at: string;
}

export interface AIReportsResponse {
  success: boolean;
  message: string;
  data: AIReport[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductivityAnalyticsResponse {
  success: boolean;
  message: string;
  data: ProductivityAnalytics;
}

export interface StateDataResponse {
  success: boolean;
  message: string;
  data: StateData[];
}
