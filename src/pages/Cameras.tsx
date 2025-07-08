import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddCameraDialog } from "@/components/AddCameraDialog";
import { DataRefreshButton } from "@/components/DataRefreshButton";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Video,
  Copy,
  Settings,
  Eye,
  Plus,
} from "lucide-react";
import { useCameras } from "@/hooks/useReduxData";
import { useDeleteCameraMutation } from "@/store/api/cameraApi";
import {
  CameraGridSkeleton,
  ErrorState,
  EmptyState,
} from "@/components/ui/loading";
import { useAppDispatch } from "@/store/hooks";
import { addNotification } from "@/store/slices/uiSlice";
import type { Camera, CreateCameraRequest } from "@/types/api";
import { useCachedData } from "@/hooks/useCachedData";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Cameras = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data: cameras, loading: isLoading, error } = useCameras();
  const [deleteCamera] = useDeleteCameraMutation();
  const { refreshCameras } = useCachedData();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Refresh cameras on component mount
  useEffect(() => {
    refreshCameras();
  }, [refreshCameras]);

  const handleAddCamera = (cameraData: CreateCameraRequest) => {
    // Camera added successfully
  };

  const handleDeleteCamera = async (cameraId: string, cameraName: string) => {
    setDeletingId(cameraId);
    try {
      await deleteCamera(cameraId).unwrap();
      dispatch(
        addNotification({
          type: "success",
          title: "Camera Deleted",
          message: `${cameraName} has been removed from the system`,
        })
      );
      refreshCameras();
    } catch (err) {
      dispatch(
        addNotification({
          type: "error",
          title: "Delete Failed",
          message: "Failed to delete camera",
        })
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      dispatch(
        addNotification({
          type: "success",
          title: "URL Copied",
          message: `Camera URL "${url}" has been copied to clipboard`,
        })
      );
    } catch (err) {
      dispatch(
        addNotification({
          type: "error",
          title: "Copy Failed",
          message: "Failed to copy URL to clipboard",
        })
      );
    }
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <header className="flex h-12 sm:h-16 shrink-0 items-center gap-4 border-0 px-3 sm:px-6 lg:px-8 glass-effect">
              <div className="flex-1" />
            </header>
            <main className="flex-1 overflow-auto p-3 sm:p-6 lg:p-8 pt-2 sm:pt-3">
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#cd0447] to-[#e91e63] bg-clip-text text-transparent mb-1 sm:mb-2">
                      Camera Management
                    </h2>
                    <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                      Manage all security cameras in your system
                    </p>
                  </div>
                </div>
                <CameraGridSkeleton />
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <header className="flex h-12 sm:h-16 shrink-0 items-center gap-4 border-0 px-3 sm:px-6 lg:px-8 glass-effect">
              <div className="flex-1" />
            </header>
            <main className="flex-1 overflow-auto p-3 sm:p-6 lg:p-8 pt-2 sm:pt-3">
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#cd0447] to-[#e91e63] bg-clip-text text-transparent mb-1 sm:mb-2">
                      Camera Management
                    </h2>
                    <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                      Manage all security cameras in your system
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <DataRefreshButton refreshType="cameras" size="sm" />
                    <AddCameraDialog onAddCamera={handleAddCamera} />
                  </div>
                </div>
                <ErrorState
                  title="Failed to load cameras"
                  message="Unable to fetch camera data from the server"
                  onRetry={refreshCameras}
                />
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  const camerasList = cameras || [];

  if (camerasList.length === 0) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <header className="flex h-12 sm:h-16 shrink-0 items-center gap-4 border-0 px-3 sm:px-6 lg:px-8 glass-effect">
              <div className="flex-1" />
            </header>
            <main className="flex-1 overflow-auto p-3 sm:p-6 lg:p-8 pt-2 sm:pt-3">
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#cd0447] to-[#e91e63] bg-clip-text text-transparent mb-1 sm:mb-2">
                      Camera Management
                    </h2>
                    <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                      Manage all security cameras in your system
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <DataRefreshButton refreshType="cameras" size="sm" />
                    <AddCameraDialog onAddCamera={handleAddCamera} />
                  </div>
                </div>
                <EmptyState
                  title="No cameras configured"
                  message="Add your first security camera to start monitoring"
                  action={<AddCameraDialog onAddCamera={handleAddCamera} />}
                />
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-12 sm:h-16 shrink-0 items-center gap-4 border-0 px-3 sm:px-6 lg:px-8 glass-effect">
            <div className="flex-1" />
          </header>
          <main className="flex-1 overflow-auto p-3 sm:p-6 lg:p-8 pt-2 sm:pt-3">
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Enhanced Responsive Header Section */}
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#cd0447] to-[#e91e63] bg-clip-text text-transparent mb-1 sm:mb-2">
                      Camera Management
                    </h2>
                    <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mb-2 sm:mb-3">
                      Manage all security cameras in your system
                    </p>
                    {/* Responsive Status Counters */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {
                            camerasList.filter((c) => c.status === "Live")
                              .length
                          }{" "}
                          Online
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {
                            camerasList.filter((c) => c.status !== "Live")
                              .length
                          }{" "}
                          Offline
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {camerasList.length} Total
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <DataRefreshButton refreshType="cameras" size="sm" />
                    <AddCameraDialog onAddCamera={handleAddCamera} />
                  </div>
                </div>
              </div>

              {/* Responsive Camera Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {camerasList.map((camera) => {
                  const isOnline = camera.status === "Live";
                  return (
                    <Card
                      key={camera._id}
                      className="group relative overflow-hidden bg-white/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-2 rounded-xl sm:rounded-2xl"
                      style={{
                        background: isOnline
                          ? "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)"
                          : "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.85) 100%)",
                      }}
                    >
                      {/* Status Indicator Bar */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 ${
                          isOnline
                            ? "bg-gradient-to-r from-green-400 to-green-600"
                            : "bg-gradient-to-r from-red-400 to-red-600"
                        }`}
                      />

                      <CardHeader className="pb-2 sm:pb-3 lg:pb-4 pt-4 sm:pt-6">
                        <CardTitle className="flex items-center justify-between text-sm sm:text-base lg:text-lg">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold truncate text-gray-900">
                                {camera.name}
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant={isOnline ? "default" : "destructive"}
                            className={`sleek-badge border-0 text-xs sm:text-sm flex-shrink-0 px-2 sm:px-3 py-1 ${
                              isOnline
                                ? "bg-green-500/15 text-green-700 border border-green-200"
                                : "bg-red-500/15 text-red-700 border border-red-200"
                            }`}
                          >
                            {isOnline ? (
                              <Wifi className="h-3 w-3 mr-1" />
                            ) : (
                              <WifiOff className="h-3 w-3 mr-1" />
                            )}
                          </Badge>
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 lg:p-6">
                        {/* Responsive Camera Information Section */}
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                            <div className="p-1.5 sm:p-2 rounded-lg bg-blue-50 flex-shrink-0">
                              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                            </div>
                            <span className="text-gray-700 truncate text-xs sm:text-sm">
                              {camera.location}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                            <div className="p-1.5 sm:p-2 rounded-lg bg-purple-50 flex-shrink-0">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                            </div>
                            <span className="text-gray-700 text-xs sm:text-sm">
                              {new Date(camera.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                            <div className="p-1.5 sm:p-2 rounded-lg bg-orange-50 flex-shrink-0">
                              <LinkIcon className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                            </div>
                            <span className="text-gray-700 truncate font-mono text-xs flex-1">
                              {camera.url.length >
                              (window.innerWidth < 640 ? 15 : 25)
                                ? `${camera.url.substring(
                                    0,
                                    window.innerWidth < 640 ? 15 : 25
                                  )}...`
                                : camera.url}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500 hover:text-[#cd0447] hover:bg-[#cd0447]/10 transition-colors flex-shrink-0"
                              onClick={() => handleCopyUrl(camera.url)}
                            >
                              <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Responsive Action Buttons */}
                        <div className="flex items-center gap-2 pt-2 sm:pt-3 border-t border-gray-100">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 sm:h-9 bg-white hover:bg-gray-50 border-gray-200 hover:border-[#cd0447] text-gray-700 hover:text-[#cd0447] transition-all duration-200 text-xs sm:text-sm"
                            onClick={() => navigate("/alerts")}
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 sm:h-9 sm:w-9 bg-white hover:bg-red-50 border-gray-200 hover:border-red-500 text-gray-700 hover:text-red-600 transition-all duration-200"
                            onClick={() =>
                              handleDeleteCamera(camera._id, camera.name)
                            }
                            disabled={deletingId === camera._id}
                          >
                            {deletingId === camera._id ? (
                              <span className="flex items-center">
                                <span className="loader w-3 h-3 sm:w-4 sm:h-4 border-2 border-t-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></span>
                              </span>
                            ) : (
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Mobile Floating Action Button */}
              <div className="fixed bottom-4 right-4 sm:hidden z-50">
                <Button
                  size="lg"
                  className="rounded-full w-14 h-14 bg-gradient-to-r from-[#cd0447] to-[#e91e63] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                  onClick={() => {
                    const addButton =
                      document.querySelector("[data-add-camera]");
                    if (addButton) {
                      (addButton as HTMLElement).click();
                    }
                  }}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Cameras;
