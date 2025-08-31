import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch } from "@/store/hooks";
import { addNotification } from "@/store/slices/uiSlice";
import { useUpdateCameraMutation } from "@/store/api/cameraApi";
import type { Camera } from "@/types/api";
import { Wifi, WifiOff, Play, Square, RefreshCw } from "lucide-react";

interface TestStreamDialogProps {
  camera: Camera | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStreamTestComplete?: (success: boolean) => void;
}

const TestStreamDialog = ({
  camera,
  open,
  onOpenChange,
  onStreamTestComplete,
}: TestStreamDialogProps) => {
  if (!camera) {
    return null;
  }

  const dispatch = useAppDispatch();
  const [updateCamera] = useUpdateCameraMutation();
  const [testUrl, setTestUrl] = useState(camera.httpUrl || "");
  const [isTesting, setIsTesting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamStatus, setStreamStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (open) {
      setTestUrl(camera.httpUrl || "");
      setStreamStatus("idle");
      setError("");
      setIsTesting(false);
      setIsStreaming(false);
    }
  }, [open, camera.httpUrl]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (streamTimeoutRef.current) {
        clearTimeout(streamTimeoutRef.current);
      }
      stopStream();
    };
  }, []);

  const stopStream = () => {
    if (videoRef.current) {
      videoRef.current.src = "";
      videoRef.current.load();
    }
    setIsStreaming(false);
    if (streamTimeoutRef.current) {
      clearTimeout(streamTimeoutRef.current);
    }
  };

  const testStream = async () => {
    if (!testUrl) {
      setError("Please enter a valid HTTP URL");
      return;
    }

    setIsTesting(true);
    setStreamStatus("loading");
    setError("");
    stopStream();

    try {
      // Validate URL format
      const urlPattern = /^https?:\/\/.+/i;
      if (!urlPattern.test(testUrl)) {
        throw new Error("Please enter a valid HTTP or HTTPS URL");
      }

      // Test the URL by creating an image element
      const testImage = new Image();
      
      testImage.onload = async () => {
        // URL is valid and accessible
        setStreamStatus("success");
        setIsTesting(false);
        
        // Start the actual video stream
        if (videoRef.current) {
          videoRef.current.src = testUrl;
          videoRef.current.load();
          setIsStreaming(true);
          
          // Set timeout to handle stream loading
          streamTimeoutRef.current = setTimeout(() => {
            if (videoRef.current && videoRef.current.readyState >= 2) {
              // Stream is playing successfully
              handleStreamSuccess();
            } else {
              setStreamStatus("error");
              setError("Stream failed to load within timeout period");
              setIsTesting(false);
            }
          }, 5000);
        }
      };

      testImage.onerror = () => {
        setStreamStatus("error");
        setError("Unable to access the stream URL. Please check the URL and try again.");
        setIsTesting(false);
        if (onStreamTestComplete) {
          onStreamTestComplete(false);
        }
      };

      testImage.src = testUrl;

    } catch (err) {
      setStreamStatus("error");
      setError(err instanceof Error ? err.message : "Failed to test stream");
      setIsTesting(false);
      if (onStreamTestComplete) {
        onStreamTestComplete(false);
      }
    }
  };

  const handleStreamSuccess = async () => {
    try {
      // Update camera status to Online
      await updateCamera({
        id: camera._id,
        updates: { status: "Online" }
      }).unwrap();

      dispatch(
        addNotification({
          type: "success",
          title: "Camera Status Updated",
          message: "Camera is now online and streaming successfully",
        })
      );

      setStreamStatus("success");
      if (onStreamTestComplete) {
        onStreamTestComplete(true);
      }
    } catch (err) {
      console.warn("Failed to update camera status:", err);
      setError("Stream is working but failed to update camera status");
      if (onStreamTestComplete) {
        onStreamTestComplete(false);
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleVideoLoad = () => {
    if (streamTimeoutRef.current) {
      clearTimeout(streamTimeoutRef.current);
    }
    if (videoRef.current && videoRef.current.readyState >= 2) {
      handleStreamSuccess();
    }
  };

  const handleVideoError = () => {
    setStreamStatus("error");
    setError("Failed to load video stream. Please check the URL and try again.");
    setIsTesting(false);
    setIsStreaming(false);
    if (onStreamTestComplete) {
      onStreamTestComplete(false);
    }
  };

  const getStatusBadge = () => {
    switch (streamStatus) {
      case "loading":
        return (
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-700">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Testing...
          </Badge>
        );
      case "success":
        return (
          <Badge variant="default" className="bg-green-500/20 text-green-700">
            <Wifi className="h-3 w-3 mr-1" />
            Online
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" className="bg-red-500/20 text-red-700">
            <WifiOff className="h-3 w-3 mr-1" />
            Offline
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-500/20 text-gray-700">
            <WifiOff className="h-3 w-3 mr-1" />
            Ready to Test
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none shadow-xl max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Test Camera Stream - {camera.name}
            {getStatusBadge()}
          </DialogTitle>
          <DialogDescription>
            Test the HTTP stream URL and update camera status to Online if successful
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="testUrl">HTTP Stream URL</Label>
            <div className="flex gap-2">
              <Input
                id="testUrl"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="Enter HTTP/HTTPS stream URL"
                disabled={isTesting}
                className="flex-1 rounded-none shadow-sm"
              />
              <Button
                onClick={testStream}
                disabled={isTesting || !testUrl}
                className="rounded-none shadow-sm"
              >
                {isTesting ? (
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" />
                    Testing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Test
                  </div>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Stream Preview</Label>
            <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center relative">
              {isStreaming ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain"
                  autoPlay
                  muted
                  playsInline
                  onLoadedData={handleVideoLoad}
                  onError={handleVideoError}
                />
              ) : streamStatus === "loading" ? (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <Spinner size="lg" />
                  <span className="mt-2">Loading stream...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <WifiOff className="h-8 w-8 mb-2" />
                  <span>No active stream</span>
                </div>
              )}
              
              {isStreaming && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={stopStream}
                >
                  <Square className="h-3 w-3 mr-1" />
                  Stop
                </Button>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-none shadow-sm"
            >
              Close
            </Button>
            {streamStatus === "success" && (
              <Button
                onClick={() => onOpenChange(false)}
                className="rounded-none shadow-sm"
              >
                Done
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestStreamDialog;
