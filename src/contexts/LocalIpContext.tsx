import React, { createContext, useContext, useEffect, useState } from "react";
import { getProfile } from "../services/profileService";

const LocalIpContext = createContext<string | null>(null);

export const useLocalIp = () => useContext(LocalIpContext);

export const LocalIpProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [localIp, setLocalIp] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated before calling getProfile
    const token = localStorage.getItem("token");

    if (!token) {
      // No token means user is not authenticated, set localIp to null
      setLocalIp(null);
      return;
    }

    getProfile()
      .then((profile) => {
        if (profile) {
          setLocalIp(profile?.subdomain?.ipAddress || null);
        } else {
          // Profile is null, user might not be authenticated
          setLocalIp(null);
        }
      })
      .catch((error) => {
        console.warn("Failed to fetch profile for local IP:", error);
        setLocalIp(null);
      });
  }, []);

  return (
    <LocalIpContext.Provider value={localIp}>
      {children}
    </LocalIpContext.Provider>
  );
};
