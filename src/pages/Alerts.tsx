import { useEffect, useMemo, useState } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AnomalyAlerts } from "@/components/AnomalyAlerts";
import { useLocation } from "react-router-dom";
import { useGetAnomalyGraphDataQuery } from "@/store/api/anomalyApi";
import GanttChart from "@/components/GanttChart";

const Alerts = () => {
  const location = useLocation();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Fetch comprehensive anomaly graph data from API
  const { data: comprehensiveGraphData, isLoading: graphLoading } =
    useGetAnomalyGraphDataQuery();

  // Set selected date from navigation state
  useEffect(() => {
    if (location.state && location.state.selectedDate) {
      setSelectedDate(location.state.selectedDate);
    }
  }, [location.state]);

  // Generate camera tasks from comprehensive data
  const cameraTasks = useMemo(() => {
    if (!comprehensiveGraphData?.graphData) return {};

    const tasks: {
      [date: string]: Array<{
        camera: string;
        start: string;
        end: string;
        type: string;
        status: string;
      }>;
    } = {};

    Object.entries(comprehensiveGraphData.graphData).forEach(
      ([date, entry]) => {
        if (entry.anomalies.length > 0) {
          tasks[date] = entry.anomalies.map((anomaly) => ({
            camera: anomaly.camera.name,
            start: `${date} ${new Date(anomaly.timestamp).toLocaleTimeString(
              "en-US",
              {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
              }
            )}`,
            end: `${date} ${new Date(
              new Date(anomaly.timestamp).getTime() +
                parseInt(anomaly.duration.split(":")[0]) * 60 * 60 * 1000 +
                parseInt(anomaly.duration.split(":")[1]) * 60 * 1000
            ).toLocaleTimeString("en-US", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            })}`,
            type: anomaly.type,
            status: anomaly.status,
          }));
        }
      }
    );

    return tasks;
  }, [comprehensiveGraphData]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/20">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <main className="flex-1 overflow-auto p-4 sm:p-8">
            <div className="space-y-6">
              {/* Gantt Chart Section */}
              <div className="space-y-4">
                {selectedDate && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing timeline for: {selectedDate.split("-").reverse().join("-")}
                    </div>
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                    >
                      Clear Selection
                    </button>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <div className="min-w-[600px] sm:min-w-[800px] lg:min-w-[900px]">
                    <GanttChart
                      selectedDate={selectedDate}
                      cameraTasks={cameraTasks}
                      onDateSelect={setSelectedDate}
                    />
                  </div>
                </div>
              </div>
              
              {/* Anomaly Alerts Section */}
              <AnomalyAlerts />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Alerts;
