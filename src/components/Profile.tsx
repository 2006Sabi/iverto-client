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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Spinner size="lg" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (profileError || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Registration Pending</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Alert variant="warning">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-4">
      <div className="w-full max-w-5xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-2 sm:mb-0">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Profile
          </h1>
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-red-600 hover:text-red-700 mt-2 sm:mt-0"
          >
            {isLoggingOut ? (
              <Spinner size="sm" />
            ) : (
              <LogOut className="h-4 w-4 mr-2" />
            )}
            Logout
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <div className="p-3 bg-muted rounded-md">{user.name}</div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="p-3 bg-muted rounded-md flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {user.email}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <div className="p-3 bg-muted rounded-md flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      {user.companyName}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Role</Label>
                    <div className="p-3 bg-muted rounded-md flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <Badge
                        variant={
                          user.role === "admin" ? "default" : "secondary"
                        }
                      >
                        {user.role === "admin" ? "Administrator" : "User"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Member Since</Label>
                    <div className="p-3 bg-muted rounded-md flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Stats */}
          <div className="space-y-6">
            <Card className="modern-card">
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge
                    variant="default"
                    className="bg-green-500/10 text-green-600"
                  >
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Last Login
                  </span>
                  <span className="text-sm">Today</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Account Type
                  </span>
                  <span className="text-sm capitalize">{user.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Credits</span>
                  <span className="text-sm font-semibold">
                    {typeof user.credits === "number" ? user.credits : 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* API Key Feature */}
            <Card className="">
              <CardHeader>
                <CardTitle>API Key</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">
                    Your API Key
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="flex items-center justify-center h-8 w-8 p-0"
                          onClick={() => setShowApiKey((v) => !v)}
                          aria-label={
                            showApiKey ? "Hide API Key" : "Show API Key"
                          }
                          disabled={!user.apiKey}
                        >
                          {showApiKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
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
                          className="flex items-center justify-center h-8 w-8 p-0"
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
                            className="h-4 w-4"
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
                    <span
                      className="font-mono text-xs bg-muted px-2 py-1 rounded max-w-[120px] sm:max-w-xs truncate select-none border"
                      title={showApiKey ? user.apiKey || "" : "Hidden"}
                      style={{ letterSpacing: "2px" }}
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
                <div className="text-xs mt-1 ml-1">
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
