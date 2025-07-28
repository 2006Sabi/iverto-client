import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Camera } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface AnomalyItem {
  type: string;
  time: string;
  camera: string;
  id?: string;
}

interface RecentAnomalies {
  today: AnomalyItem[];
  yesterday: AnomalyItem[];
  lastWeek: AnomalyItem[];
  lastMonth: AnomalyItem[];
}

interface RecentAnomaliesListProps {
  anomalies: RecentAnomalies;
}

const RecentAnomaliesList: React.FC<RecentAnomaliesListProps> = ({
  anomalies,
}) => {
  const isMobile = useIsMobile();

  const getAnomalyColor = (type: string) => {
    switch (type) {
      case "Intrusion":
        return "bg-red-100 text-red-700 border-red-200";
      case "Loitering":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Fire":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Vandalism":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "Motion":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const renderAnomalyGroup = (
    title: string,
    items: AnomalyItem[],
    icon: React.ReactNode
  ) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-4 sm:mb-6 last:mb-0">
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          {icon}
          <h3
            className={`font-semibold text-gray-700 ${
              isMobile ? "text-xs" : "text-sm"
            }`}
          >
            {title}
          </h3>
          <Badge
            variant="secondary"
            className={`${isMobile ? "text-xs px-1 py-0.5" : "text-xs"}`}
          >
            {items.length}
          </Badge>
        </div>
        <div className="space-y-1.5 sm:space-y-2">
          {items.map((anomaly, index) => (
            <div
              key={anomaly.id || index}
              className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200/50"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <Badge
                  className={`${
                    isMobile ? "text-xs px-1.5 py-0.5" : "text-xs px-2 py-1"
                  } ${getAnomalyColor(anomaly.type)}`}
                >
                  {anomaly.type}
                </Badge>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                    <Camera
                      className={`${
                        isMobile ? "h-2.5 w-2.5" : "h-3 w-3"
                      } flex-shrink-0`}
                    />
                    <span className="truncate">{anomaly.camera}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 ml-1 sm:ml-2">
                <Clock className={`${isMobile ? "h-2.5 w-2.5" : "h-3 w-3"}`} />
                <span className={isMobile ? "text-xs" : "text-xs"}>
                  {anomaly.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const totalAnomalies = Object.values(anomalies).reduce(
    (sum, items) => sum + items.length,
    0
  );

  return (
    <Card className="modern-card bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6 pb-2 sm:pb-3 md:pb-4">
        <CardTitle
          className={`flex items-center gap-2 sm:gap-3 font-semibold ${
            isMobile ? "text-sm" : "text-lg"
          }`}
        >
          <div className={`p-1.5 sm:p-2 rounded-xl bg-purple-100`}>
            <AlertTriangle
              className={`${isMobile ? "h-4 w-4" : "h-6 w-6"} text-purple-700`}
            />
          </div>
          <span className={isMobile ? "text-sm" : "text-lg"}>
            Recent Anomalies
          </span>
          <Badge
            variant="secondary"
            className={`ml-auto rounded-md ${isMobile ? "text-xs px-1.5 py-0.5" : ""}`}
          >
            {totalAnomalies}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
        {totalAnomalies === 0 ? (
          <div
            className={`text-center py-6 sm:py-8 text-gray-500 ${
              isMobile ? "text-sm" : "text-base"
            }`}
          >
            No recent anomalies detected
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4 max-h-64 sm:max-h-80 md:max-h-96 overflow-y-auto">
            {renderAnomalyGroup(
              "Today",
              anomalies.today,
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full" />
            )}
            {renderAnomalyGroup(
              "Yesterday",
              anomalies.yesterday,
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-full" />
            )}
            {renderAnomalyGroup(
              "Last Week",
              anomalies.lastWeek,
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-500 rounded-full" />
            )}
            {renderAnomalyGroup(
              "Last Month",
              anomalies.lastMonth,
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gray-500 rounded-full" />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentAnomaliesList;
