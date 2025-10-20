
import { AuthGuard } from "src/auth/guard";

import LandingPageLayout from "src/layouts/landing-page";

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <AuthGuard>
      <LandingPageLayout>{children}</LandingPageLayout>
    </AuthGuard>
  );
}
