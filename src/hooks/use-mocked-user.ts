import { useEffect, useState } from "react";

import { _mock } from "src/_mock";

import { useAuthContext } from "src/auth/hooks";
import { IUserAddress } from "src/api/user";

// ----------------------------------------------------------------------

// Helper function to format full address from API address fields
function formatAddressFromAPI(address: IUserAddress): string {
  const parts = [
    address.streetLine1,
    address.streetLine2,
    address.ward,
    address.district,
    address.province,
  ].filter(Boolean);
  return parts.join(", ");
}

// Helper function to map country code to country name
function mapCountryCodeToName(countryCode?: string): string {
  const countryMap: Record<string, string> = {
    VN: "Vietnam",
    US: "United States",
    GB: "United Kingdom",
    CA: "Canada",
    AU: "Australia",
  };
  return countryCode ? countryMap[countryCode] || countryCode : "";
}

export function useMockedUser() {
  const { user: authUser } = useAuthContext();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Try to get user from sessionStorage first
    try {
      const sessionUser = sessionStorage.getItem("user");
      if (sessionUser) {
        const parsedUser = JSON.parse(sessionUser);
        
        // Get default address (isDefault: true) or first address
        const addresses = parsedUser.addresses || [];
        const defaultAddress = addresses.find((addr: IUserAddress) => addr.isDefault) || addresses[0] || {};
        
        // Format full address string
        const fullAddress = formatAddressFromAPI(defaultAddress);
        
        // Transform API user data to UI format
        setUser({
          id: parsedUser.id,
          displayName: parsedUser.profile || `${parsedUser.firstName || ""} ${parsedUser.lastName || ""}`.trim() || parsedUser.email?.split("@")[0] || "User",
          email: parsedUser.email,
          phoneNumber: parsedUser.phoneNumber,
          photoURL: _mock.image.avatar(24),
          country: mapCountryCodeToName(defaultAddress.countryCode) || parsedUser.country || "",
          address: fullAddress,
          state: defaultAddress.province || "",
          city: defaultAddress.district || "",
          zipCode: defaultAddress.postalCode || "",
          about: "",
          role: parsedUser.role?.toLowerCase() || "user",
          isPublic: true,
          // Store all addresses for display
          addresses: parsedUser.addresses || [],
          marketingOptIn: Boolean(parsedUser.marketingOptIn),
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
