import { useRef, useMemo, useEffect, useCallback } from "react";
import { useAppSelector } from "@/store/hooks";
import type { Camera } from "@/types/api";

interface UseOptimizedCameraDataReturn {
  cameras: Camera[];
  hasChanged: boolean;
  isFirstLoad: boolean;
  statusCounts: {
    onlineCount: number;
    offlineCount: number;
    totalCount: number;
  };
  shouldRefresh: boolean;
}

export const useOptimizedCameraData = (): UseOptimizedCameraDataReturn => {
  const cameras = useAppSelector((state) => state.data.cameras);
  const lastUpdated = useAppSelector((state) => state.data.lastUpdated.cameras);

  // Track previous state to detect changes
  const previousCameras = useRef<Camera[]>([]);
  const previousUpdateTime = useRef<string | null>(null);
  const isFirstLoad = useRef(true);
  const hasInitialized = useRef(false);

  // Memoized camera data to prevent unnecessary re-renders
  const memoizedCameras = useMemo(() => cameras, [cameras]);

  // Check if data has actually changed
  const hasChanged = useMemo(() => {
    // First load - no change
    if (isFirstLoad.current) {
      return false;
    }

    // Check if update timestamp has changed
    if (lastUpdated !== previousUpdateTime.current) {
      previousUpdateTime.current = lastUpdated;
      return true;
    }

    // Compare camera arrays
    if (cameras.length !== previousCameras.current.length) {
      return true;
    }

    // Deep comparison of camera objects
    return cameras.some((camera, index) => {
      const previousCamera = previousCameras.current[index];
      if (!previousCamera) return true;

      return (
        camera._id !== previousCamera._id ||
        camera.name !== previousCamera.name ||
        camera.status !== previousCamera.status ||
        camera.location !== previousCamera.location ||
        camera.url !== previousCamera.url ||
        camera.created_at !== previousCamera.created_at
      );
    });
  }, [cameras, lastUpdated]);

  // Memoized status counts
  const statusCounts = useMemo(() => {
    const onlineCount = cameras.filter((c) => c.status === "Online").length;
    const offlineCount = cameras.filter((c) => c.status !== "Online").length;
    const totalCount = cameras.length;

    return { onlineCount, offlineCount, totalCount };
  }, [cameras]);

  // Determine if we should refresh data
  const shouldRefresh = useMemo(() => {
    // Only refresh on first load or when data has actually changed
    return isFirstLoad.current || hasChanged;
  }, [hasChanged]);

  // Update previous state when data changes
  useEffect(() => {
    if (cameras.length > 0) {
      previousCameras.current = [...cameras];
      isFirstLoad.current = false;
      hasInitialized.current = true;
    }
  }, [cameras]);

  // Update previous update time
  useEffect(() => {
    if (lastUpdated) {
      previousUpdateTime.current = lastUpdated;
    }
  }, [lastUpdated]);

  return {
    cameras: memoizedCameras,
    hasChanged,
    isFirstLoad: isFirstLoad.current,
    statusCounts,
    shouldRefresh,
  };
};
