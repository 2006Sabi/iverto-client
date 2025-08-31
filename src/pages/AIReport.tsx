import React, { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, Search, BarChart3, Camera, Info, Plus, Trash2, Monitor, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetAIReportsQuery, useGetProductivityAnalyticsQuery, useGetStateQuery } from "@/store/api/aiReportsApi";
import { useGetCamerasQuery, useDeleteCameraMutation } from "@/store/api/cameraApi";
import { CameraStream } from "@/components/CameraStream";
import { AddCameraDialog } from "@/components/AddCameraDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import type { Camera as CameraType } from "@/types/api";

interface ComparisonData {
  working: number;
  away: number;
  ideal: number;
}

const AIReport: React.FC = () => {
  const [viewMode, setViewMode] = useState<"main" | "compare">("main");
  const [comparison1From, setComparison1From] = useState("");
  const [comparison1To, setComparison1To] = useState("");
  const [comparison2From, setComparison2From] = useState("");
  const [comparison2To, setComparison2To] = useState("");
  const [comparison1Data, setComparison1Data] = useState<ComparisonData | null>(null);
  const [comparison2Data, setComparison2Data] = useState<ComparisonData | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<CameraType | null>(null);
  const [showCameraInfo, setShowCameraInfo] = useState(false);

  // Use Redux Toolkit Query hooks
  const { data: aiReportsData, isLoading: loadingReports } = useGetAIReportsQuery({ page: 1, limit: 10 });
  const { data: productivityData, isLoading: loadingProductivity } = useGetProductivityAnalyticsQuery({});
  const { data: camerasData, isLoading: loadingCameras } = useGetCamerasQuery({});
  const [deleteCamera] = useDeleteCameraMutation();

  // Get current date for realtime data
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const { data: realtimeStateData, isLoading: loadingRealtime } = useGetStateQuery(
    selectedCamera ? { date: currentDate, camera_id: selectedCamera._id } : { date: currentDate },
    { skip: !selectedCamera }
  );

  const cameras = camerasData?.data || [];

  const aiReports = aiReportsData?.data || [];
  const productivity = productivityData?.data;
  const loading = loadingReports || loadingProductivity;

  // Camera handling functions
  const handleCameraSelect = (camera: CameraType) => {
    setSelectedCamera(camera);
    setShowCameraInfo(false);
  };

  const handleDeleteCamera = async (cameraId: string) => {
    try {
      await deleteCamera(cameraId).unwrap();
      if (selectedCamera?._id === cameraId) {
        setSelectedCamera(null);
      }
    } catch (error) {
      console.error('Failed to delete camera:', error);
    }
  };

  const renderCameraDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Camera className="h-4 w-4" />
          <span>Camera</span>
          {selectedCamera && (
            <Badge variant="secondary" className="ml-2">
              {selectedCamera.name}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Cameras</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {cameras.length === 0 ? (
          <DropdownMenuItem disabled>No cameras available</DropdownMenuItem>
        ) : (
          cameras.map((camera) => (
            <div key={camera._id} className="flex items-center justify-between">
              <DropdownMenuItem
                onClick={() => handleCameraSelect(camera)}
                className="flex-1"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{camera.name}</span>
                  <span className="text-xs text-muted-foreground">{camera.location}</span>
                </div>
                <Badge
                  variant={camera.status === "Online" ? "default" : "secondary"}
                  className="ml-2"
                >
                  {camera.status}
                </Badge>
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Camera</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{camera.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteCamera(camera._id)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))
        )}
        <DropdownMenuSeparator />
        <div className="p-2">
          <AddCameraDialog />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderNavbar = () => {
    if (!selectedCamera) return null;

    return (
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Monitor className="h-4 w-4 mr-2" />
              {selectedCamera.name}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Select Camera</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {cameras.map((camera) => (
              <DropdownMenuItem
                key={camera._id}
                onClick={() => handleCameraSelect(camera)}
                className={selectedCamera._id === camera._id ? "bg-accent" : ""}
              >
                {camera.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCameraInfo(!showCameraInfo)}
        >
          <Info className="h-4 w-4 mr-2" />
          Information
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode("compare")}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Compare
        </Button>
      </div>
    );
  };

  const renderRealtimeData = () => {
    if (!selectedCamera) return null;

    // Use backend data for realtime information
    const realtimeData = realtimeStateData?.data?.[0] || null;
    const confidence = realtimeData ? Math.round(realtimeData.confidenceScore * 100) : 0;
    const lastUpdate = realtimeData ? new Date(realtimeData.updated_at).toLocaleTimeString() : new Date().toLocaleTimeString();

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Realtime Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingRealtime ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#cd0447]"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={selectedCamera.status === "Online" ? "default" : "secondary"}>
                      {selectedCamera.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">AI Confidence</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold text-[#cd0447]">
                      {confidence}%
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Last Update</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {lastUpdate}
                </p>
              </div>
              {realtimeData && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <Label className="text-xs font-medium">Working Time</Label>
                    <p className="text-sm font-semibold text-green-600">
                      {Math.round(realtimeData.workingTime / 60)} min
                    </p>
                  </div>
                  <div className="text-center">
                    <Label className="text-xs font-medium">Away Time</Label>
                    <p className="text-sm font-semibold text-yellow-600">
                      {Math.round(realtimeData.awayTime / 60)} min
                    </p>
                  </div>
                  <div className="text-center">
                    <Label className="text-xs font-medium">Ideal Time</Label>
                    <p className="text-sm font-semibold text-blue-600">
                      {Math.round(realtimeData.idealTime / 60)} min
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderCameraInfo = () => {
    if (!selectedCamera || !showCameraInfo) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Camera Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Name</Label>
              <p className="text-sm">{selectedCamera.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Location</Label>
              <p className="text-sm">{selectedCamera.location}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Badge variant={selectedCamera.status === "Online" ? "default" : "secondary"}>
                {selectedCamera.status}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium">URL</Label>
              <p className="text-sm text-muted-foreground truncate">{selectedCamera.url}</p>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Created</Label>
            <p className="text-sm text-muted-foreground">
              {new Date(selectedCamera.created_at).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const prepareChartData = () => {
    if (aiReports.length > 0) {
      return aiReports.map((report) => ({
        time: new Date(report.startTime).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        productivity: report.productivityScore,
        awayTime: report.awayTime / 60,
        workingTime: report.workingTime / 60,
        idealTime: report.idealTime / 60,
      }));
    }
    return [];
  };

  const handleComparisonSubmit = (comparisonNumber: 1 | 2) => {
    if (comparisonNumber === 1) {
      if (comparison1From && comparison1To) {
        setComparison1Data({
          working: 2400,
          away: 300,
          ideal: 600,
        });
      }
    } else if (comparisonNumber === 2) {
      if (comparison2From && comparison2To) {
        setComparison2Data({
          working: 2100,
          away: 450,
          ideal: 750,
        });
      }
    }
  };

  const renderGraphView = () => {
    const chartData = prepareChartData();

    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
            Productivity Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {loading ? (
            <div className="h-48 sm:h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#cd0447]"></div>
            </div>
          ) : (
            <div className="max-w-[101%] overflow-hidden">
              <ResponsiveContainer width="101%" height={300} className="text-xs sm:text-sm">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="productivity"
                    stroke="#cd0447"
                    strokeWidth={2}
                    name="Productivity Score"
                  />
                  <Line
                    type="monotone"
                    dataKey="workingTime"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Working Time (min)"
                  />
                  <Line
                    type="monotone"
                    dataKey="awayTime"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Away Time (min)"
                  />
                  <Line
                    type="monotone"
                    dataKey="idealTime"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Ideal Time (min)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderCompareView = () => {
    const COLORS = ['#10b981', '#f59e0b', '#3b82f6'];

    const renderPieChart = (data: ComparisonData | null, title: string, from: string, to: string) => {
      if (!data) return null;

      const pieData = [
        { name: 'Working', value: data.working, color: COLORS[0] },
        { name: 'Away', value: data.away, color: COLORS[1] },
        { name: 'Ideal', value: data.ideal, color: COLORS[2] },
      ];

      return (
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Working:</span>
                <span className="font-semibold">{Math.round(data.working)} min</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Away:</span>
                <span className="font-semibold">{Math.round(data.away)} min</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Ideal:</span>
                <span className="font-semibold">{Math.round(data.ideal)} min</span>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    };

    const renderProductivityComparisonGraph = () => {
      if (!comparison1Data || !comparison2Data) return null;

      const productivityData = [
        {
          name: 'Comparison 1',
          productivity: Math.round((comparison1Data.working / (comparison1Data.working + comparison1Data.away + comparison1Data.ideal)) * 100),
          working: comparison1Data.working,
          away: comparison1Data.away,
          ideal: comparison1Data.ideal
        },
        {
          name: 'Comparison 2',
          productivity: Math.round((comparison2Data.working / (comparison2Data.working + comparison2Data.away + comparison2Data.ideal)) * 100),
          working: comparison2Data.working,
          away: comparison2Data.away,
          ideal: comparison2Data.ideal
        }
      ];

      return (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Productivity Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="productivity"
                  stroke="#cd0447"
                  strokeWidth={3}
                  name="Productivity %"
                  dot={{ fill: '#cd0447', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <h4 className="font-semibold text-sm mb-2">Comparison 1</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Working:</span>
                    <span className="font-medium">{Math.round(comparison1Data.working)} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Away:</span>
                    <span className="font-medium">{Math.round(comparison1Data.away)} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ideal:</span>
                    <span className="font-medium">{Math.round(comparison1Data.ideal)} min</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#cd0447]">
                    <span>Productivity:</span>
                    <span>{Math.round((comparison1Data.working / (comparison1Data.working + comparison1Data.away + comparison1Data.ideal)) * 100)}%</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-sm mb-2">Comparison 2</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Working:</span>
                    <span className="font-medium">{Math.round(comparison2Data.working)} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Away:</span>
                    <span className="font-medium">{Math.round(comparison2Data.away)} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ideal:</span>
                    <span className="font-medium">{Math.round(comparison2Data.ideal)} min</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#cd0447]">
                    <span>Productivity:</span>
                    <span>{Math.round((comparison2Data.working / (comparison2Data.working + comparison2Data.away + comparison2Data.ideal)) * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Comparison 1 */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comparison 1</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="comp1-from" className="text-sm">From Date & Time</Label>
                    <Input
                      id="comp1-from"
                      type="datetime-local"
                      value={comparison1From}
                      onChange={(e) => setComparison1From(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="comp1-to" className="text-sm">To Date & Time</Label>
                    <Input
                      id="comp1-to"
                      type="datetime-local"
                      value={comparison1To}
                      onChange={(e) => setComparison1To(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => handleComparisonSubmit(1)}
                  className="w-full bg-[#cd0447] hover:bg-[#cd0447]/90"
                >
                  Load Comparison 1
                </Button>
              </CardContent>
            </Card>
            {renderPieChart(comparison1Data, "Comparison 1 Results", comparison1From, comparison1To)}
          </div>

          {/* Comparison 2 */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comparison 2</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="comp2-from" className="text-sm">From Date & Time</Label>
                    <Input
                      id="comp2-from"
                      type="datetime-local"
                      value={comparison2From}
                      onChange={(e) => setComparison2From(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="comp2-to" className="text-sm">To Date & Time</Label>
                    <Input
                      id="comp2-to"
                      type="datetime-local"
                      value={comparison2To}
                      onChange={(e) => setComparison2To(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => handleComparisonSubmit(2)}
                  className="w-full bg-[#cd0447] hover:bg-[#cd0447]/90"
                >
                  Load Comparison 2
                </Button>
              </CardContent>
            </Card>
            {renderPieChart(comparison2Data, "Comparison 2 Results", comparison2From, comparison2To)}
          </div>
        </div>
        {renderProductivityComparisonGraph()}
      </div>
    );
  };

  const renderSearchView = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search AI Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Search functionality will be implemented here. You can search by:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Camera ID</li>
              <li>Date range</li>
              <li>Productivity score range</li>
              <li>Location</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Camera Dropdown in Top Left */}
            <div className="flex justify-start">
              {renderCameraDropdown()}
            </div>

            {/* Navbar when camera selected */}
            {selectedCamera && renderNavbar()}

            {/* Camera Info if toggled */}
            {renderCameraInfo()}

            {/* Main Content */}
            {selectedCamera ? (
              viewMode === "main" ? (
                <div className="space-y-6">
                  {/* First Grid: Video and Realtime Data */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <Card>
                        <CardHeader>
                          <CardTitle>Camera Stream</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CameraStream
                            streamUrl={selectedCamera.httpUrl || selectedCamera.url}
                            cameraName={selectedCamera.name}
                            isOnline={selectedCamera.status === "Online"}
                            localIp={null}
                            useImgTag={(selectedCamera.httpUrl || selectedCamera.url).includes('/stream?camId=')}
                          />
                        </CardContent>
                      </Card>
                    </div>
                    <div>
                      {renderRealtimeData()}
                    </div>
                  </div>

                  {/* Second Grid: Productivity Graph */}
                  <div>
                    {renderGraphView()}
                  </div>
                </div>
              ) : (
                renderCompareView()
              )
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-48">
                  <p className="text-muted-foreground">Please select a camera to view AI reports.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AIReport;
