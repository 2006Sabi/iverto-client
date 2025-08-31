import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useGetProfileQuery } from "@/store/api/authApi";
import {
  setUser,
  clearAuthData,
  setProfileChecked,
} from "@/store/slices/authSlice";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, profileChecked, isLoading, user } = useAppSelector(
    (state) => state.auth
  );
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Only fetch profile if authenticated and not yet checked
  const {
    data: profileData,
    error: profileError,
    isLoading: profileLoading,
  } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated || profileChecked,
  });

  useEffect(() => {
    if (isAuthenticated && !profileChecked && !profileLoading) {
      if (profileError) {
        // Profile check failed, clear auth data and redirect to login
        dispatch(clearAuthData());
        setShouldRedirect(true);
      } else if (profileData?.data) {
        // Profile check successful, update user data
        dispatch(setUser(profileData.data));
        dispatch(setProfileChecked(true));
      }
    }
  }, [
    isAuthenticated,
    profileChecked,
    profileLoading,
    profileError,
    profileData,
    dispatch,
  ]);

  // Handle redirects in a separate useEffect
  useEffect(() => {
    if (!isAuthenticated) {
      setShouldRedirect(true);
    } else if (profileChecked && user && user.isApproved === false) {
      navigate("/pending-registration");
    }
  }, [isAuthenticated, profileChecked, user, navigate]);

  // Handle navigation
  useEffect(() => {
    if (shouldRedirect) {
      navigate("/login");
    }
  }, [shouldRedirect, navigate]);

  // All checks passed, render children
  return <>{children}</>;
};
