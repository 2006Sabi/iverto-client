import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, X } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { addNotification } from "@/store/slices/uiSlice";
import { Spinner } from "@/components/ui/loading";
import type { CreateCameraRequest } from "@/types/api";
import OperationService from "@/services/operationService";
import { useGetAnomalyEntitiesQuery } from "@/store/api/anomalyEntityApi";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddCameraDialogProps {
  onAddCamera?: (camera: CreateCameraRequest) => void;
}

export const AddCameraDialog = ({ onAddCamera }: AddCameraDialogProps) => {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    url: "",
    httpUrl: "", // New field for HTTP stream URL
    anomalyEntities: [] as string[],
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { data: anomalyEntities = [], isLoading: isLoadingEntities } =
    useGetAnomalyEntitiesQuery();

  const operationService = OperationService.getInstance();

  const handleReset = () => {
    setFormData({
      name: "",
      location: "",
      url: "",
      httpUrl: "", // Reset httpUrl
      anomalyEntities: [],
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (
      !formData.name ||
      !formData.location ||
      !formData.url ||
      !formData.httpUrl
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // URL validation - use a more flexible approach for camera URLs
    const urlPatterns = [
      /^rtsp:\/\/.+/i, // RTSP URLs
      /^rtmp:\/\/.+/i, // RTMP URLs
      /^http:\/\/.+/i, // HTTP URLs
      /^https:\/\/.+/i, // HTTPS URLs
      /^rtp:\/\/.+/i, // RTP URLs
      /^udp:\/\/.+/i, // UDP URLs
      /^tcp:\/\/.+/i, // TCP URLs
      /^srt:\/\/.+/i, // SRT URLs
      /^webrtc:\/\/.+/i, // WebRTC URLs
      /^file:\/\/.+/i, // File URLs
    ];

    const isValidUrl = urlPatterns.some((pattern) =>
      pattern.test(formData.url)
    );
    if (!isValidUrl) {
      setError(
        "Please provide a valid camera URL (RTSP, RTMP, HTTP, HTTPS, etc.)"
      );
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await operationService.addCamera(formData);

      dispatch(
        addNotification({
          type: "success",
          title: "Camera Added",
          message: "Camera has been successfully added to the system",
        })
      );

      handleReset();
      setOpen(false);
      if (onAddCamera) {
        onAddCamera(formData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create camera");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEntityToggle = (entityId: string) => {
    setFormData((prev) => ({
      ...prev,
      anomalyEntities: prev.anomalyEntities.includes(entityId)
        ? prev.anomalyEntities.filter((id) => id !== entityId)
        : [...prev.anomalyEntities, entityId],
    }));
  };

  const removeEntity = (entityId: string) => {
    setFormData((prev) => ({
      ...prev,
      anomalyEntities: prev.anomalyEntities.filter((id) => id !== entityId),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="floating-button" data-add-camera>
          <Plus className="h-4 w-4 mr-2" />
          Add Camera
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none shadow-xl">
        <DialogHeader>
          <DialogTitle>Add New Camera</DialogTitle>
          <DialogDescription>
            Configure a new security camera for monitoring
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Camera Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Main Entrance"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              disabled={isLoading}
              required
              className="rounded-none shadow-sm focus:shadow-md transition-shadow"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              placeholder="e.g., Building A - Floor 1"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              disabled={isLoading}
              required
              className="rounded-none shadow-sm focus:shadow-md transition-shadow"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Camera URL *</Label>
            <Input
              id="url"
              placeholder="e.g., rtsp://192.168.1.100:554/stream"
              value={formData.url}
              onChange={(e) => handleChange("url", e.target.value)}
              disabled={isLoading}
              required
              className="rounded-none shadow-sm focus:shadow-md transition-shadow"
            />
            <p className="text-xs text-muted-foreground">
              Enter the full URL including protocol (rtsp://, http://, etc.)
            </p>
          </div>

          {/* New field for HTTP stream URL */}
          <div className="space-y-2">
            <Label htmlFor="httpUrl">HTTP Stream URL *</Label>
            <Input
              id="httpUrl"
              placeholder="e.g., http://192.168.1.100:8080/stream"
              value={formData.httpUrl}
              onChange={(e) => handleChange("httpUrl", e.target.value)}
              disabled={isLoading}
              required
              className="rounded-none shadow-sm focus:shadow-md transition-shadow"
            />
            <p className="text-xs text-muted-foreground">
              Enter the HTTP/HTTPS stream URL (optional for some cameras)
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>Anomaly Detection</span>
              {formData.anomalyEntities.length > 0 && (
                <Badge variant="secondary" className="font-normal">
                  {formData.anomalyEntities.length} selected
                </Badge>
              )}
            </Label>

            <Select onValueChange={handleEntityToggle} disabled={isLoading}>
              <SelectTrigger className="w-full h-auto min-h-[40px] py-2 rounded-none shadow-sm focus:shadow-md transition-shadow">
                <SelectValue
                  placeholder={
                    formData.anomalyEntities.length === 0
                      ? "Select anomalies to monitor..."
                      : `${formData.anomalyEntities.length} anomalies selected`
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] rounded-none shadow-md">
                <SelectGroup>
                  <div className="px-2 py-1.5">
                    <h4 className="mb-2 text-sm font-medium leading-none">
                      Available Anomalies
                    </h4>
                    {isLoadingEntities ? (
                      <div className="flex items-center justify-center py-4">
                        <Spinner size="sm" />
                        <span className="ml-2 text-sm text-muted-foreground">
                          Loading anomalies...
                        </span>
                      </div>
                    ) : anomalyEntities.length === 0 ? (
                      <div className="py-6 text-center">
                        <div className="text-sm text-muted-foreground">
                          No anomalies available
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {anomalyEntities.map((entity) => (
                          <div
                            key={entity._id}
                            role="button"
                            onClick={() => handleEntityToggle(entity._id)}
                            className={`
                              relative flex items-start gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors
                              hover:bg-accent hover:text-accent-foreground
                              ${
                                formData.anomalyEntities.includes(entity._id)
                                  ? "bg-accent/50"
                                  : ""
                              }
                            `}
                          >
                            <div className="flex flex-col flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {entity.name}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1 py-0"
                                >
                                  {entity.code}
                                </Badge>
                              </div>
                              <span className="text-xs text-muted-foreground line-clamp-2">
                                {entity.description}
                              </span>
                            </div>
                            <div
                              className={`
                              flex h-4 w-4 items-center justify-center rounded-sm border
                              ${
                                formData.anomalyEntities.includes(entity._id)
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-primary/20"
                              }
                            `}
                            >
                              {formData.anomalyEntities.includes(
                                entity._id
                              ) && (
                                <svg
                                  width="10"
                                  height="10"
                                  viewBox="0 0 10 10"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M8.5 2.5L3.5 7.5L1.5 5.5"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </SelectGroup>
              </SelectContent>
            </Select>

            {formData.anomalyEntities.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5 p-2 border rounded-md bg-muted/30">
                {anomalyEntities
                  .filter((entity) =>
                    formData.anomalyEntities.includes(entity._id)
                  )
                  .map((entity) => (
                    <Badge
                      key={entity._id}
                      variant="secondary"
                      className="flex items-center gap-1 py-0.5 pl-2 pr-1 bg-background hover:bg-background/80"
                    >
                      <span>{entity.name}</span>
                      <button
                        type="button"
                        onClick={() => removeEntity(entity._id)}
                        className="ml-1 rounded-full hover:bg-muted p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {entity.name}</span>
                      </button>
                    </Badge>
                  ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="rounded-none shadow-md hover:shadow-lg transition-shadow"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !formData.name ||
                !formData.location ||
                !formData.url
              }
              className="rounded-none shadow-md hover:shadow-lg transition-shadow"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  Adding...
                </div>
              ) : (
                "Add Camera"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
