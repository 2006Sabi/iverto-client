import { useState, useEffect, createContext, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, Settings, Trash2, Eye, Wifi, WifiOff } from 'lucide-react';
import {
  useGetCamerasQuery,
  useDeleteCameraMutation,
} from '@/store/api/cameraApi';
import { useAppDispatch } from '@/store/hooks';
import { addNotification } from '@/store/slices/uiSlice';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalIp } from '../contexts/LocalIpContext';

export const LiveCameraGrid = () => {
  const dispatch = useAppDispatch();
  const { data: camerasData, isLoading, error } = useGetCamerasQuery({});
  const [deleteCamera] = useDeleteCameraMutation();
  const localIp = useLocalIp();

  const handleDeleteCamera = async (cameraId: string, cameraName: string) => {
    try {
      await deleteCamera(cameraId).unwrap();
      dispatch(
        addNotification({
          type: 'success',
          title: 'Camera Deleted',
          message: `${cameraName} has been removed from the system`,
        })
      );
    } catch (err) {
      dispatch(
        addNotification({
          type: 'error',
          title: 'Delete Failed',
          message: 'Failed to delete camera',
        })
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Camera Management</h2>
            <p className="text-muted-foreground">
              Manage all security cameras in your system
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="aspect-video w-full rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Camera Management</h2>
            <p className="text-muted-foreground">
              Manage all security cameras in your system
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              Failed to load cameras. Please try again.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cameras = camerasData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Camera Management</h2>
          <p className="text-muted-foreground">
            Manage all security cameras in your system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-green-400 border-green-400/50">
            {cameras.filter((c) => c.status === 'Online').length} Online
          </Badge>
          <Badge variant="outline" className="text-red-400 border-red-400/50">
            {cameras.filter((c) => c.status === 'Offline').length} Offline
          </Badge>
        </div>
      </div>

      <div className="camera-grid">
        {cameras.map((camera) => {
          const isOnline = camera.status === 'Online';
          return (
            <Card
              key={camera._id}
              className={`bg-card/50 backdrop-blur border-border/50 transition-all duration-300 hover:shadow-lg`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        camera.status === 'Online'
                          ? 'bg-green-400'
                          : 'bg-red-400'
                      }`}
                    />
                    {camera.name}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      CAM {String(camera._id.slice(-4)).toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {camera.location}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Live Video Stream */}
                <div className="aspect-video bg-black/80 rounded-lg overflow-hidden flex items-center justify-center mb-2">
                  {isOnline ? (
                    localIp ? (
                      <img
                        className="w-full h-full object-cover"
                        src={`http://${localIp}:5000/stream/${camera._id}`}
                        alt="Live Camera Stream"
                        onError={(e) => {
                          e.currentTarget.src = '/public/placeholder.svg';
                        }}
                        style={{ width: '100%', height: '100%' }}
                      />
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
                {/* Camera Information Section */}
                <div className="aspect-video bg-black/50 rounded-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Camera className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
                      <p className="text-sm text-muted-foreground">
                        Camera Information
                      </p>
                      <p className="text-xs text-muted-foreground break-all px-2">
                        {camera.url}
                      </p>
                    </div>
                  </div>

                  <div className="absolute top-2 left-2">
                    <Badge
                      variant="outline"
                      className="text-xs bg-black/50 text-white border-white/20">
                      {camera.status}
                    </Badge>
                  </div>

                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0">
                        <Settings className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        onClick={() =>
                          handleDeleteCamera(camera._id, camera.name)
                        }>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Added: {new Date(camera.created_at).toLocaleDateString()}
                  </span>
                  <Badge
                    variant={
                      camera.status === 'Online' ? 'default' : 'destructive'
                    }
                    className="text-xs">
                    {camera.status === 'Online' ? (
                      <>
                        <Wifi className="h-3 w-3 mr-1" /> Online
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-3 w-3 mr-1" /> Offline
                      </>
                    )}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {cameras.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              No cameras configured. Add your first camera to get started.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
