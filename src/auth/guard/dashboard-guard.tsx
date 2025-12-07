"use client";

import { useState, useEffect, useCallback } from "react";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { SplashScreen } from "src/components/loading-screen";

import { useAuthContext } from "../hooks";

// ----------------------------------------------------------------------

const loginPaths: Record<string, string> = {
  jwt: paths.auth.jwt.login,
  auth0: paths.auth.auth0.login,
  amplify: paths.auth.amplify.login,
  firebase: paths.auth.firebase.login,
  supabase: paths.auth.supabase.login,
};

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function DashboardGuard({ children }: Props) {
  const { loading } = useAuthContext();

  return <>{loading ? <SplashScreen /> : <Container>{children}</Container>}</>;
}

// ----------------------------------------------------------------------

function Container({ children }: Props) {
  const router = useRouter();

  const { authenticated, method, user } = useAuthContext();
  console.log('user', user);
  const [checked, setChecked] = useState(false);

  const check = useCallback(() => {
    if (!authenticated) {
      // Redirect to login if not authenticated
      const searchParams = new URLSearchParams({
        returnTo: window.location.pathname,
      }).toString();

      const loginPath = loginPaths[method];

      const href = `${loginPath}?${searchParams}`;

      router.replace(href);
    } else if (user?.role === "admin") {
      // Only allow admin role to access dashboard
      setChecked(true);
    } else {
      // For user role and any other roles, redirect to landing page
      router.replace("/");
    }
  }, [authenticated, method, user, router]);

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}

