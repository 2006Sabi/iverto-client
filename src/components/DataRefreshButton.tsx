import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

import { dataInitializer } from "@/services/dataInitializer";
import { useAppDispatch } from "@/store/hooks";
import { addNotification } from "@/store/slices/uiSlice";

interface DataRefreshButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  refreshType?: "all" | "cameras" | "anomalies" | "dashboard";
  showText?: boolean;
}

export const DataRefreshButton = ({
  variant = "outline",
  size = "default",
  className = "",
  refreshType = "all",
  showText = true,
}: DataRefreshButtonProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dispatch = useAppDispatch();

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      switch (refreshType) {
        case "cameras":
          await dataInitializer.refreshCamerasData();
          dispatch(
            addNotification({
              type: "success",
              title: "Cameras Refreshed",
              message: "Camera data has been updated successfully.",
            })
          );
          break;
        case "anomalies":
          // You can add specific anomaly refresh logic here
          await dataInitializer.refreshAllData();
          dispatch(
            addNotification({
              type: "success",
              title: "Data Refreshed",
              message: "Anomaly data has been updated successfully.",
            })
          );
          break;
        case "dashboard":
          // You can add specific dashboard refresh logic here
          await dataInitializer.refreshAllData();
          dispatch(
            addNotification({
              type: "success",
              title: "Dashboard Refreshed",
              message: "Dashboard data has been updated successfully.",
            })
          );
          break;
        default:
          await dataInitializer.refreshAllData();
          dispatch(
            addNotification({
              type: "success",
              title: "Data Refreshed",
              message: "All data has been updated successfully.",
            })
          );
      }
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          title: "Refresh Failed",
          message: "Failed to refresh data. Please try again.",
        })
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`${className} ${isRefreshing ? "animate-spin" : ""}`}
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      {showText && (
        <span className="ml-2">
          {isRefreshing
            ? "Refreshing..."
            : `Refresh ${refreshType === "all" ? "All" : refreshType}`}
        </span>
      )}
    </Button>
  );
};
