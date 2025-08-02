import { useState, useEffect, useCallback } from "react";
import {
  useGetAnomaliesQuery,
  useUpdateAnomalyStatusMutation,
  useDeleteAnomalyMutation,
} from "@/store/api/anomalyApi";
import { useAppDispatch } from "@/store/hooks";
import { addNotification } from "@/store/slices/uiSlice";
import { removeAnomaly } from "@/store/slices/dataSlice";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { dataInitializer } from "@/services/dataInitializer";
import {
  ListItemSkeleton,
  ErrorState,
  EmptyState,
  Spinner,
} from "@/components/ui/loading";
import type { Anomaly, AnomalyQueryParams } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Eye,
  Download,
  Filter,
  Clock,
  MapPin,
  Camera,
  Trash2,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSelector } from "react-redux";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocation } from "react-router-dom";
import { AnomalyDetailView } from "./AnomalyDetailView";

export const AnomalyAlerts = () => {
  const dispatch = useAppDispatch();
  const [filter, setFilter] = useState("all");
  const [realtimeAlerts, setRealtimeAlerts] = useState<Anomaly[]>([]);

  const { isConnected, connectionStatus, subscribeToAnomalies } =
    useWebSocket();

  const {
    data: anomaliesData,
    loading: isLoading,
    error,
  } = useGetAnomaliesQuery();
  const anomalies = anomaliesData?.data || [];

  const [updateAnomalyStatus, { isLoading: isUpdating }] =
    useUpdateAnomalyStatusMutation();
  const [deleteAnomaly, { isLoading: isDeleting }] = useDeleteAnomalyMutation();

  const [videoModal, setVideoModal] = useState<{
    open: boolean;
    url: string | null;
    title: string;
    anomaly: Anomaly | null;
  }>({ open: false, url: null, title: "", anomaly: null });
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    anomalyId: string | null;
    anomalyType: string;
  }>({ open: false, anomalyId: null, anomalyType: "" });
  const apiKey = useSelector((state: any) => state.auth.user?.apiKey);
  const isAuthenticated = useSelector((state: any) => !!state.auth.token);

  const location = useLocation();

  // Replace isUpdating with a local state for per-anomaly/action loading
  const [updatingAnomaly, setUpdatingAnomaly] = useState<{
    id: string;
    action: "acknowledge" | "resolve";
  } | null>(null);

  // Subscribe to real-time anomalies
  useEffect(() => {
    // Only subscribe if WebSocket is connected
    if (!isConnected) {
      return;
    }

    try {
      const unsubscribe = subscribeToAnomalies((anomaly: Anomaly) => {
        try {
          setRealtimeAlerts((prev) => {
            // Only add if not already present in either real-time or fetched anomalies
            const alreadyExists =
              prev.some((a) => a._id === anomaly._id) ||
              (anomalies && anomalies.some((a) => a._id === anomaly._id));
            if (alreadyExists) return prev;
            return [anomaly, ...prev];
          });
        } catch (error) {
          console.warn("Error updating realtime alerts:", error);
        }
      });

      return unsubscribe;
    } catch (error) {
      console.warn("Error setting up anomaly subscription:", error);
    }
  }, [subscribeToAnomalies, anomalies, isConnected]);

  // Merge real-time anomalies with fetched ones, deduplicate by _id
  const alerts = [
    ...realtimeAlerts,
    ...(anomalies?.filter(
      (a) => !realtimeAlerts.some((r) => r._id === a._id)
    ) || []),
  ];
  // Deduplicate and sort by timestamp descending
  const dedupedAlerts = Array.from(
    new Map(alerts.map((a) => [a._id, a])).values()
  ).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const filteredAlerts =
    filter === "all"
      ? dedupedAlerts
      : dedupedAlerts.filter((alert) => alert.status === filter);

  useEffect(() => {
    if (location.state && location.state.anomalyId) {
      const el = document.getElementById(`anomaly-${location.state.anomalyId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-primary");
        setTimeout(() => el.classList.remove("ring-2", "ring-primary"), 2000);
      }
    }
  }, [location.state, filteredAlerts]);

  const handleAcknowledge = async (id: string) => {
    setUpdatingAnomaly({ id, action: "acknowledge" });
    try {
      const result = await updateAnomalyStatus({
        id,
        status: "Acknowledged",
      }).unwrap();
      dispatch(
        addNotification({
          type: "success",
          title: "Anomaly Acknowledged",
          message: "The anomaly has been acknowledged successfully",
        })
      );
      if (result?.data) {
        dispatch({ type: "data/updateAnomaly", payload: result.data });
        setRealtimeAlerts((prev) =>
          prev.map((a) => (a._id === id ? { ...a, status: "Acknowledged" } : a))
        );
      }
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          title: "Error",
          message: "Failed to acknowledge anomaly",
        })
      );
    } finally {
      setUpdatingAnomaly(null);
    }
  };

  const handleResolve = async (id: string) => {
    setUpdatingAnomaly({ id, action: "resolve" });
    try {
      const result = await updateAnomalyStatus({
        id,
        status: "Resolved",
      }).unwrap();
      dispatch(
        addNotification({
          type: "success",
          title: "Anomaly Resolved",
          message: "The anomaly has been resolved successfully",
        })
      );
      if (result?.data) {
        dispatch({ type: "data/updateAnomaly", payload: result.data });
        setRealtimeAlerts((prev) =>
          prev.map((a) => (a._id === id ? { ...a, status: "Resolved" } : a))
        );
      }
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          title: "Error",
          message: "Failed to resolve anomaly",
        })
      );
    } finally {
      setUpdatingAnomaly(null);
    }
  };

  const handleOpenDetailView = (anomaly: Anomaly) => {
    setSelectedAnomaly(anomaly);
    setShowDetailView(true);
  };

  const handleCloseDetailView = () => {
    setShowDetailView(false);
    setSelectedAnomaly(null);
  };

  const handleDeleteClick = (id: string, type: string) => {
    console.log("Delete clicked for anomaly:", id, type);
    setDeleteConfirmation({ open: true, anomalyId: id, anomalyType: type });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.anomalyId) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      console.warn("User not authenticated for delete operation");
      dispatch(
        addNotification({
          type: "error",
          title: "Delete Failed",
          message: "User not authenticated",
        })
      );
      setDeleteConfirmation({ open: false, anomalyId: null, anomalyType: "" });
      return;
    }

    // Check if anomaly exists in the current data
    const anomalyExists = filteredAlerts.some(
      (alert) => alert._id === deleteConfirmation.anomalyId
    );
    if (!anomalyExists) {
      console.warn(
        "Anomaly not found in current data:",
        deleteConfirmation.anomalyId
      );
      dispatch(
        addNotification({
          type: "error",
          title: "Delete Failed",
          message: "Anomaly not found in current data",
        })
      );
      setDeleteConfirmation({ open: false, anomalyId: null, anomalyType: "" });
      return;
    }

    try {
      console.log(
        "Attempting to delete anomaly:",
        deleteConfirmation.anomalyId
      );

      // Call the delete mutation
      console.log(
        "Calling deleteAnomaly mutation with ID:",
        deleteConfirmation.anomalyId
      );
      const result = await deleteAnomaly(deleteConfirmation.anomalyId).unwrap();
      console.log("Delete result:", result);

      dispatch(
        addNotification({
          type: "success",
          title: "Anomaly Deleted",
          message: "The anomaly has been deleted successfully",
        })
      );

      // Remove from Redux store
      dispatch(removeAnomaly(deleteConfirmation.anomalyId));

      // Remove from realtime alerts as well
      setRealtimeAlerts((prev) =>
        prev.filter((a) => a._id !== deleteConfirmation.anomalyId)
      );

      // Refresh anomaly data to ensure consistency
      await dataInitializer.refreshAnomalyData();

      // Close the confirmation dialog
      setDeleteConfirmation({ open: false, anomalyId: null, anomalyType: "" });
    } catch (error: any) {
      console.error("Delete error:", error);

      // Extract error message
      let errorMessage = "Failed to delete anomaly";
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.error) {
        errorMessage = error.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      dispatch(
        addNotification({
          type: "error",
          title: "Delete Failed",
          message: errorMessage,
        })
      );
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({ open: false, anomalyId: null, anomalyType: "" });
  };

  // Video play handler
  const handlePlayClip = async (
    clipUrl: string,
    title: string,
    anomaly: Anomaly
  ) => {
    if (!clipUrl || !apiKey) return;
    setIsVideoLoading(true);
    try {
      const response = await fetch(clipUrl, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
      if (!response.ok) {
        let errorMsg = "Failed to fetch video";
        try {
          const error = await response.json();
          errorMsg = error.message || errorMsg;
        } catch {}
        window.alert(errorMsg);
        setIsVideoLoading(false);
        return;
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setVideoModal({ open: true, url: blobUrl, title, anomaly });
    } catch (e) {
      window.alert("Error fetching video");
    } finally {
      setIsVideoLoading(false);
    }
  };

  // Clean up blob URL on modal close
  const handleCloseModal = () => {
    if (videoModal.url) {
      URL.revokeObjectURL(videoModal.url);
    }
    setVideoModal({ open: false, url: null, title: "", anomaly: null });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Anomaly Alerts</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              AI-detected security events and incidents
            </p>
          </div>
        </div>
        <ListItemSkeleton count={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Anomaly Alerts</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              AI-detected security events and incidents
            </p>
          </div>
        </div>
        <ErrorState
          title="Failed to load anomalies"
          message="Unable to fetch anomaly data from the server"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "destructive";
    if (confidence >= 60) return "default";
    return "secondary";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "destructive";
      case "Acknowledged":
        return "default";
      case "Resolved":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-500";
      case "connecting":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Real-time connected";
      case "connecting":
        return "Connecting...";
      case "error":
        return "Connection error";
      default:
        return "Real-time disconnected";
    }
  };

  // Helper function to safely render camera_id
  const renderCameraId = (cameraId: any) => {
    if (typeof cameraId === "string") return cameraId;
    if (cameraId && typeof cameraId === "object" && cameraId._id)
      return cameraId._id;
    if (cameraId && typeof cameraId === "object" && cameraId.id)
      return cameraId.id;
    return "Unknown Camera";
  };

  // If detail view is shown, render the detail view component
  if (showDetailView && selectedAnomaly) {
    return (
      <AnomalyDetailView
        anomaly={selectedAnomaly}
        onClose={handleCloseDetailView}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-background via-card/50 to-background border-b border-border/50 p-6 -mx-4 sm:-mx-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Anomaly Alerts
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  AI-detected security events and incidents
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 ${getConnectionStatusColor()} border-2 border-background rounded-full`}
              />
              <span className="text-xs text-muted-foreground font-medium">
                {getConnectionStatusText()}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48 bg-background/80 backdrop-blur border-border/50">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All ({dedupedAlerts.length})
                </SelectItem>
                <SelectItem value="Active">
                  Active (
                  {dedupedAlerts.filter((a) => a.status === "Active").length})
                </SelectItem>
                <SelectItem value="Acknowledged">
                  Acknowledged (
                  {
                    dedupedAlerts.filter((a) => a.status === "Acknowledged")
                      .length
                  }
                  )
                </SelectItem>
                <SelectItem value="Resolved">
                  Resolved (
                  {dedupedAlerts.filter((a) => a.status === "Resolved").length})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Enhanced Alerts Grid */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <Card
            key={alert._id}
            id={`anomaly-${alert._id}`}
            className="group bg-card/60 backdrop-blur border-border/30 hover:bg-card/80 hover:border-border/50 transition-all duration-200 cursor-pointer overflow-hidden"
            onClick={() => handleOpenDetailView(alert)}
          >
            <CardHeader className="pb-4">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-3 min-w-0 flex-1">
                  {/* Header Row */}
                  <div className="flex flex-wrap items-start gap-3">
                    <div
                      className={`p-2 ${
                        alert.confidence >= 80
                          ? "bg-red-500/10 border-red-500/20"
                          : alert.confidence >= 60
                          ? "bg-yellow-500/10 border-yellow-500/20"
                          : "bg-blue-500/10 border-blue-500/20"
                      } border rounded-lg`}
                    >
                      <AlertTriangle
                        className={`h-4 w-4 ${
                          alert.confidence >= 80
                            ? "text-red-500"
                            : alert.confidence >= 60
                            ? "text-yellow-500"
                            : "text-blue-500"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold truncate mb-2">
                        {alert.type}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={getConfidenceColor(alert.confidence)}
                          className="text-xs font-medium rounded-md"
                        >
                          {alert.confidence}% Confidence
                        </Badge>
                        <Badge
                          variant={getStatusColor(alert.status)}
                          className="text-xs font-medium rounded-md"
                        >
                          {alert.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Details Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{alert.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>{new Date(alert.timestamp).toLocaleString()}</span>
                    </div>
                    {alert.duration && (
                      <div className="flex items-center gap-2">
                        <Camera className="h-4 w-4 flex-shrink-0" />
                        <span>Duration: {alert.duration}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {alert.description && (
                    <div className="text-sm text-muted-foreground">
                      <p className="line-clamp-2">{alert.description}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 min-w-[200px]">
                  <div className="text-xs text-muted-foreground font-medium">
                    Camera ID: {renderCameraId(alert.camera_id)}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetailView(alert);
                      }}
                      className="text-xs flex-1 group-hover:bg-primary/5"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                    {alert.status === "Active" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcknowledge(alert._id);
                        }}
                        disabled={
                          !!updatingAnomaly && updatingAnomaly.id === alert._id
                        }
                        className="text-xs flex-1 group-hover:bg-primary/5"
                      >
                        {updatingAnomaly &&
                        updatingAnomaly.id === alert._id &&
                        updatingAnomaly.action === "acknowledge" ? (
                          <Spinner className="h-3 w-3" />
                        ) : (
                          "Acknowledge"
                        )}
                      </Button>
                    )}
                    {alert.status !== "Resolved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResolve(alert._id);
                        }}
                        disabled={
                          !!updatingAnomaly && updatingAnomaly.id === alert._id
                        }
                        className="text-xs flex-1 group-hover:bg-primary/5"
                      >
                        {updatingAnomaly &&
                        updatingAnomaly.id === alert._id &&
                        updatingAnomaly.action === "resolve" ? (
                          <Spinner className="h-3 w-3" />
                        ) : (
                          "Resolve"
                        )}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(alert._id, alert.type);
                      }}
                      disabled={
                        isDeleting ||
                        deleteConfirmation.anomalyId === alert._id ||
                        !isAuthenticated
                      }
                      className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {isDeleting &&
                      deleteConfirmation.anomalyId === alert._id ? (
                        <Spinner className="h-3 w-3" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>

            {/* Download Section */}
            {alert.clip_url && (
              <CardContent className="pt-0 border-t border-border/20">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={async () => {
                      if (!alert.clip_url || !apiKey) return;
                      try {
                        const response = await fetch(alert.clip_url, {
                          headers: { Authorization: `Bearer ${apiKey}` },
                        });
                        if (!response.ok)
                          throw new Error("Failed to download clip");
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${alert.type || "anomaly"}-clip.mp4`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);
                      } catch (e) {
                        window.alert("Error downloading clip");
                      }
                    }}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download Clip
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}

        {filteredAlerts.length === 0 && (
          <EmptyState
            title="No anomalies found"
            message={`No ${
              filter === "all" ? "" : filter.toLowerCase()
            } anomalies match your criteria`}
          />
        )}
      </div>

      {/* Video Modal */}
      <Dialog open={videoModal.open} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-primary" />
              </div>
              {videoModal.title} - Clip Playback
            </DialogTitle>
          </DialogHeader>
          {videoModal.url && (
            <div className="space-y-4">
              <div className="bg-black/90 p-4">
                <video
                  src={videoModal.url}
                  controls
                  autoPlay
                  className="w-full max-h-[60vh]"
                />
              </div>
              {videoModal.anomaly && (
                <div className="bg-muted/30 p-4 space-y-3">
                  <div className="font-semibold text-lg">
                    Anomaly Information
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium">Type:</span>{" "}
                      {videoModal.anomaly.type}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span>{" "}
                      {videoModal.anomaly.location}
                    </div>
                    <div>
                      <span className="font-medium">Confidence:</span>{" "}
                      {videoModal.anomaly.confidence}%
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>{" "}
                      {videoModal.anomaly.status}
                    </div>
                    <div>
                      <span className="font-medium">Timestamp:</span>{" "}
                      {new Date(videoModal.anomaly.timestamp).toLocaleString()}
                    </div>
                    {videoModal.anomaly.duration && (
                      <div>
                        <span className="font-medium">Duration:</span>{" "}
                        {videoModal.anomaly.duration}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Camera ID:</span>{" "}
                      {renderCameraId(videoModal.anomaly.camera_id)}
                    </div>
                  </div>
                  {videoModal.anomaly.description && (
                    <div className="mt-4">
                      <div className="font-medium mb-2">Description:</div>
                      <div className="text-sm text-muted-foreground bg-background/50 p-3">
                        {videoModal.anomaly.description}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmation.open} onOpenChange={handleDeleteCancel}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete the "
              {deleteConfirmation.anomalyType}" anomaly? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleDeleteCancel}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
