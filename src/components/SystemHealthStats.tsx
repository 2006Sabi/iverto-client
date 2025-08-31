import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetSystemHealthQuery } from "@/store/api/dashboardApi";
import { Loader2, Server, Database, Clock, Camera } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const SystemHealthStats = () => {
  const { data, isLoading, error } = useGetSystemHealthQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

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
  if (error || !data?.data) {
    return (
      <div className="text-center text-red-500">
        Failed to load system health.
      </div>
    );
  }

  const { system, cameras, alerts } = data.data;

  const stats = [
    {
      title: "System Status",
      value: system.status,
      icon: Server,
      tooltip: "Overall system health as reported by the backend.",
      badge: system.status === "Healthy" ? "success" : "destructive",
    },
    {
      title: "Uptime",
      value: system.uptime,
      icon: Clock,
      tooltip:
        "How long the backend server has been running without interruption.",
      badge: "default",
    },
    {
      title: "Memory Usage",
      value: `${system.memory.used}MB / ${system.memory.total}MB`,
      icon: Server,
      tooltip: "Current Node.js process memory usage (used/total in MB).",
      badge: "default",
    },
    {
      title: "Database",
      value: system.database.status,
      icon: Database,
      tooltip: `MongoDB connection status. Connections: ${system.database.connectionCount}`,
      badge: system.database.status === "Connected" ? "success" : "destructive",
    },
    {
      title: "Cameras Online",
      value: `${alerts.online} / ${alerts.total}`,
      icon: Camera,
      tooltip: "Number of cameras online out of total configured.",
      badge: alerts.offline > 0 ? "warning" : "success",
    },
  ];

  return <></>;
};

export default SystemHealthStats;
