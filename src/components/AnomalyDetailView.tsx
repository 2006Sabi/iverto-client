import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetCameraQuery } from "@/store/api/cameraApi";
import { useUpdateAnomalyStatusMutation } from "@/store/api/anomalyApi";
import { useAppDispatch } from "@/store/hooks";
import { addNotification } from "@/store/slices/uiSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowLeft,
  MapPin,
  Clock,
  Camera,
  CheckCircle,
  XCircle,
  Download,
} from "lucide-react";
import { Spinner } from "@/components/ui/loading";
import { useSelector } from "react-redux";
import type { Anomaly } from "@/types/api";

interface AnomalyDetailViewProps {
  anomaly: Anomaly;
  onClose: () => void;
}

export const AnomalyDetailView = ({
  anomaly,
  onClose,
}: AnomalyDetailViewProps) => {
  const dispatch = useAppDispatch();
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const apiKey = useSelector((state: any) => state.auth.user?.apiKey);

  const [updateAnomalyStatus, { isLoading: isUpdating }] =
    useUpdateAnomalyStatusMutation();

  // Get camera details
  const getCameraId = () => {
    if (typeof anomaly.camera_id === "string") return anomaly.camera_id;
    if (
      anomaly.camera_id &&
      typeof anomaly.camera_id === "object" &&
      anomaly.camera_id._id
    )
      return anomaly.camera_id._id;
    if (
      anomaly.camera_id &&
      typeof anomaly.camera_id === "object" &&
      anomaly.camera_id.id
    )
      return anomaly.camera_id.id;
    return "";
  };

  const { data: cameraData, isLoading: isCameraLoading } = useGetCameraQuery(
    getCameraId()
  );

  const camera = cameraData?.data;

  // Load video when component mounts
  useEffect(() => {
    if (anomaly.clip_url && apiKey) {
      loadVideo();
    }
  }, [anomaly.clip_url, apiKey]);

  const loadVideo = async () => {
    if (!anomaly.clip_url || !apiKey) return;

    setIsVideoLoading(true);
    try {
      const response = await fetch(anomaly.clip_url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch video");
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setVideoUrl(blobUrl);
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          title: "Error",
          message: "Failed to load video clip",
        })
      );
    } finally {
      setIsVideoLoading(false);
    }
  };

  const handleAcknowledge = async () => {
    try {
      const result = await updateAnomalyStatus({
        id: anomaly._id,
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
        // Refresh the data to ensure UI is updated
        window.location.reload();
      }
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          title: "Error",
          message: "Failed to acknowledge anomaly",
        })
      );
    }
  };

  const handleResolve = async () => {
    try {
      const result = await updateAnomalyStatus({
        id: anomaly._id,
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
        // Refresh the data to ensure UI is updated
        window.location.reload();
      }
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          title: "Error",
          message: "Failed to resolve anomaly",
        })
      );
    }
  };

  const handleDownloadClip = async () => {
    if (!anomaly.clip_url || !apiKey) return;

    try {
      const response = await fetch(anomaly.clip_url, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (!response.ok) throw new Error("Failed to download clip");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${anomaly.type || "anomaly"}-clip.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      dispatch(
        addNotification({
          type: "success",
          title: "Download Started",
          message: "Video clip download has started",
        })
      );
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          title: "Error",
          message: "Failed to download video clip",
        })
      );
    }
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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "destructive";
    if (confidence >= 60) return "default";
    return "secondary";
  };

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg">
                  <AlertTriangle
                    className={`h-5 w-5 ${
                      anomaly.confidence >= 80
                        ? "text-red-500"
                        : anomaly.confidence >= 60
                        ? "text-yellow-500"
                        : "text-blue-500"
                    }`}
                  />
                </div>
                <h1 className="text-xl font-bold">{anomaly.type}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={getConfidenceColor(anomaly.confidence)}>
                {anomaly.confidence}% Confidence
              </Badge>
              <Badge variant={getStatusColor(anomaly.status)}>
                {anomaly.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Camera Details Section */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Camera className="h-5 w-5 text-blue-500" />
              </div>
              Camera Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isCameraLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner className="h-6 w-6" />
              </div>
            ) : camera ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Camera Name
                    </label>
                    <p className="text-base">{camera.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Location
                    </label>
                    <p className="text-base">{camera.location}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Status
                    </label>
                    <Badge
                      variant={
                        camera.status === "Online" ? "default" : "secondary"
                      }
                    >
                      {camera.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Camera ID
                    </label>
                    <p className="text-base font-mono text-sm">{camera._id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Created
                    </label>
                    <p className="text-base">
                      {new Date(camera.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Last Updated
                    </label>
                    <p className="text-base">
                      {new Date(camera.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Camera information not available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Anomaly Details Section */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle>Anomaly Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Type
                  </label>
                  <p className="text-base">{anomaly.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Location
                  </label>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base">{anomaly.location}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Timestamp
                  </label>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base">
                      {new Date(anomaly.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Duration
                  </label>
                  <p className="text-base">{anomaly.duration}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Confidence
                  </label>
                  <p className="text-base">{anomaly.confidence}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <Badge variant={getStatusColor(anomaly.status)}>
                    {anomaly.status}
                  </Badge>
                </div>
              </div>
            </div>

            {anomaly.description && (
              <div className="mt-4 pt-4 border-t">
                <label className="text-sm font-medium text-muted-foreground">
                  Description
                </label>
                <p className="text-base mt-1">{anomaly.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Video Section */}
        {anomaly.clip_url && (
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Video Clip</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadClip}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isVideoLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Spinner className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-muted-foreground">Loading video...</p>
                  </div>
                </div>
              ) : videoUrl ? (
                <div className="aspect-video bg-black overflow-hidden">
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Video not available
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              {anomaly.status === "Active" && (
                <Button
                  onClick={handleAcknowledge}
                  disabled={isUpdating}
                  className="flex items-center gap-2"
                >
                  {isUpdating ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  Acknowledge
                </Button>
              )}
              {anomaly.status !== "Resolved" && (
                <Button
                  variant="outline"
                  onClick={handleResolve}
                  disabled={isUpdating}
                  className="flex items-center gap-2"
                >
                  {isUpdating ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  Resolve
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
