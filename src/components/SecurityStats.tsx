import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Shield,
  AlertTriangle,
  Eye,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  useDashboardStats,
  useCameraStats,
  useAnomalyStats,
} from "@/hooks/useReduxData";
import { StatsGridSkeleton } from "@/components/ui/loading";
import { useUptime } from "@/hooks/useUptime";
import { useAppSelector } from "@/store/hooks";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const SecurityStats = () => {
  const { data: dashboardStats, loading: dashboardLoading } =
    useDashboardStats();
  const { data: cameraStats, loading: cameraLoading } = useCameraStats();
  const { data: anomalyStats, loading: anomalyLoading } = useAnomalyStats();
  const realtimeData = useAppSelector((state) => state.realtime);

  // Use the dynamic uptime hook with the system start time from backend
  const uptime = useUptime(dashboardStats?.data?.systemStartTime);

  const isLoading = dashboardLoading || cameraLoading || anomalyLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-20 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Merge real-time data with API data
  const mergedStats = useMemo(() => {
    const baseActiveCameras = cameraStats?.data?.activeCameras || 0;
    const baseTotalCameras = cameraStats?.data?.totalCameras || 0;
    const baseOfflineCameras = cameraStats?.data?.offlineCameras || 0;

    // Count cameras that have real-time status updates
    const realtimeOfflineCount = Object.values(
      realtimeData.cameraStatusUpdates
    ).filter((status) => status === "Offline").length;

    // Adjust counts based on real-time updates
    const adjustedActiveCameras = Math.max(
      0,
      baseActiveCameras - realtimeOfflineCount
    );
    const adjustedOfflineCameras = baseOfflineCameras + realtimeOfflineCount;

    return {
      activeCameras: adjustedActiveCameras,
      totalCameras: baseTotalCameras,
      offlineCameras: adjustedOfflineCameras,
      anomaliesToday: dashboardStats?.data?.anomaliesToday || 0,
      highPriorityAnomalies: anomalyStats?.data?.highPriorityAnomalies || 0,
      activeAnomalies: anomalyStats?.data?.activeAnomalies || 0,
      averageProcessingFps: dashboardStats?.data?.averageProcessingFps || 0,
    };
  }, [
    cameraStats?.data,
    dashboardStats?.data,
    anomalyStats?.data,
    realtimeData.cameraStatusUpdates,
  ]);

  const stats = [
    {
      title: "Active Cameras",
      value: `${mergedStats.activeCameras}/${mergedStats.totalCameras}`,
      change:
        mergedStats.offlineCameras > 0
          ? `${mergedStats.offlineCameras} offline`
          : "All online",
      icon: Camera,
      status: mergedStats.offlineCameras > 0 ? "warning" : "success",
      description: `${mergedStats.activeCameras} cameras active`,
    },
    {
      title: "Anomalies Today",
      value: mergedStats.anomaliesToday.toString(),
      change: `${mergedStats.activeAnomalies} active`,
      icon: AlertTriangle,
      status:
        mergedStats.highPriorityAnomalies > 0
          ? "alert"
          : mergedStats.activeAnomalies > 0
          ? "warning"
          : "success",
      description: `${mergedStats.highPriorityAnomalies} high priority`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
      {stats.map((stat, index) => (
        <Card key={index} className="modern-card p-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground/80">
              {stat.title}
            </CardTitle>
            <div
              className={`p-2 sm:p-3 rounded-2xl ${
                stat.status === "success"
                  ? "bg-green-500/10"
                  : stat.status === "warning"
                  ? "bg-yellow-500/10"
                  : stat.status === "alert"
                  ? "bg-red-500/10"
                  : "bg-primary/10"
              }`}
            >
              <stat.icon
                className={`h-4 w-4 sm:h-5 sm:w-5 ${
                  stat.status === "success"
                    ? "text-green-600"
                    : stat.status === "warning"
                    ? "text-yellow-600"
                    : stat.status === "alert"
                    ? "text-red-600"
                    : "text-primary"
                }`}
              />
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2 truncate">
                  {stat.value}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {stat.description}
                </p>
              </div>
              <Badge
                variant={stat.change.startsWith("+") ? "default" : "secondary"}
                className="sleek-badge bg-primary/10 text-primary border-0 hover:bg-primary/20 text-xs sm:text-sm flex-shrink-0 ml-2"
              >
                {stat.change}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
