import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AddCameraDialog } from './AddCameraDialog';
import { Eye, Wifi, WifiOff, RefreshCw, Settings, Trash2 } from 'lucide-react';
import { useGetCamerasQuery, useDeleteCameraMutation } from '@/store/api/cameraApi';
import { CameraGridSkeleton, ErrorState, EmptyState } from '@/components/ui/loading';
import { useAppDispatch } from '@/store/hooks';
import { addNotification } from '@/store/slices/uiSlice';
import type { Camera, CreateCameraRequest } from '@/types/api';
import { useLocalIp } from '../contexts/LocalIpContext';

export const LiveCameraView = () => {
  const dispatch = useAppDispatch();
  const { 
    data: camerasData, 
    isLoading, 
    error, 
    refetch 
  } = useGetCamerasQuery({});

  const [deleteCamera] = useDeleteCameraMutation();
  const localIp = useLocalIp();

  const handleAddCamera = (cameraData: CreateCameraRequest) => {
    // The Redux mutation will automatically invalidate the cache and refetch
    // No need to manually call refetch here
  };

  const handleDeleteCamera = async (cameraId: string, cameraName: string) => {
    try {
      await deleteCamera(cameraId).unwrap();
      dispatch(addNotification({
        type: 'success',
        title: 'Camera Deleted',
        message: `${cameraName} has been removed from the system`
      }));
    } catch (err) {
      dispatch(addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete camera'
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Camera Management</h2>
            <p className="text-muted-foreground">Manage all security cameras in your system</p>
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
            <h2 className="text-3xl font-bold text-foreground mb-2">Camera Management</h2>
            <p className="text-muted-foreground">Manage all security cameras in your system</p>
          </div>
          <AddCameraDialog onAddCamera={handleAddCamera} />
        </div>
        <ErrorState 
          title="Failed to load cameras"
          message="Unable to fetch camera data from the server"
          onRetry={refetch}
        />
      </div>
    );
  }

  const cameras = camerasData?.data || [];

  if (cameras.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Camera Management</h2>
            <p className="text-muted-foreground">Manage all security cameras in your system</p>
          </div>
          <AddCameraDialog onAddCamera={handleAddCamera} />
        </div>
        <EmptyState 
          title="No cameras configured"
          message="Add your first security camera to start monitoring"
          action={<AddCameraDialog onAddCamera={handleAddCamera} />}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Camera Management</h2>
          <p className="text-muted-foreground">Manage all security cameras in your system</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="Refresh cameras"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <AddCameraDialog onAddCamera={handleAddCamera} />
        </div>
      </div>

      <div className="camera-grid">
        {cameras.map((camera) => {
          const isOnline = camera.status === 'Online';
          return (
            <Card key={camera._id} className="modern-card overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Eye className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">{camera.name}</div>
                      <div className="text-sm text-muted-foreground font-normal">{camera.location}</div>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      camera.status === 'Online' ? 'default' : 'destructive'
                    }
                    className={`sleek-badge border-0 ${
                      camera.status === 'Online' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                    }`}
                  >
                    {camera.status === 'Online' ? (
                      <><Wifi className="h-3 w-3 mr-1" /> Online</>
                    ) : (
                      <><WifiOff className="h-3 w-3 mr-1" /> Offline</>
                    )}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden rounded-lg">
                  {isOnline ? (
                    localIp ? (
                      <img
                        className="w-full h-full object-cover"
                        src={`http://${localIp}:5000/stream/${camera._id}`}
                        alt="Live Camera Stream"
                        onError={(e) => { e.currentTarget.src = '/public/placeholder.svg'; }}
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
                  <div className={`absolute top-4 left-4 w-3 h-3 rounded-full ${
                    isOnline
                      ? 'bg-green-500 status-indicator status-online' 
                      : 'bg-red-500 status-indicator status-offline'
                  }`} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Added: {new Date(camera.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <Settings className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteCamera(camera._id, camera.name)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
