import { useEffect, useState } from "react";
import { Eye, AlertTriangle, Camera, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthScreen } from "@/components/AuthScreen";
import { LiveCameraView } from "@/components/LiveCameraView";
import { AnomalyAlerts } from "@/components/AnomalyAlerts";
import { SecurityStats } from "@/components/SecurityStats";
import { Profile } from "@/components/Profile";
import { SystemHealthStats } from "@/components/SystemHealthStats";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useGetCamerasQuery } from "@/store/api/cameraApi";
import { useGetRecentAnomaliesQuery } from "@/store/api/anomalyApi";
import { setActiveView } from "@/store/slices/uiSlice";
import { logout } from "@/store/slices/authSlice";
import { PageLoader, ListItemSkeleton } from "@/components/ui/loading";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAppSelector(
    (state) => state.auth
  );
  const { activeView } = useAppSelector((state) => state.ui);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Fetch real-time data
  const { data: camerasData, isLoading: camerasLoading } = useGetCamerasQuery({
    limit: 10,
  });
  const { data: recentAnomalies, isLoading: anomaliesLoading } =
    useGetRecentAnomaliesQuery(
      { limit: 4 },
      {
        refetchOnMountOrArgChange: false,
        refetchOnFocus: false,
        refetchOnReconnect: false,
      }
    );

  const handleViewChange = (
    view: "dashboard" | "live-cameras" | "alerts" | "profile"
  ) => {
    dispatch(setActiveView(view));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const switchToRegister = () => {
    setAuthMode("register");
  };

  const switchToLogin = () => {
    setAuthMode("login");
  };

  if (!isAuthenticated) {
    return authMode === "login" ? (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-4">
        <AuthScreen />
      </div>
    ) : (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-4">
        <AuthScreen />
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      case "live-cameras":
        return <LiveCameraView />;
      case "alerts":
        return <AnomalyAlerts />;
      case "profile":
        return <Profile />;
      default:
        return (
          <div className="space-y-8 sm:space-y-12">
            <SystemHealthStats />
            <SecurityStats />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
              <Card className="modern-card bg-primary/20 overflow-hidden">
                <CardHeader className="px-8 pt-8 pb-6">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Camera className="h-6 w-6 text-primary" />
                    </div>
                    Live Camera Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  {camerasLoading ? (
                    <ListItemSkeleton count={6} />
                  ) : (
                    <div className="space-y-4">
                      {camerasData?.data?.slice(0, 6).map((camera) => (
                        <div
                          key={camera._id}
                          className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-muted/20 to-muted/10 hover:from-muted/30 hover:to-muted/20 transition-all duration-200"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-4 h-4 rounded-full status-indicator ${
                                camera.status === "Offline"
                                  ? "bg-red-500 status-offline"
                                  : "bg-green-500 status-online"
                              }`}
                            />
                            <div>
                              <span className="font-semibold text-foreground">
                                {camera.name}
                              </span>
                              <p className="text-sm text-muted-foreground">
                                {camera.location}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              camera.status === "Offline"
                                ? "destructive"
                                : "default"
                            }
                            className={`sleek-badge border-0 ${
                              camera.status === "Offline"
                                ? "bg-red-500/10 text-red-600"
                                : "bg-green-500/10 text-green-600"
                            }`}
                          >
                            {camera.status === "Offline" ? "Offline" : "Online"}
                          </Badge>
                        </div>
                      ))}
                      {(!camerasData?.data ||
                        camerasData.data.length === 0) && (
                        <div className="text-center py-8 text-muted-foreground">
                          No cameras configured yet
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="modern-card bg-primary/20 overflow-hidden">
                <CardHeader className="px-8 pt-8 pb-6">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-xl bg-red-500/10">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    Recent Anomalies
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  {anomaliesLoading ? (
                    <ListItemSkeleton count={4} />
                  ) : (
                    <div className="space-y-4">
                      {Array.isArray(recentAnomalies) &&
                        recentAnomalies.map((anomaly) => (
                          <div
                            key={anomaly._id}
                            className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-muted/20 to-muted/10 hover:from-muted/30 hover:to-muted/20 transition-all duration-300 group"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <Badge
                                  variant={
                                    anomaly.confidence >= 80
                                      ? "destructive"
                                      : anomaly.confidence >= 60
                                      ? "default"
                                      : "secondary"
                                  }
                                  className={`sleek-badge border-0 ${
                                    anomaly.confidence >= 80
                                      ? "bg-red-600/10 text-red-700"
                                      : anomaly.confidence >= 60
                                      ? "bg-yellow-500/10 text-yellow-600"
                                      : "bg-gray-500/10 text-gray-600"
                                  }`}
                                >
                                  {anomaly.type}
                                </Badge>
                                <span className="text-sm font-medium text-muted-foreground">
                                  {anomaly.location}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {new Date(anomaly.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="floating-button opacity-0 group-hover:opacity-100 transition-opacity"
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
                      {(!recentAnomalies ||
                        !Array.isArray(recentAnomalies) ||
                        recentAnomalies.length === 0) && (
                        <div className="text-center py-8 text-muted-foreground">
                          No recent anomalies detected
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-10 shrink-0 items-center gap-4 border-0 px-8 glass-effect">
            <SidebarTrigger className="rounded-xl hover:bg-white/60 transition-colors" />
            <div className="flex-1" />
          </header>
          <main className="flex-1 overflow-auto p-8 pt-3">
            {renderActiveView()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
