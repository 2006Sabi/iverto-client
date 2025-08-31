export interface DashboardStats {
  data: {
    totalCameras: number;
    activeCameras: number;
    offlineCameras: number;
    anomaliesToday: number;
    highPriorityAnomalies: number;
    systemUptime: number;
    lastUpdate: string;
  };
}

export interface SystemHealth {
  data: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
    temperature: number;
    uptime: number;
    lastUpdate: string;
  };
}

export interface CameraStats {
  data: {
    totalCameras: number;
    activeCameras: number;
    offlineCameras: number;
    totalRecordings: number;
    storageUsed: number;
    storageTotal: number;
    lastUpdate: string;
  };
}

export interface AnomalyStats {
  data: {
    totalAnomalies: number;
    activeAnomalies: number;
    resolvedAnomalies: number;
    falsePositives: number;
    anomaliesToday: number;
    highPriorityAnomalies: number;
    lastUpdate: string;
  };
}
