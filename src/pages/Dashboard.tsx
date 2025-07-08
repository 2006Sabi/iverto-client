import { useEffect, useMemo } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAppSelector } from "@/store/hooks";
import {
  useCameras,
  useRecentAnomalies,
  useRealtimeAnomalies,
} from "@/hooks/useReduxData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, AlertTriangle, Wifi, WifiOff } from "lucide-react";
import { ListItemSkeleton } from "@/components/ui/loading";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

const Dashboard = () => {
  const { connectionStatus, isConnected } = useWebSocket();
  const { latestAnomalies } = useRealtimeAnomalies();
  const { data: cameras, loading: camerasLoading } = useCameras();
  const { data: recentAnomalies, loading: anomaliesLoading } =
    useRecentAnomalies();

  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const mergedCameras = useMemo(() => {
    if (!cameras) return [];
    return cameras.map((camera) => ({ ...camera, status: camera.status }));
  }, [cameras]);

  const mergedAnomalies = useMemo(() => {
    const realtimeAnomalies = latestAnomalies.slice(0, 4);
    return realtimeAnomalies.length > 0
      ? realtimeAnomalies
      : recentAnomalies || [];
  }, [latestAnomalies, recentAnomalies]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-blue-100">
        {/* Responsive Sidebar: Drawer for mobile/tablet, static for desktop */}
        {isMobile ? (
          <>
            <button
              className="fixed top-4 left-4 z-50 bg-white rounded-full shadow p-2 border border-gray-200"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-menu"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            {sidebarOpen && (
              <div
                className="fixed inset-0 z-50 bg-black/40"
                onClick={() => setSidebarOpen(false)}
              >
                <div
                  className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <AppSidebar />
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-900"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close sidebar"
                  >
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="feather feather-x"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <AppSidebar />
        )}
        <SidebarInset className="flex-1">
          <header className="flex h-14 items-center gap-4 border-b border-gray-200 px-4 sm:px-8 bg-white shadow-sm">
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1 px-3 py-1 rounded-full font-medium text-xs shadow-inner transition-colors ${
                  isConnected
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {isConnected ? (
                  <Wifi className="h-4 w-4" />
                ) : (
                  <WifiOff className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {connectionStatus === "connected" ? "Live" : connectionStatus}
                </span>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6">
            <div className="grid xl:grid-cols-2 gap-6">
              <div className="flex flex-col gap-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <Card className="modern-card bg-gradient-to-tr from-green-100 via-green-50 to-white border border-green-200 shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="px-6 pt-6 pb-4">
                      <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                        <div className="p-2 rounded-xl bg-green-200">
                          <Camera className="h-6 w-6 text-green-700" />
                        </div>
                        Active Cameras
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 flex items-center justify-center text-4xl font-bold text-green-700">
                      {
                        mergedCameras.filter((c) => c.status !== "Offline")
                          .length
                      }
                      <span className="ml-2 text-xl text-gray-500 font-normal">
                        / {mergedCameras.length}
                      </span>
                    </CardContent>
                  </Card>

                  <Card className="modern-card bg-gradient-to-tr from-red-100 via-red-50 to-white border border-red-200 shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="px-6 pt-6 pb-4">
                      <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                        <div className="p-2 rounded-xl bg-red-200">
                          <AlertTriangle className="h-6 w-6 text-red-700" />
                        </div>
                        Anomalies Today
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 flex items-center justify-center text-4xl font-bold text-red-700">
                      {Array.isArray(mergedAnomalies)
                        ? mergedAnomalies.length
                        : 0}
                    </CardContent>
                  </Card>
                </div>

                <Card className="modern-card bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="px-6 pt-6 pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                      <div className="p-2 rounded-xl bg-blue-100">
                        <Camera className="h-6 w-6 text-blue-700" />
                      </div>
                      Live Camera Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    {camerasLoading ? (
                      <ListItemSkeleton count={6} />
                    ) : mergedCameras.length ? (
                      <div className="space-y-4">
                        {mergedCameras.slice(0, 6).map((camera) => (
                          <div
                            key={camera._id}
                            className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                          >
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                              <div
                                className={`w-4 h-4 rounded-full ${
                                  camera.status === "Offline"
                                    ? "bg-red-500"
                                    : "bg-green-500"
                                }`}
                              />
                              <div className="min-w-0 flex-1">
                                <span className="font-semibold text-gray-800 text-base truncate block">
                                  {camera.name}
                                </span>
                                <p className="text-sm text-gray-500 truncate">
                                  {camera.location}
                                </p>
                              </div>
                            </div>
                            <Badge
                              className={`text-xs px-3 py-1 rounded-full ${
                                camera.status === "Offline"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {camera.status === "Offline" ? "Offline" : "Live"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 text-base">
                        No cameras configured yet
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col gap-6">
                <Card className="modern-card bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="px-6 pt-6 pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                      <div className="p-2 rounded-xl bg-red-100">
                        <AlertTriangle className="h-6 w-6 text-red-700" />
                      </div>
                      Recent Anomalies
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    {anomaliesLoading ? (
                      <ListItemSkeleton count={4} />
                    ) : mergedAnomalies.length ? (
                      <div className="space-y-4">
                        {mergedAnomalies.map((anomaly) => (
                          <div
                            key={anomaly._id}
                            className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition group"
                          >
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-3 flex-wrap">
                                <Badge
                                  className={`text-xs px-3 py-1 rounded-full ${
                                    anomaly.confidence >= 80
                                      ? "bg-red-100 text-red-700"
                                      : anomaly.confidence >= 60
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {anomaly.type}
                                </Badge>
                                <span className="text-sm text-gray-600 truncate">
                                  {anomaly.location}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">
                                {new Date(anomaly.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-blue-600"
                              onClick={() =>
                                navigate("/alerts", {
                                  state: { anomalyId: anomaly._id },
                                })
                              }
                            >
                              View
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 text-base">
                        No recent anomalies detected
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
