import React, { useState, useEffect, createContext, useContext } from "react";
import { X, CheckCircle, AlertCircle, Info, XCircle } from "lucide-react";

// Toast types
export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useCustomToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useCustomToast must be used within a ToastProvider");
  }
  return context;
};

// Toast Provider Component
export const CustomToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto remove toast after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <CustomToastContainer />
    </ToastContext.Provider>
  );
};

// Toast Container Component
const CustomToastContainer: React.FC = () => {
  const { toasts, removeToast } = useCustomToast();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((toast) => (
        <CustomToast
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

// Individual Toast Component
const CustomToast: React.FC<{ toast: Toast; onClose: () => void }> = ({
  toast,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getTextColor = () => {
    switch (toast.type) {
      case "success":
        return "text-green-800";
      case "error":
        return "text-red-800";
      case "warning":
        return "text-yellow-800";
      case "info":
        return "text-blue-800";
      default:
        return "text-gray-800";
    }
  };

  return (
    <div
      className={`
        ${getBackgroundColor()}
        ${getTextColor()}
        border rounded-lg shadow-lg p-4 min-w-[320px] max-w-[400px]
        transform transition-all duration-300 ease-in-out
        ${
          isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }
      `}
      style={{
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-semibold leading-5">{toast.title}</h4>
              {toast.message && (
                <p className="mt-1 text-sm leading-4 opacity-90">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 ml-3 p-1 rounded-md hover:bg-black/10 transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for easy toast usage
export const useToast = () => {
  const { addToast } = useCustomToast();

  return {
    success: (title: string, message?: string, duration?: number) =>
      addToast({ type: "success", title, message: message || "", duration }),
    error: (title: string, message?: string, duration?: number) =>
      addToast({ type: "error", title, message: message || "", duration }),
    warning: (title: string, message?: string, duration?: number) =>
      addToast({ type: "warning", title, message: message || "", duration }),
    info: (title: string, message?: string, duration?: number) =>
      addToast({ type: "info", title, message: message || "", duration }),
  };
};
