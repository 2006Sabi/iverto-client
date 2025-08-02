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
  Filter,
  Search,
  Pencil,
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
import { useOptimizedCameraData } from "@/hooks/useOptimizedCameraData";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import EditCameraDialog from "@/components/EditCameraDialog";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocalIp } from "../contexts/LocalIpContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Cameras = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: cameras, loading: isLoading, error } = useCameras();
  const [deleteCamera] = useDeleteCameraMutation();
  const { refreshCameras } = useCachedData();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const [streamErrorIds, setStreamErrorIds] = useState<string[]>([]);
  const handleStreamError = useCallback((cameraId: string) => {
    setStreamErrorIds((prev) =>
      prev.includes(cameraId) ? prev : [...prev, cameraId]
    );
  }, []);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [editCamera, setEditCamera] = useState<Camera | null>(null);
  const [viewCamera, setViewCamera] = useState<Camera | null>(null);

  // Use the optimized camera data hook
  const {
    cameras: cameraData,
    hasChanged,
    isFirstLoad,
    statusCounts,
    shouldRefresh,
  } = useOptimizedCameraData();

  const hasInitialized = useRef(false);

  // Initialize data only on first load
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      refreshCameras();
    }
  }, [refreshCameras]);

  // Filter cameras based on search and status
  const filteredCameras = useMemo(() => {
    return cameraData.filter((camera) => {
      const matchesSearch =
        camera.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        camera.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "online" && camera.status === "Online") ||
        (statusFilter === "offline" && camera.status === "Offline");
      return matchesSearch && matchesStatus;
    });
  }, [cameraData, searchTerm, statusFilter]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleAddCamera = useCallback((cameraData: CreateCameraRequest) => {
    // Camera added successfully - the WebSocket will handle the update
  }, []);

  const handleDeleteCamera = useCallback(
    async (cameraId: string, cameraName: string) => {
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
        // Don't call refreshCameras here as the WebSocket will handle the update
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
    },
    [deleteCamera, dispatch]
  );

  const handleCopyUrl = useCallback(
    async (url: string) => {
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
    },
    [dispatch]
  );

  const handleEditCamera = useCallback((updatedCamera: Camera) => {
    setEditCamera(null);
    // Optionally refresh or show notification
  }, []);

  const localIp = useLocalIp();

  // Memoized camera grid to prevent unnecessary re-renders
  const cameraGrid = useMemo(() => {
    return filteredCameras.map((camera) => {
      const isOnline = camera.status === "Online";
      return (
        <Card
          key={camera._id}
          className="rounded-none shadow-xl border-0 bg-white/90 backdrop-blur-xl"
          style={{
            background: isOnline
              ? "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.98) 100%)"
              : "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.93) 100%)",
          }}
        >
          {/* Enhanced Status Indicator Bar */}
          <div
            className={`absolute top-0 left-0 right-0 h-1.5 ${
              isOnline
                ? "bg-gradient-to-r from-green-400 via-green-500 to-emerald-600"
                : "bg-gradient-to-r from-red-400 via-red-500 to-rose-600"
            }`}
          />

          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full blur-2xl" />
          </div>

          <CardHeader className="pb-2 sm:pb-3 lg:pb-4 pt-4 sm:pt-6 relative z-10">
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
                className={`sleek-badge border-0 text-xs sm:text-sm flex-shrink-0 px-2 sm:px-3 py-1 rounded-none ${
                  isOnline
                    ? "bg-green-500/20 text-green-700 border border-green-200/50 backdrop-blur-sm"
                    : "bg-red-500/20 text-red-700 border border-red-200/50 backdrop-blur-sm"
                }`}
              >
                {isOnline ? (
                  <Wifi className="h-3 w-3 mr-1" />
                ) : (
                  <WifiOff className="h-3 w-3 mr-1" />
                )}
                <span className="hidden sm:inline">
                  {isOnline ? "Online" : "Offline"}
                </span>
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 lg:p-6 relative z-10">
            {/* Live Video Stream */}
            <div className="aspect-video bg-black/80 rounded-lg overflow-hidden flex items-center justify-center mb-2">
              {isOnline ? (
                localIp ? (
                  streamErrorIds.includes(camera._id) ? (
                    <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                      <WifiOff className="h-8 w-8 mb-2" />
                      <span>Stream unavailable</span>
                    </div>
                  ) : (
                    <img
                      className="w-full h-full object-cover"
                      src={`http://${localIp}:5000/stream/${camera._id}`}
                      alt="Live Camera Stream"
                      onError={(e) => {
                        // Only set placeholder if not already set
                        if (
                          !e.currentTarget.src.endsWith(
                            "/public/placeholder.svg"
                          )
                        ) {
                          e.currentTarget.src = "/public/placeholder.svg";
                        } else {
                          handleStreamError(camera._id);
                        }
                      }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                    <span>Loading stream...</span>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                  <WifiOff className="h-8 w-8 mb-2" />
                  <span>Camera Offline</span>
                </div>
              )}
            </div>
            {/* Responsive Camera Information Section */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className="p-1.5 sm:p-2 rounded-none bg-blue-50/80 backdrop-blur-sm flex-shrink-0 border border-blue-100/50">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                </div>
                <span className="text-gray-700 truncate text-xs sm:text-sm">
                  {camera.location}
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className="p-1.5 sm:p-2 rounded-none bg-purple-50/80 backdrop-blur-sm flex-shrink-0 border border-purple-100/50">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                </div>
                <span className="text-gray-700 text-xs sm:text-sm">
                  {new Date(camera.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className="p-1.5 sm:p-2 rounded-none bg-orange-50/80 backdrop-blur-sm flex-shrink-0 border border-orange-100/50">
                  <LinkIcon className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                </div>
                <span className="text-gray-700 truncate font-mono text-xs flex-1">
                  {camera.url.length > (isMobile ? 15 : 25)
                    ? `${camera.url.substring(0, isMobile ? 15 : 25)}...`
                    : camera.url}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500 hover:text-[#cd0447] hover:bg-[#cd0447]/10 transition-colors flex-shrink-0 rounded-none"
                  onClick={() => handleCopyUrl(camera.url)}
                >
                  <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>

              {/* New: Display httpUrl if present */}
              {camera.httpUrl && (
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div className="p-1.5 sm:p-2 rounded-none bg-green-50/80 backdrop-blur-sm flex-shrink-0 border border-green-100/50">
                    <LinkIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 truncate font-mono text-xs flex-1">
                    {camera.httpUrl.length > (isMobile ? 15 : 25)
                      ? `${camera.httpUrl.substring(0, isMobile ? 15 : 25)}...`
                      : camera.httpUrl}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500 hover:text-[#cd0447] hover:bg-[#cd0447]/10 transition-colors flex-shrink-0 rounded-none"
                    onClick={() => handleCopyUrl(camera.httpUrl)}
                  >
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Responsive Action Buttons */}
            <div className="flex items-center gap-2 pt-2 sm:pt-3 border-t border-gray-100/50">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 sm:h-9 bg-white/80 hover:bg-gray-50/90 border-gray-200/50 hover:border-[#cd0447] text-gray-700 hover:text-[#cd0447] transition-all duration-200 text-xs sm:text-sm backdrop-blur-sm rounded-none"
                onClick={() => setViewCamera(camera)}
              >
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">View</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 sm:h-9 sm:w-9 bg-white/80 hover:bg-red-50/90 border-gray-200/50 hover:border-red-500 text-gray-700 hover:text-red-600 transition-all duration-200 backdrop-blur-sm rounded-none"
                onClick={() => handleDeleteCamera(camera._id, camera.name)}
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
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-100/30 transition-colors flex-shrink-0 rounded-none"
                title="Edit Camera"
                onClick={() => setEditCamera(camera)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    });
  }, [
    filteredCameras,
    handleDeleteCamera,
    handleCopyUrl,
    navigate,
    deletingId,
    isMobile,
    localIp,
    handleStreamError,
    streamErrorIds,
  ]);

  // Loading state
  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-white to-slate-50 relative overflow-hidden">
          {/* Enhanced Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30" />
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
            <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-bl from-purple-400/10 to-pink-400/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-tr from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl" />
          </div>

          <AppSidebar />
          <SidebarInset className="flex-1 relative z-10">
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

  // Error state
  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-white to-slate-50 relative overflow-hidden">
          {/* Enhanced Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30" />
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
            <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-bl from-purple-400/10 to-pink-400/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-tr from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl" />
          </div>

          <AppSidebar />
          <SidebarInset className="flex-1 relative z-10">
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

  // Empty state
  if (cameraData.length === 0) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-white to-slate-50 relative overflow-hidden">
          {/* Enhanced Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30" />
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
            <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-bl from-purple-400/10 to-pink-400/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-tr from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl" />
          </div>

          <AppSidebar />
          <SidebarInset className="flex-1 relative z-10">
            <header className="flex h-12 sm:h-16 shrink-0 items-center gap-4 border-0 px-3 sm:px-6 lg:px-8 glass-effect">
              <div className="flex-1" />
            </header>
            <main className="flex-1 overflow-auto p-3 sm:p-6 lg:p-8 pt-2 sm:pt-3">
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#cd0447] to-[#e91e63] bg-clip-text text-transparent mb-1 sm:mb-2">
                      Video Management System
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
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-white to-slate-50 relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-bl from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-tr from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "4s" }}
          />
        </div>

        <AppSidebar />
        <SidebarInset className="flex-1 relative z-10">
          <main className="flex-1 overflow-auto p-3 sm:p-6 lg:p-8 pt-2 sm:pt-3">
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Enhanced Responsive Header Section */}
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex-1">
                    <h2 className="text-xxl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#cd0447] to-[#e91e63] bg-clip-text text-transparent mb-1 sm:mb-4">
                      Video Management System
                    </h2>
                    <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mb-2 sm:mb-3">
                      Manage all security cameras in your system
                    </p>
                    {/* Responsive Status Counters */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {statusCounts.onlineCount} Online
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {statusCounts.offlineCount} Offline
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {statusCounts.totalCount} Total
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <DataRefreshButton refreshType="cameras" size="sm" />
                    <AddCameraDialog onAddCamera={handleAddCamera} />
                  </div>
                </div>

                {/* Enhanced Search and Filter Section */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search cameras by name or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="rounded-none shadow-sm focus:shadow-md transition-shadow pl-10 h-10 sm:h-11 text-sm bg-white/80 backdrop-blur-sm border-gray-200/50 focus:border-[#cd0447] focus:ring-[#cd0447]/20"
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="rounded-none shadow-sm focus:shadow-md transition-shadow w-full sm:w-32 h-10 sm:h-11 text-sm bg-white/80 backdrop-blur-sm border-gray-200/50 focus:border-[#cd0447] focus:ring-[#cd0447]/20">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* View Mode Toggle (Desktop only) */}
                    {!isMobile && (
                      <div className="flex items-center border border-gray-200/50 overflow-hidden bg-white/80 backdrop-blur-sm rounded-none">
                        <Button
                          variant={viewMode === "grid" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("grid")}
                          className="rounded-none border-0 h-10 px-3 bg-gradient-to-r from-[#cd0447] to-[#e91e63] text-white hover:from-[#b80340] hover:to-[#d81b60]"
                        >
                          Grid
                        </Button>
                        <Button
                          variant={viewMode === "list" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("list")}
                          className="rounded-none border-0 h-10 px-3"
                        >
                          List
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Results Count */}
                {searchTerm || statusFilter !== "all" ? (
                  <div className="text-sm text-muted-foreground bg-white/50 backdrop-blur-sm px-3 py-2 border border-gray-200/50 rounded-none">
                    Showing {filteredCameras.length} of {cameraData.length}{" "}
                    cameras
                  </div>
                ) : null}
              </div>

              {/* Responsive Camera Grid/List */}
              {filteredCameras.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-gray-500 text-sm sm:text-base bg-white/50 backdrop-blur-sm px-4 py-3 border border-gray-200/50 rounded-none">
                    {searchTerm || statusFilter !== "all"
                      ? "No cameras match your search criteria"
                      : "No cameras found"}
                  </div>
                </div>
              ) : (
                <div
                  className={
                    viewMode === "list" && !isMobile
                      ? "space-y-3"
                      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
                  }
                >
                  {cameraGrid}
                </div>
              )}

              {/* Mobile Floating Action Button */}
              <div className="fixed bottom-4 right-4 sm:hidden z-50">
                <Button
                  size="lg"
                  className="rounded-none shadow-md hover:shadow-lg transition-shadow w-14 h-14 bg-gradient-to-r from-[#cd0447] to-[#e91e63] text-white"
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
      {/* Edit Camera Dialog (only visible when editCamera is set) */}
      {editCamera && (
        <EditCameraDialog
          camera={editCamera}
          onEditCamera={handleEditCamera}
          onClose={() => setEditCamera(null)}
        />
      )}
      {/* Fullscreen Video Dialog */}
      {viewCamera && (
        <Dialog open={!!viewCamera} onOpenChange={() => setViewCamera(null)}>
          <DialogContent className="max-w-full w-screen h-screen flex flex-col items-center justify-center bg-black/95 p-0">
            <button
              onClick={() => setViewCamera(null)}
              className="absolute top-4 right-4 z-50 bg-white/80 hover:bg-white text-black rounded-full p-2 shadow-lg"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="flex-1 flex items-center justify-center w-full h-full">
              {localIp ? (
                streamErrorIds.includes(viewCamera._id) ? (
                  <div className="text-white text-xl flex flex-col items-center justify-center">
                    <WifiOff className="h-8 w-8 mb-2" />
                    Stream unavailable
                  </div>
                ) : (
                  <img
                    className="object-contain max-w-full max-h-full bg-black"
                    src={`http://${localIp}:5000/stream/${viewCamera._id}`}
                    alt="Live Camera Stream Fullscreen"
                    onError={(e) => {
                      if (
                        !e.currentTarget.src.endsWith("/public/placeholder.svg")
                      ) {
                        e.currentTarget.src = "/public/placeholder.svg";
                      } else {
                        handleStreamError(viewCamera._id);
                      }
                    }}
                    style={{ width: "100vw", height: "100vh" }}
                  />
                )
              ) : (
                <div className="text-white text-xl">Loading stream...</div>
              )}
            </div>
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white text-lg bg-black/60 px-6 py-2 rounded shadow-lg">
              {viewCamera.name} &mdash; {viewCamera.location}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </SidebarProvider>
  );
};

export default Cameras;
