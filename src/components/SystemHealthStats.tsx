import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useGetSystemHealthQuery } from '@/store/api/dashboardApi';
import { Loader2, Server, Database, Clock, Camera } from 'lucide-react';

export const SystemHealthStats = () => {
  const { data, isLoading, error } = useGetSystemHealthQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-32"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }
  if (error || !data?.data) {
    return <div className="text-center text-red-500">Failed to load system health.</div>;
  }

  const { system, cameras, alerts } = data.data;

  const stats = [
    {
      title: 'System Status',
      value: system.status,
      icon: Server,
      tooltip: 'Overall system health as reported by the backend.',
      badge: system.status === 'Healthy' ? 'success' : 'destructive',
    },
    {
      title: 'Uptime',
      value: system.uptime,
      icon: Clock,
      tooltip: 'How long the backend server has been running without interruption.',
      badge: 'default',
    },
    {
      title: 'Memory Usage',
      value: `${system.memory.used}MB / ${system.memory.total}MB`,
      icon: Server,
      tooltip: 'Current Node.js process memory usage (used/total in MB).',
      badge: 'default',
    },
    {
      title: 'Database',
      value: system.database.status,
      icon: Database,
      tooltip: `MongoDB connection status. Connections: ${system.database.connectionCount}`,
      badge: system.database.status === 'Connected' ? 'success' : 'destructive',
    },
    {
      title: 'Cameras Online',
      value: `${alerts.online} / ${alerts.total}`,
      icon: Camera,
      tooltip: 'Number of cameras online out of total configured.',
      badge: alerts.offline > 0 ? 'warning' : 'success',
    },
  ];

  return (
    <>
    </>
  );
};

export default SystemHealthStats; 