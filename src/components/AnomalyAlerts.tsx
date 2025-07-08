import { useState, useEffect, useCallback } from "react";
import { useAnomalies } from "@/hooks/useReduxData";
import {
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

  const { data: anomalies, loading: isLoading, error } = useAnomalies();

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
    const unsubscribe = subscribeToAnomalies((anomaly: Anomaly) => {
      setRealtimeAlerts((prev) => {
        // Only add if not already present in either real-time or fetched anomalies
        const alreadyExists =
          prev.some((a) => a._id === anomaly._id) ||
          (anomalies && anomalies.some((a) => a._id === anomaly._id));
        if (alreadyExists) return prev;
        return [anomaly, ...prev];
      });
    });

    return unsubscribe;
  }, [subscribeToAnomalies, anomalies]);

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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Anomaly Alerts</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            AI-detected security events and incidents
          </p>
          <div className="flex items-center gap-2 mt-1">
            <div
              className={`w-2 h-2 rounded-full connection-indicator ${getConnectionStatusColor()}`}
            />
            <span className="text-xs text-muted-foreground">
              {getConnectionStatusText()}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({dedupedAlerts.length})</SelectItem>
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

      <div className="space-y-3 sm:space-y-4">
        {filteredAlerts.map((alert) => (
          <Card
            key={alert._id}
            id={`anomaly-${alert._id}`}
            className="bg-card/50 backdrop-blur border-border/50 hover:bg-card/70 transition-colors cursor-pointer px-2 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4"
            style={{ overflowX: "auto" }}
            onClick={() => handleOpenDetailView(alert)}
          >
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-6 flex-wrap">
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <AlertTriangle
                      className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${
                        alert.confidence >= 80
                          ? "text-red-400"
                          : alert.confidence >= 60
                          ? "text-yellow-400"
                          : "text-blue-400"
                      }`}
                    />
                    <CardTitle className="text-base sm:text-lg truncate">
                      {alert.type}
                    </CardTitle>
                    <Badge
                      variant={getConfidenceColor(alert.confidence)}
                      className="text-xs flex-shrink-0"
                    >
                      {alert.confidence}% Confidence
                    </Badge>
                    <Badge
                      variant={getStatusColor(alert.status)}
                      className="text-xs flex-shrink-0"
                    >
                      {alert.status}
                    </Badge>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">{alert.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span>{new Date(alert.timestamp).toLocaleString()}</span>
                    </div>
                    {alert.duration && (
                      <div>
                        <span>Duration: {alert.duration}</span>
                      </div>
                    )}
                  </div>

                  {alert.description && (
                    <div className="text-xs sm:text-sm text-muted-foreground mt-2">
                      <p className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {alert.description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-left md:text-right space-y-2 flex-shrink-0 min-w-[140px] md:min-w-[180px]">
                  <div className="text-xs sm:text-sm text-muted-foreground break-all">
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
                      className="text-xs sm:text-sm"
                    >
                      <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      View Details
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
                        className="text-xs sm:text-sm"
                      >
                        {updatingAnomaly &&
                        updatingAnomaly.id === alert._id &&
                        updatingAnomaly.action === "acknowledge" ? (
                          <Spinner className="h-3 w-3 sm:h-4 sm:w-4" />
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
                        className="text-xs sm:text-sm"
                      >
                        {updatingAnomaly &&
                        updatingAnomaly.id === alert._id &&
                        updatingAnomaly.action === "resolve" ? (
                          <Spinner className="h-3 w-3 sm:h-4 sm:w-4" />
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
                      className="text-xs sm:text-sm text-red-600 hover:text-red-700"
                    >
                      {isDeleting &&
                      deleteConfirmation.anomalyId === alert._id ? (
                        <Spinner className="h-3 w-3 sm:h-4 sm:w-4" />
                      ) : (
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>

            {alert.clip_url && (
              <CardContent className="pt-0">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs sm:text-sm"
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
                    <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{videoModal.title} - Clip Playback</DialogTitle>
          </DialogHeader>
          {videoModal.url && (
            <div>
              <video
                src={videoModal.url}
                controls
                autoPlay
                style={{ width: "100%", maxHeight: "60vh", borderRadius: 8 }}
              />
              {videoModal.anomaly && (
                <div className="mt-4 p-3 rounded bg-muted/30">
                  <div className="font-semibold mb-1">Anomaly Info</div>
                  <div>Type: {videoModal.anomaly.type}</div>
                  <div>Location: {videoModal.anomaly.location}</div>
                  <div>Confidence: {videoModal.anomaly.confidence}%</div>
                  <div>Status: {videoModal.anomaly.status}</div>
                  <div>
                    Timestamp:{" "}
                    {new Date(videoModal.anomaly.timestamp).toLocaleString()}
                  </div>
                  {videoModal.anomaly.duration && (
                    <div>Duration: {videoModal.anomaly.duration}</div>
                  )}
                  <div>
                    Camera ID: {renderCameraId(videoModal.anomaly.camera_id)}
                  </div>
                  {videoModal.anomaly.description && (
                    <div className="mt-2">
                      <div className="font-medium">Description:</div>
                      <div className="text-sm text-muted-foreground">
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
            <DialogTitle>Confirm Deletion</DialogTitle>
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
