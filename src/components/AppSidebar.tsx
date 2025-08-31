import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Shield,
  Eye,
  AlertTriangle,
  User,
  Bell,
  LogOut,
  Wifi,
  WifiOff,
  Settings,
  Activity,
} from "lucide-react";
import { AiOutlineMenu } from "react-icons/ai";
import { useAppSelector } from "@/store/hooks";
import { useGetRecentAnomaliesQuery } from "@/store/api/anomalyApi";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnline } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);
  const { logout } = useAuth();
  const { state, toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();

  // Get alert count from recent anomalies
  const { data: recentAnomalies } = useGetRecentAnomaliesQuery(
    { limit: 10 },
    {
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );
  const alertCount = Array.isArray(recentAnomalies)
    ? recentAnomalies.filter((a) => a.status === "Active").length
    : 0;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Shield,
      path: "/dashboard",
    },
    {
      id: "cameras",
      label: "Cameras",
      icon: Eye,
      path: "/cameras",
    },
    {
      id: "alerts",
      label: "Alerts",
      icon: AlertTriangle,
      path: "/alerts",
      badge: alertCount > 0 ? alertCount : null,
    },
    {
      id: "ai-report",
      label: "AI Report",
      icon: Activity,
      path: "/ai-report",
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      path: "/profile",
    },
  ];

  const isActiveRoute = (path: string) => {
    if (path === "/dashboard" && location.pathname === "/") return true;
    return location.pathname === path;
  };

  return (
    <>
      {/* Show sidebar toggle button - always visible on mobile, only when collapsed on desktop */}
      {(isMobile || state === "collapsed") && (
        <button
          className="fixed top-4 left-4 z-50 cursor-pointer bg-white rounded-none shadow-lg overflow-hidden p-1 border border-gray-100 flex items-center justify-center w-9 h-9 md:w-7 md:h-7"
          onClick={toggleSidebar}
          aria-label="Open sidebar"
        >
          <AiOutlineMenu className="w-5 h-5 md:w-4 md:h-4 text-gray-700" />
        </button>
      )}
      <Sidebar className="h-full bg-gradient-to-b from-white via-gray-50/50 to-gray-100/30 border-r border-gray-200/60 shadow-lg min-w-[60px] w-[60px] sm:w-[220px] md:w-[260px] transition-all duration-300">
        <SidebarHeader className="p-2 sm:p-4 md:p-6 border-b border-gray-200/60 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Sidebar Trigger in Top Left */}
            <SidebarTrigger className="rounded-none hover:bg-gray-100 transition-colors p-2" />
            {/* Settings Button in Top Left */}
            <div
              className="flex items-center justify-center bg-white rounded-none shadow-lg overflow-hidden p-1 sm:p-2 border border-gray-100"
              style={{ width: "220px", height: "52px" }}
            >
              <img
                src="https://res.cloudinary.com/da1pmfwy2/image/upload/v1753163928/WhatsApp_Image_2025-07-22_at_11.28.03_ea308b94-removebg-preview_hk03de.png"
                alt="Iverto Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="p-2 sm:p-3 md:p-4 flex-1">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1 sm:space-y-2">
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <Button
                      onClick={() => handleNavigation(item.path)}
                      variant="ghost"
                      className={`w-full justify-start px-3 sm:px-4 py-3 sm:py-3 h-auto text-sm sm:text-sm font-medium transition-all duration-300 rounded-none group hover:shadow-md ${
                        isActiveRoute(item.path)
                          ? "bg-gradient-to-r from-[#cd0447] to-[#cd0447]/90 hover:from-[#cd0447] hover:to-[#cd0447]/90 text-white shadow-lg transform scale-[1.02]"
                          : "text-gray-700 hover:text-gray-900 hover:bg-white/80 hover:shadow-sm border border-transparent hover:border-gray-200/60"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3 sm:gap-3">
                          <div
                            className={`p-2 rounded-md sm:p-1.5 transition-all duration-300 ${
                              isActiveRoute(item.path)
                                ? "bg-white/20 text-white"
                                : "bg-gray-100 text-gray-600 group-hover:bg-[#cd0447]/10 group-hover:text-[#cd0447]"
                            }`}
                          >
                            <item.icon className="h-4 w-4 sm:h-4 sm:w-4" />
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="font-semibold truncate text-sm sm:text-sm">
                              {item.label}
                            </span>
                          </div>
                        </div>
                        {item.badge && (
                          <Badge
                            variant="destructive"
                            className="h-6 w-6 sm:h-6 sm:w-6 flex items-center justify-center text-xs p-0 rounded-md animate-pulse shadow-lg"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </Button>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-2 sm:p-3 md:p-4 border-t border-gray-200/60 bg-white/80 backdrop-blur-sm">
          <div className="space-y-2 sm:space-y-3">
            {/* Enhanced User Profile as Button */}
            <Button
              onClick={() => navigate("/profile")}
              variant="ghost"
              className="flex items-center gap-3 sm:gap-3 p-3 sm:p-3 rounded-none bg-gradient-to-r from-gray-50 to-gray-100/50 w-full justify-start cursor-pointer hover:from-gray-100 hover:to-gray-200/50 transition-all duration-300 border border-gray-200/60 hover:shadow-md group"
              style={{ boxShadow: "none" }}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-none bg-gradient-to-br from-[#cd0447] to-[#cd0447]/80 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <User className="h-5 w-5 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm sm:text-sm font-semibold text-gray-900 truncate group-hover:text-[#cd0447] transition-colors">
                  {user?.name || "Security Officer"}
                </div>
              </div>
            </Button>

            {/* Enhanced Logout Button */}
            <Button
              onClick={logout}
              variant="ghost"
              className="w-full justify-start px-3 sm:px-4 py-3 sm:py-3 text-sm sm:text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-none transition-all duration-300 border border-transparent hover:border-red-200 group"
            >
              <div className="p-2 sm:p-1.5 rounded-none bg-gray-100 text-gray-600 group-hover:bg-red-100 group-hover:text-red-600 transition-all duration-300">
                <LogOut className="h-4 w-4 sm:h-4 sm:w-4" />
              </div>
              <span className="ml-2 sm:ml-3 font-medium">Sign Out</span>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
};
