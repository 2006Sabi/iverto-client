import { useRef, useMemo, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import type { Camera } from "@/types/api";

interface UseCameraDataReturn {
  cameras: Camera[];
  hasChanged: boolean;
  isFirstLoad: boolean;
  statusCounts: {
    onlineCount: number;
    offlineCount: number;
    totalCount: number;
  };
}

export const useCameraData = (): UseCameraDataReturn => {
  const cameras = useAppSelector((state) => state.data.cameras);
  const lastUpdated = useAppSelector((state) => state.data.lastUpdated.cameras);

  const isFirstLoad = useRef(true);
  const lastCameraData = useRef<Camera[]>([]);
  const lastUpdateTime = useRef<string | null>(null);

    // Check if camera data has actually changed
  const hasChanged = useMemo(() => {
    if (isFirstLoad.current) {
      return false;
    }
    
    // Check if update timestamp has changed
    if (lastUpdated !== lastUpdateTime.current) {
      lastUpdateTime.current = lastUpdated;
      console.log('Camera data changed: timestamp update');
      return true;
    }
    
    // Compare current cameras with last known state
    if (cameras.length !== lastCameraData.current.length) {
      console.log('Camera data changed: count change', cameras.length, lastCameraData.current.length);
      return true;
    }
    
    // Check if any camera properties have changed
    const hasPropertyChanged = cameras.some((camera, index) => {
      const lastCamera = lastCameraData.current[index];
      if (!lastCamera) return true;
      
      return (
        camera._id !== lastCamera._id ||
        camera.name !== lastCamera.name ||
        camera.status !== lastCamera.status ||
        camera.location !== lastCamera.location ||
        camera.url !== lastCamera.url ||
        camera.created_at !== lastCamera.created_at
      );
    });
    
    if (hasPropertyChanged) {
      console.log('Camera data changed: property change');
    }
    
    return hasPropertyChanged;
  }, [cameras, lastUpdated]);

  // Memoized status counts to prevent unnecessary recalculations
  const statusCounts = useMemo(() => {
    const onlineCount = cameras.filter((c) => c.status === "Online").length;
    const offlineCount = cameras.filter((c) => c.status !== "Online").length;
    const totalCount = cameras.length;

    return { onlineCount, offlineCount, totalCount };
  }, [cameras]);

  // Update last known camera data when data changes
  useEffect(() => {
    if (cameras.length > 0) {
      lastCameraData.current = [...cameras];
      isFirstLoad.current = false;
    }
  }, [cameras]);

  return {
    cameras,
    hasChanged,
    isFirstLoad: isFirstLoad.current,
    statusCounts,
  };
};
