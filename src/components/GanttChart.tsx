import React, { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

interface CameraTask {
  camera: string;
  start: string;
  end: string;
  type?: string;
  status?: string;
  anomalyId?: string;
  anomalyData?: any;
}

interface CameraTasks {
  [date: string]: CameraTask[];
}

interface GanttChartProps {
  selectedDate: string | null;
  cameraTasks: CameraTasks;
  onDateSelect?: (date: string) => void;
  onAnomalyClick?: (anomalyData: any) => void;
}

const GanttChart: React.FC<GanttChartProps> = ({
  selectedDate,
  cameraTasks,
  onDateSelect,
  onAnomalyClick,
}) => {
  const isMobile = useIsMobile();
  const chartRef = useRef<HTMLDivElement>(null);

  // Get tasks for selected date
  const tasksForDate = selectedDate ? cameraTasks[selectedDate] || [] : [];

  // Get all unique camera names for Y-axis
  const allCameras = Array.from(
    new Set(
      Object.values(cameraTasks)
        .flat()
        .map((task) => task.camera)
    )
  ).sort();

  // Generate 15-minute time slots for X-axis (96 slots for 24 hours)
  const timeSlots = Array.from({ length: 96 }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  });

  // Generate hour labels for display (only show every 4th slot - hourly)
  const hourLabels = Array.from(
    { length: 24 },
    (_, i) => `${i.toString().padStart(2, "0")}:00`
  );

  // Helper to parse time from "HH:MM" format to minutes
  const parseTimeToMinutes = (timeStr: string) => {
    const [hour, minute] = timeStr.split(":").map(Number);
    return hour * 60 + minute;
  };

  // Helper to parse "HH:MM" from "DD-MM-YYYY HH:MM"
  const parseDateTime = (dateTime: string) => {
    const timePart = dateTime.split(" ")[1];
    return parseTimeToMinutes(timePart);
  };

  const getTaskPosition = (startTime: string, endTime: string) => {
    // Handle both "HH:MM" and "DD-MM-YYYY HH:MM" formats
    const start = startTime.includes(" ")
      ? parseDateTime(startTime)
      : parseTimeToMinutes(startTime);
    const end = endTime.includes(" ")
      ? parseDateTime(endTime)
      : parseTimeToMinutes(endTime);

    // Convert to percentage of 24 hours (1440 minutes)
    const startPosition = Math.max(0, start);
    const endPosition = Math.min(1440, end);
    const width = Math.max(0, endPosition - startPosition);

    return {
      left: `${(startPosition / 1440) * 100}%`,
      width: `${(width / 1440) * 100}%`,
    };
  };

  const getTaskColor = (type?: string) => {
    switch (type) {
      case "Intrusion":
        return "bg-red-500";
      case "Loitering":
        return "bg-yellow-500";
      case "Fire":
        return "bg-orange-500";
      case "Vandalism":
        return "bg-purple-500";
      case "Suspicious Activity":
        return "bg-blue-500";
      default:
        return "bg-gray-400";
    }
  };

  // Helper function to format date from DD-MM-YYYY to readable format
  const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("-");
    return new Date(`${year}-${month}-${day}`).toLocaleDateString();
  };

  // Helper to format time for tooltip
  const formatTimeForTooltip = (timeStr: string) => {
    if (timeStr.includes(" ")) {
      // Format "DD-MM-YYYY HH:MM" to "HH:MM"
      return timeStr.split(" ")[1];
    }
    return timeStr;
  };

  // Helper to format full datetime for tooltip
  const formatFullDateTime = (dateTime: string) => {
    if (dateTime.includes(" ")) {
      // Format "DD-MM-YYYY HH:MM" to readable format
      const [datePart, timePart] = dateTime.split(" ");
      const [day, month, year] = datePart.split("-");
      const date = new Date(`${year}-${month}-${day}`);
      return `${date.toLocaleDateString()} at ${timePart}`;
    }
    return dateTime;
  };

  // Helper to calculate duration
  const calculateDuration = (startTime: string, endTime: string) => {
    const start = startTime.includes(" ")
      ? parseDateTime(startTime)
      : parseTimeToMinutes(startTime);
    const end = endTime.includes(" ")
      ? parseDateTime(endTime)
      : parseTimeToMinutes(endTime);

    const durationMinutes = end - start;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Helper to determine tooltip alignment based on anomaly bar position
  const getTooltipAlign = (leftPercent: number, widthPercent: number) => {
    if (leftPercent < 10) return "start"; // Near left edge
    if (leftPercent + widthPercent > 90) return "end"; // Near right edge
    return "center";
  };

  return (
    <TooltipProvider>
      <Card className="modern-card bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6 pb-2 sm:pb-3 md:pb-4">
          <CardTitle
            className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 font-semibold ${
              isMobile ? "text-sm" : "text-lg"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`p-1.5 sm:p-2 rounded-xl bg-blue-100`}>
                <svg
                  className={`${
                    isMobile ? "h-4 w-4" : "h-6 w-6"
                  } text-blue-700`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <span className={`${isMobile ? "text-sm" : "text-lg"}`}>
                Camera Activity Timeline (24-Hour View)
              </span>
            </div>
            {selectedDate && (
              <Badge
                variant="secondary"
                className={`${isMobile ? "text-xs px-1.5 py-0.5" : ""}`}
              >
                {formatDate(selectedDate)}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
          {!selectedDate ? (
            <div
              className={`text-center py-6 sm:py-8 text-gray-500 ${
                isMobile ? "text-sm" : "text-base"
              }`}
            >
              {onDateSelect ? (
                <div className="space-y-4">
                  <p>Select a date to view camera activity timeline</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {Object.keys(cameraTasks).slice(0, 7).map((date) => (
                      <button
                        key={date}
                        onClick={() => onDateSelect(date)}
                        className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm font-medium transition-colors"
                      >
                        {formatDate(date)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                "Click on a point in the chart above to view camera activity"
              )}
            </div>
          ) : tasksForDate.length === 0 ? (
            <div
              className={`text-center py-6 sm:py-8 text-gray-500 ${
                isMobile ? "text-sm" : "text-base"
              }`}
            >
              No camera activity on {formatDate(selectedDate)}
            </div>
          ) : (
            <div className="w-full overflow-hidden relative" ref={chartRef}>
              <div className="w-full relative overflow-visible">
                {/* Camera rows */}
                {allCameras.map((camera) => {
                  const cameraTasks = tasksForDate.filter(
                    (task) => task.camera === camera
                  );
                  return (
                    <div
                      key={camera}
                      className="flex items-center border-b border-gray-100 py-1 relative overflow-visible"
                    >
                      <div
                        className={`flex-shrink-0 font-medium text-gray-700 ${
                          isMobile ? "w-16 text-xs" : "w-24 text-sm"
                        }`}
                      >
                        {camera}
                      </div>
                      <div
                        className="flex-1 relative bg-gray-50 rounded overflow-visible"
                        style={{ height: isMobile ? "20px" : "24px" }}
                      >
                        {/* 15-minute background grid */}
                        {Array.from({ length: 96 }).map((_, i) => (
                          <div
                            key={i}
                            className={`absolute top-0 left-0 h-full ${
                              i % 4 === 0
                                ? "border-r border-gray-300"
                                : "border-r border-gray-100"
                            }`}
                            style={{
                              left: `${(i / 96) * 100}%`,
                              width: "0.01%",
                            }}
                          />
                        ))}
                        {cameraTasks.map((task, index) => {
                          const position = getTaskPosition(
                            task.start,
                            task.end
                          );
                          const startTime = formatTimeForTooltip(task.start);
                          const endTime = formatTimeForTooltip(task.end);
                          const duration = calculateDuration(
                            task.start,
                            task.end
                          );
                          const fullStartTime = formatFullDateTime(task.start);
                          const fullEndTime = formatFullDateTime(task.end);

                          // Calculate left and width in percent for alignment
                          const leftPercent = parseFloat(position.left);
                          const widthPercent = parseFloat(position.width);
                          const tooltipAlign = getTooltipAlign(
                            leftPercent,
                            widthPercent
                          );

                          return (
                            <Tooltip key={index}>
                              <TooltipTrigger asChild>
                                <div
                                  className={`absolute rounded-sm ${getTaskColor(
                                    task.type
                                  )} text-white flex items-center justify-center px-1 cursor-pointer hover:opacity-80 transition-opacity shadow-sm hover:scale-105 hover:shadow-md`}
                                  style={{
                                    left: position.left,
                                    width: position.width,
                                    minWidth: "4px",
                                    zIndex: 2,
                                    height: isMobile ? "12px" : "18px",
                                    top: isMobile ? "4px" : "3px",
                                    fontSize: isMobile ? "8px" : "10px",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onAnomalyClick && task.anomalyData) {
                                      onAnomalyClick(task.anomalyData);
                                    }
                                  }}
                                >
                                  {!isMobile && (task.type || "Activity")}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                align={tooltipAlign}
                                className="max-w-xs min-w-[220px] p-3 bg-gray-900 text-white border-gray-700 z-50"
                                sideOffset={8}
                                avoidCollisions={true}
                                collisionPadding={16}
                              >
                                <div className="space-y-2">
                                  <div className="font-semibold text-sm">
                                    {task.type || "Activity"} Detection
                                  </div>
                                  <div className="text-xs space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-gray-300">
                                        Camera:
                                      </span>
                                      <span className="font-medium">
                                        {task.camera}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-300">
                                        Started:
                                      </span>
                                      <span className="font-medium">
                                        {fullStartTime}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-300">
                                        Ended:
                                      </span>
                                      <span className="font-medium">
                                        {fullEndTime}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-300">
                                        Duration:
                                      </span>
                                      <span className="font-medium">
                                        {duration}
                                      </span>
                                    </div>
                                    {task.status && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-300">
                                          Status:
                                        </span>
                                        <span className="font-medium">
                                          {task.status}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {/* Legend */}
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                  <div
                    className={`flex flex-wrap gap-2 sm:gap-4 ${
                      isMobile ? "text-xs" : "text-xs"
                    }`}
                  >
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div
                        className={`${
                          isMobile ? "w-2 h-2" : "w-3 h-3"
                        } bg-red-500 rounded`}
                      ></div>
                      <span>Intrusion</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div
                        className={`${
                          isMobile ? "w-2 h-2" : "w-3 h-3"
                        } bg-yellow-500 rounded`}
                      ></div>
                      <span>Loitering</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div
                        className={`${
                          isMobile ? "w-2 h-2" : "w-3 h-3"
                        } bg-orange-500 rounded`}
                      ></div>
                      <span>Fire</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div
                        className={`${
                          isMobile ? "w-2 h-2" : "w-3 h-3"
                        } bg-purple-500 rounded`}
                      ></div>
                      <span>Vandalism</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div
                        className={`${
                          isMobile ? "w-2 h-2" : "w-3 h-3"
                        } bg-blue-500 rounded`}
                      ></div>
                      <span>Suspicious Activity</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div
                        className={`${
                          isMobile ? "w-2 h-2" : "w-3 h-3"
                        } bg-gray-400 rounded`}
                      ></div>
                      <span>Other</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default GanttChart;
