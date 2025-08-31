// Fallback data for when API endpoints are unavailable
export const fallbackData = {
  // Fallback data for anomaly stats
  anomalyStats: {
    totalAnomalies: 150,
    activeAnomalies: 12,
    acknowledgedAnomalies: 25,
    resolvedAnomalies: 113,
    highPriorityAnomalies: 8,
    anomaliesToday: 5,
  },

  // Fallback data for recent anomalies
  recentAnomalies: [
    {
      _id: "fallback-1",
      type: "Motion Detection",
      location: "Main Entrance",
      confidence: 95,
      status: "Active",
      timestamp: new Date().toISOString(),
      camera_id: "fallback-camera-1",
    },
    {
      _id: "fallback-2",
      type: "Object Detection",
      location: "Parking Lot",
      confidence: 87,
      status: "Acknowledged",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      camera_id: "fallback-camera-2",
    },
  ],
};

// Helper function to get fallback data based on endpoint
export const getFallbackData = (endpoint: string) => {
  switch (endpoint) {
    case "/anomalies/stats":
      return fallbackData.anomalyStats;
    case "/anomalies/recent":
      return fallbackData.recentAnomalies;
    default:
      return null;
  }
};
