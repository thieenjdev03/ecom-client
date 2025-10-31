import { useEffect, useState } from "react";

import { _mock } from "src/_mock";

import { useAuthContext } from "src/auth/hooks";

// ----------------------------------------------------------------------

export function useMockedUser() {
  const { user: authUser } = useAuthContext();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Try to get user from sessionStorage first
    try {
      const sessionUser = sessionStorage.getItem("user");
      if (sessionUser) {
        const parsedUser = JSON.parse(sessionUser);
        
        // Extract first address if available
        const firstAddress = parsedUser.addresses?.[0] || {};
        
        // Transform API user data to UI format
        setUser({
          id: parsedUser.id,
          displayName: parsedUser.profile || parsedUser.email?.split("@")[0] || "User",
          email: parsedUser.email,
          phoneNumber: parsedUser.phoneNumber,
          photoURL: _mock.image.avatar(24),
          country: firstAddress.country || "",
          address: firstAddress.address || "",
          state: firstAddress.state || "",
          city: firstAddress.city || "",
          zipCode: firstAddress.zipCode || "",
          about: "",
          role: parsedUser.role?.toLowerCase() || "user",
          isPublic: true,
        });
      } else if (authUser) {
        // Fallback to AuthContext user
        setUser(authUser);
      }
    } catch (error) {
      console.error("Error parsing user from session:", error);
      if (authUser) {
        setUser(authUser);
      }
    }
  }, [authUser]);

  return { user };
}
