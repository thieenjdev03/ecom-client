"use client";

import { useState, useEffect, useCallback } from "react";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { SplashScreen } from "src/components/loading-screen";

import { useAuthContext } from "../hooks";

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function LandingGuard({ children }: Props) {
  const { loading } = useAuthContext();

  return <>{loading ? <SplashScreen /> : <Container>{children}</Container>}</>;
}

// ----------------------------------------------------------------------

function Container({ children }: Props) {
  const router = useRouter();

  const { authenticated, user } = useAuthContext();

  const [checked, setChecked] = useState(false);

  const check = useCallback(() => {
    if (authenticated) {
      // Check if this is a development auto-login (localStorage token)
      const localToken = localStorage.getItem("accessToken");
      const isDevelopmentAutoLogin = localToken && window.location.hostname === 'localhost';
      
      if (isDevelopmentAutoLogin) {
        // For development, allow access to landing page even with auto-login
        // You can remove this check if you want to always redirect authenticated users
        console.log("Development mode: Auto-login detected, allowing landing page access");
        setChecked(true);
        return;
      }
      
      // Only redirect admin users to dashboard
      if (user?.role === "admin") {
        router.replace(paths.dashboard.root);
      } else {
        // Allow non-admin users (customers) to access landing page
        setChecked(true);
      }
    } else {
      setChecked(true);
    }
  }, [authenticated, user, router]);

  useEffect(() => {
    check();
  }, [check]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}
