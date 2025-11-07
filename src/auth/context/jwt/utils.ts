// ----------------------------------------------------------------------

// Generate a mock JWT access token for local dev
export function generateMockAccessToken() {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: "local-dev",
    name: "Local Dev",
    email: "local@dev.com",
    iat: now,
    exp: now + 3 * 24 * 60 * 60, // 3 days
  };
  function base64url(source: string) {
    return btoa(source)
      .replace(/=+$/, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  }
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  // Signature is not validated in local dev, so just use a dummy string
  return `${encodedHeader}.${encodedPayload}.mock-signature`;
}
import { paths } from "src/routes/paths";

import axios from "src/utils/axios";

// ----------------------------------------------------------------------

function jwtDecode(token: string) {
  console.log("Decoding token:", token); // Debugging line
  const base64Url = token.split(".")[1];
  const base64 = base64Url?.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join(""),
  );

  return JSON.parse(jsonPayload);
}

// ----------------------------------------------------------------------

export const isValidToken = (accessToken: string) => {
  if (!accessToken) {
    return false;
  }

  const decoded = jwtDecode(accessToken);

  const currentTime = Date.now() / 1000;

  return decoded.exp > currentTime;
};

// ----------------------------------------------------------------------

export const tokenExpired = (exp: number) => {
  // eslint-disable-next-line prefer-const
  let expiredTimer;

  const currentTime = Date.now();

  // Test token expires after 10s
  // const timeLeft = currentTime + 10000 - currentTime; // ~10s
  const timeLeft = exp * 1000 - currentTime;

  clearTimeout(expiredTimer);

  expiredTimer = setTimeout(() => {
    alert("Token expired");

    sessionStorage.removeItem("accessToken");

    window.location.href = paths.auth.jwt.login;
  }, timeLeft);
};

// ----------------------------------------------------------------------

export const setSession = (accessToken: string | null) => {
  if (accessToken) {
    sessionStorage.setItem("accessToken", accessToken);

    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    // This function below will handle when token is expired
    // const { exp } = jwtDecode(accessToken); 
    // ~3 days by minimals server
    // tokenExpired(exp);
  } else {
    sessionStorage.removeItem("accessToken");

    delete axios.defaults.headers.common.Authorization;
  }
};
