import { Loader2, Camera, Shield, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "./card";
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

// Basic spinner component
export const Spinner = ({
  size = "default",
  className,
}: {
  size?: "sm" | "default" | "lg";
  className?: string;
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />
  );
};

// Loading overlay for buttons
export const ButtonLoader = ({
  children,
  isLoading,
  ...props
}: {
  children: React.ReactNode;
  isLoading: boolean;
  [key: string]: any;
}) => {
  return (
    <div className="relative" {...props}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded">
          <Spinner size="sm" />
        </div>
      )}
      <div className={cn(isLoading && "opacity-50")}>{children}</div>
    </div>
  );
};

// Full page loading screen
export const PageLoader = ({
  message = "Loading...",
}: {
  message?: string;
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="relative">
          <Shield className="h-16 w-16 text-primary mx-auto animate-pulse" />
          <div className="absolute inset-0 border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Vigilant Vision
          </h2>
          <p className="text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
};

// Card skeleton for loading states
export const CardSkeleton = ({ className }: { className?: string }) => {
  return (
    <Card className={cn("modern-card", className)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[160px]" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Camera grid loading skeleton
export const CameraGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="modern-card overflow-hidden">
          <CardContent className="p-0">
            <div className="aspect-video bg-muted animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-4 w-32" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Stats loading skeleton
export const StatsGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="modern-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// List item skeleton
export const ListItemSkeleton = ({ count = 5 }: { count?: number }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/20 to-muted/10"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
};

// Error state component
export const ErrorState = ({
  title = "Something went wrong",
  message = "Please try again later",
  onRetry,
  icon: Icon = AlertTriangle,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  icon?: React.ComponentType<any>;
}) => {
  return (
    <div className="text-center py-12">
      <Icon className="h-12 w-12 text-destructive mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

// Empty state component
export const EmptyState = ({
  title = "No data available",
  message = "There are no items to display",
  action,
  icon: Icon = Camera,
}: {
  title?: string;
  message?: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<any>;
}) => {
  return (
    <div className="text-center py-12">
      <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{message}</p>
      {action}
    </div>
  );
};
