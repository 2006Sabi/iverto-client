import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  Wifi,
  WifiOff,
  RefreshCw,
  Settings,
  Trash2,
  Plus,
  X,
  Grid3X3,
  List,
} from "lucide-react";
import {
  useGetCamerasQuery,
  useDeleteCameraMutation,
} from "@/store/api/cameraApi";
import {
  CameraGridSkeleton,
  ErrorState,
  EmptyState,
} from "@/components/ui/loading";
import { useAppDispatch } from "@/store/hooks";
import { addNotification } from "@/store/slices/uiSlice";
import type { Camera, CreateCameraRequest } from "@/types/api";
import { useLocalIp } from "../contexts/LocalIpContext";
import { CameraStream } from "./CameraStream";
// import './live-streaming.css';

export const LiveCameraView = () => {
  const dispatch = useAppDispatch();
  const {
    data: camerasData,
    isLoading,
    error,
    refetch,
  } = useGetCamerasQuery({});

  const [deleteCamera] = useDeleteCameraMutation();
  const localIp = useLocalIp();
  const [selectedCameras, setSelectedCameras] = useState<string[]>([]);
  const [customCameraId, setCustomCameraId] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const handleAddCamera = (cameraData: CreateCameraRequest) => {
    // The Redux mutation will automatically invalidate the cache and refetch
  };

  const handleDeleteCamera = async (cameraId: string, cameraName: string) => {
    try {
      await deleteCamera(cameraId).unwrap();
      dispatch(
        addNotification({
          type: "success",
          title: "Camera Deleted",
          message: `${cameraName} has been removed from the system`,
        })
      );
    } catch (err) {
      dispatch(
        addNotification({
          type: "error",
          title: "Delete Failed",
          message: "Failed to delete camera",
        })
      );
    }
  };

  const addCustomCamera = () => {
    if (
      customCameraId.trim() &&
      !selectedCameras.includes(customCameraId.trim())
    ) {
      setSelectedCameras((prev) => [...prev, customCameraId.trim()]);
      setCustomCameraId("");
    }
  };

  const removeCamera = (cameraId: string) => {
    setSelectedCameras((prev) => prev.filter((id) => id !== cameraId));
  };

  const getStreamUrl = (camera: { _id: string; httpUrl?: string }) => {
    // Use the httpUrl from camera data if available
    if (camera.httpUrl && camera.httpUrl.includes("{camId}")) {
      // Replace placeholder {camId} with actual camera ID
      return camera.httpUrl.replace("{camId}", camera._id);
    }
    if (camera.httpUrl) {
      return camera.httpUrl;
    }
    // No fallback URL - return empty string if no httpUrl is available
    return "";
  };

  const cameras = camerasData?.data || [];
  const displayCameras =
    selectedCameras.length > 0
      ? selectedCameras.map(
          (id) =>
            cameras.find((cam) => cam._id === id) || {
              _id: id,
              name: `Camera ${id.slice(-4)}`,
              location: "Custom Camera",
              status: "Online" as const,
              created_at: new Date().toISOString(),
              url: "",
              httpUrl: localIp ? `http://${localIp}:8080/stream/${id}` : "",
              anomalyEntities: [],
            }
        )
      : cameras;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Live Camera Streaming
            </h2>
            <p className="text-muted-foreground">
              Monitor live streams from your security cameras
            </p>
          </div>
        </div>
        <CameraGridSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Live Camera Streaming
            </h2>
            <p className="text-muted-foreground">
              Monitor live streams from your security cameras
            </p>
          </div>
        </div>
        <ErrorState
          title="Failed to load cameras"
          message="Unable to fetch camera data from the server"
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Live Camera Streaming
          </h2>
          <p className="text-muted-foreground">
            Monitor live streams from your security cameras
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="gap-2"
          >
            {viewMode === "grid" ? (
              <List className="h-4 w-4" />
            ) : (
              <Grid3X3 className="h-4 w-4" />
            )}
            {viewMode === "grid" ? "List View" : "Grid View"}
          </Button>
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="Refresh cameras"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Camera Selection */}
      <Card className="bg-background/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Camera Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              onValueChange={(value) => {
                if (value && !selectedCameras.includes(value)) {
                  setSelectedCameras((prev) => [...prev, value]);
                }
              }}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select camera from list" />
              </SelectTrigger>
              <SelectContent>
                {cameras.map((camera) => (
                  <SelectItem key={camera._id} value={camera._id}>
                    {camera.name} - {camera.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-1 gap-2">
              <Input
                placeholder="Enter camera ID manually"
                value={customCameraId}
                onChange={(e) => setCustomCameraId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addCustomCamera()}
              />
              <Button onClick={addCustomCamera} className="gap-2">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>

          {selectedCameras.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedCameras.map((cameraId) => {
                const camera = cameras.find((c) => c._id === cameraId);
                return (
                  <Badge key={cameraId} variant="secondary" className="gap-2">
                    {camera?.name || `Camera ${cameraId.slice(-4)}`}
                    <button
                      onClick={() => removeCamera(cameraId)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Camera Grid */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-6"
        }
      >
        {displayCameras.map((camera) => {
          const isOnline = camera.status === "Online";
          const streamUrl = getStreamUrl(camera);

          return (
            <Card
              key={camera._id}
              className="modern-card overflow-hidden group hover:shadow-lg transition-all duration-300"
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-primary/10 flex-shrink-0">
                      <Eye className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold truncate">
                        {camera.name}
                      </div>
                      <div className="text-sm text-muted-foreground font-normal truncate">
                        {camera.location}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={isOnline ? "default" : "destructive"}
                    className={`sleek-badge border-0 ${
                      isOnline
                        ? "bg-green-500/20 text-green-600"
                        : "bg-red-500/20 text-red-600"
                    }`}
                  >
                    {isOnline ? (
                      <>
                        <Wifi className="h-3 w-3 mr-1" /> Online
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-3 w-3 mr-1" /> Offline
                      </>
                    )}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden rounded-lg">
                  <CameraStream
                    streamUrl={streamUrl}
                    cameraName={camera.name}
                    isOnline={isOnline}
                    localIp={localIp}
                    useImgTag={streamUrl.includes("/stream?camId=")}
                  />
                  <div
                    className={`absolute top-3 left-3 w-3 h-3 rounded-full ${
                      isOnline
                        ? "bg-green-500 status-indicator status-online"
                        : "bg-red-500 status-indicator status-offline"
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">
                    {camera.created_at
                      ? `Added: ${new Date(
                          camera.created_at
                        ).toLocaleDateString()}`
                      : "Custom Camera"}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <Settings className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      onClick={() =>
                        handleDeleteCamera(camera._id, camera.name)
                      }
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {streamUrl && (
                  <div className="text-xs text-muted-foreground break-all font-mono p-2 bg-muted rounded">
                    {streamUrl}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {displayCameras.length === 0 && (
        <EmptyState
          title="No cameras selected"
          message="Select cameras from the dropdown or enter camera IDs to start viewing streams"
        />
      )}
    </div>
  );
};
