import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, Settings, Trash2, Eye, Wifi, WifiOff } from 'lucide-react';
import { useGetCamerasQuery, useDeleteCameraMutation } from '@/store/api/cameraApi';
import { useAppDispatch } from '@/store/hooks';
import { addNotification } from '@/store/slices/uiSlice';
import type { Camera as CameraType } from '@/types/api';

export const LiveCameraGrid = () => {
  const dispatch = useAppDispatch();
  const { data: camerasData, isLoading, error } = useGetCamerasQuery({});
  const [deleteCamera] = useDeleteCameraMutation();

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Camera Management</h2>
            <p className="text-muted-foreground">Manage all security cameras in your system</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-200 rounded"></div>
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
            <p className="text-muted-foreground">Manage all security cameras in your system</p>
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
          <p className="text-muted-foreground">Manage all security cameras in your system</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-400 border-green-400/50">
            {cameras.filter(c => c.status === 'Live').length} Online
          </Badge>
          <Badge variant="outline" className="text-red-400 border-red-400/50">
            {cameras.filter(c => c.status === 'Offline').length} Offline
          </Badge>
        </div>
      </div>

      <div className="camera-grid">
        {cameras.map((camera) => {
          const isOnline = camera.status === 'Live';
          return (
            <Card 
              key={camera._id} 
              className={`bg-card/50 backdrop-blur border-border/50 transition-all duration-300 hover:shadow-lg`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      camera.status === 'Live' ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    {camera.name}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      CAM {String(camera._id.slice(-4)).toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{camera.location}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="aspect-video bg-black/50 rounded-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Camera className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
                      <p className="text-sm text-muted-foreground">Camera Information</p>
                      <p className="text-xs text-muted-foreground break-all px-2">{camera.url}</p>
                    </div>
                  </div>
                  
                  <div className="absolute top-2 left-2">
                    <Badge variant="outline" className="text-xs bg-black/50 text-white border-white/20">
                      {camera.status}
                    </Badge>
                  </div>
                  
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteCamera(camera._id, camera.name)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Added: {new Date(camera.created_at).toLocaleDateString()}
                  </span>
                  <Badge variant={camera.status === 'Live' ? 'default' : 'destructive'} className="text-xs">
                    {camera.status === 'Live' ? (
                      <><Wifi className="h-3 w-3 mr-1" /> Live</>
                    ) : (
                      <><WifiOff className="h-3 w-3 mr-1" /> Offline</>
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
