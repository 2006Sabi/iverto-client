import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGetProfileQuery, useLogoutMutation } from "@/store/api/authApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { addNotification } from "@/store/slices/uiSlice";
import { Spinner } from "@/components/ui/loading";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Shield, Mail, Calendar, Building } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

export const Profile = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  const {
    data: profileData,
    isLoading,
    error: profileError,
  } = useGetProfileQuery();
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  const user = profileData?.data;
  const token = useAppSelector((state) => state.auth.token);

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
      dispatch(logout());
      dispatch(
        addNotification({
          type: "success",
          title: "Logged Out",
          message: "You have been successfully logged out",
        })
      );
      navigate("/login");
    } catch (err) {
      dispatch(
        addNotification({
          type: "error",
          title: "Logout Failed",
          message: "Failed to logout properly",
        })
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Profile</h2>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profileError || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-sm sm:max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>
                Failed to load profile. Please try again.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show pending approval if not approved
  if (user.isApproved === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-sm sm:max-w-md">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Registration Pending
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Alert
              variant="default"
              className="border-yellow-200 bg-yellow-50 text-yellow-800"
            >
              <AlertDescription>
                Hey {user.name}, your registration is pending approval. Please
                wait for an admin to approve your account.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 lg:p-6 container-responsive">
      <div className="w-full max-w-6xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 lg:gap-6 mobile-optimized tablet-optimized desktop-optimized">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-responsive-lg">
            Profile
          </h1>
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-red-600 hover:text-red-700 w-full sm:w-auto text-sm sm:text-base mobile-button tablet-button desktop-button touch-target"
          >
            {isLoggingOut ? (
              <Spinner size="sm" />
            ) : (
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            )}
            Logout
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 responsive-grid">
          {/* Profile Card */}
          <div className="xl:col-span-2">
            <Card className="modern-card bg-white border border-gray-200 shadow-xl hover:shadow-2xl transition-shadow rounded-lg mobile-card tablet-card desktop-card">
              <CardHeader className="pb-4 sm:pb-6 card-header-enhanced">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl text-responsive-lg">
                  <User className="h-5 w-5 sm:h-6 sm:w-6" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 space-responsive-md">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Name and Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 responsive-grid">
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium text-responsive-sm">
                      Full Name
                    </Label>
                    <div className="p-3 sm:p-4 bg-muted text-sm sm:text-base text-responsive-base">
                      {user.name}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium text-responsive-sm">
                      Email Address
                    </Label>
                    <div className="p-3 sm:p-4 bg-muted flex items-center gap-2 text-sm sm:text-base text-responsive-base">
                      <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="break-all">{user.email}</span>
                    </div>
                  </div>
                </div>

                {/* Company and Role Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 responsive-grid">
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium text-responsive-sm">
                      Company Name
                    </Label>
                    <div className="p-3 sm:p-4 bg-muted flex items-center gap-2 text-sm sm:text-base text-responsive-base">
                      <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="break-all">{user.companyName}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium text-responsive-sm">
                      Role
                    </Label>
                    <div className="p-3 sm:p-4 bg-muted flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <Badge
                        variant={
                          user.role === "admin" ? "default" : "secondary"
                        }
                        className="text-xs sm:text-sm badge-responsive"
                      >
                        {user.role === "admin" ? "Administrator" : "User"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Member Since Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 responsive-grid">
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium text-responsive-sm">
                      Member Since
                    </Label>
                    <div className="p-3 sm:p-4 bg-muted flex items-center gap-2 text-sm sm:text-base text-responsive-base">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium text-responsive-sm">
                      Credits
                    </Label>
                    <div className="p-3 sm:p-4 bg-muted text-sm sm:text-base font-semibold text-responsive-base">
                      {typeof user.credits === "number" ? user.credits : 0}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Cards */}
          <div className="space-y-4 sm:space-y-6 space-responsive-md">
            {/* Account Status Card */}
            <Card className="modern-card bg-white border border-gray-200 shadow-xl hover:shadow-2xl transition-shadow rounded-lg mobile-card tablet-card desktop-card">
              <CardHeader className="pb-4 card-header-enhanced">
                <CardTitle className="text-base sm:text-lg lg:text-xl text-responsive-base">
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 space-responsive-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground text-responsive-xs">
                    Status
                  </span>
                  <Badge
                    variant="default"
                    className="bg-green-500/10 text-green-600 text-xs sm:text-sm badge-responsive"
                  >
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground text-responsive-xs">
                    Last Login
                  </span>
                  <span className="text-xs sm:text-sm text-responsive-xs">
                    Today
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground text-responsive-xs">
                    Account Type
                  </span>
                  <span className="text-xs sm:text-sm capitalize text-responsive-xs">
                    {user.role}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground text-responsive-xs">
                    Credits
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-responsive-xs">
                    {typeof user.credits === "number" ? user.credits : 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* API Key Card */}
            <Card className="bg-white border border-gray-200 shadow-xl hover:shadow-2xl transition-shadow mobile-card tablet-card desktop-card">
              <CardHeader className="pb-4 card-header-enhanced">
                <CardTitle className="text-base sm:text-lg lg:text-xl text-responsive-base">
                  API Key
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 space-responsive-sm">
                <div className="space-y-3">
                  <span className="text-xs sm:text-sm text-muted-foreground block text-responsive-xs">
                    Your API Key
                  </span>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 button-group-mobile">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 p-0 touch-target-small"
                            onClick={() => setShowApiKey((v) => !v)}
                            aria-label={
                              showApiKey ? "Hide API Key" : "Show API Key"
                            }
                            disabled={!user.apiKey}
                          >
                            {showApiKey ? (
                              <EyeOff className="h-4 w-4 icon-responsive-sm" />
                            ) : (
                              <Eye className="h-4 w-4 icon-responsive-sm" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {showApiKey ? "Hide API Key" : "Show API Key"}
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 p-0 touch-target-small"
                            onClick={() => {
                              if (user.apiKey) {
                                navigator.clipboard.writeText(user.apiKey);
                                dispatch(
                                  addNotification({
                                    type: "success",
                                    title: "Copied",
                                    message: "API Key copied to clipboard",
                                  })
                                );
                              }
                            }}
                            aria-label="Copy API Key"
                            disabled={!user.apiKey}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 icon-responsive-sm"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <rect
                                x="9"
                                y="9"
                                width="13"
                                height="13"
                                rx="2"
                                strokeWidth="2"
                                stroke="currentColor"
                              />
                              <rect
                                x="3"
                                y="3"
                                width="13"
                                height="13"
                                rx="2"
                                strokeWidth="2"
                                stroke="currentColor"
                              />
                            </svg>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy API Key</TooltipContent>
                      </Tooltip>
                    </div>
                    <span
                      className="font-mono text-xs sm:text-sm bg-muted px-2 py-1 flex-1 min-w-0 break-all text-responsive-xs"
                      title={showApiKey ? user.apiKey || "" : "Hidden"}
                      style={{ letterSpacing: "1px" }}
                      aria-label="API Key Value"
                    >
                      {user.apiKey
                        ? showApiKey
                          ? user.apiKey
                          : "•".repeat(Math.max(12, user.apiKey.length))
                        : "N/A"}
                    </span>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground text-responsive-xs">
                  Use this key to authenticate your requests to the Iverto API.
                  Keep it secret.
                </div>
                <hr className="my-3 opacity-50" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
