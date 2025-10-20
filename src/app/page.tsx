import { LandingGuard } from "src/auth/guard";

import { LandingPageView } from "src/sections/landing-page/view";

// ----------------------------------------------------------------------

export const metadata = {
  title: "E-Commerce",
};

export default function HomePage() {
  return (
    <LandingGuard>
      <LandingPageView />
    </LandingGuard>
  );
}
