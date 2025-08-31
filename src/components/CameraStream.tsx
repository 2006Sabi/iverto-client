import { useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";

interface CameraStreamProps {
  streamUrl: string;
  cameraName: string;
  isOnline: boolean;
  localIp: string | null;
  useImgTag?: boolean; // New prop to force img tag usage
}

export const CameraStream = ({
  streamUrl,
  cameraName,
  isOnline,
  localIp,
  useImgTag = false,
}: CameraStreamProps) => {
  const [streamError, setStreamError] = useState(false);
  const [useIframe, setUseIframe] = useState(false);

  // Determine if we should use img tag based on URL pattern or explicit prop
  const shouldUseImgTag = useImgTag || streamUrl.includes('/stream?camId=');

  if (!isOnline) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
        <WifiOff className="h-8 w-8 mb-2" />
        <span>Camera Offline</span>
      </div>
    );
  }

  // For backend streams (img tag), don't require localIp
  if (!shouldUseImgTag && (!localIp || !streamUrl)) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
        <RefreshCw className="h-8 w-8 mb-2 animate-spin" />
        <span>Loading stream...</span>
      </div>
    );
  }

  // For img tag streams, only require streamUrl
  if (shouldUseImgTag && !streamUrl) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
        <RefreshCw className="h-8 w-8 mb-2 animate-spin" />
        <span>Loading stream...</span>
      </div>
    );
  }

  // If stream load fails, display error
  if (streamError) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
        <img
          src="/placeholder.svg"
          alt="Stream failed"
          className="w-16 h-16 mb-2 opacity-50"
        />
        <span>Stream unavailable</span>
      </div>
    );
  }

  // Use img tag for MJPEG streams or when explicitly requested
  if (shouldUseImgTag) {
    return (
      <img
        src={streamUrl}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        alt={`Live stream - ${cameraName}`}
        onError={() => setStreamError(true)}
        style={{ minHeight: '200px' }}
      />
    );
  }

  // Render <video> by default, fallback to <iframe> if direct video fails
  return !useIframe ? (
    <video
      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      autoPlay
      muted
      playsInline
      loop
      controls
      onError={() => {
        setStreamError(false); // Stay ready for fallback
        setUseIframe(true); // Switch to iframe fallback
      }}
    >
      <source src={streamUrl} type="application/x-mpegURL" />
      <source src={streamUrl} type="video/mp4" />
      <source src={streamUrl} type="video/webm" />
      {/* Multiple sources for compatibility */}
      Your browser does not support the video tag.
    </video>
  ) : (
    <iframe
      src={streamUrl}
      className="w-full h-full border-0"
      allowFullScreen
      onError={() => setStreamError(true)}
      title={`Live stream - ${cameraName}`}
    />
  );
};
