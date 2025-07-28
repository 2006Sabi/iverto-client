import React, { createContext, useContext, useEffect, useState } from "react";
import { getProfile } from "../services/profileService";

const LocalIpContext = createContext<string | null>(null);

export const useLocalIp = () => useContext(LocalIpContext);

export const LocalIpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [localIp, setLocalIp] = useState<string | null>(null);

  useEffect(() => {
    getProfile()
      .then((profile) => setLocalIp(profile?.subdomain?.ipAddress || null))
      .catch(() => setLocalIp(null));
  }, []);

  return (
    <LocalIpContext.Provider value={localIp}>
      {children}
    </LocalIpContext.Provider>
  );
}; 