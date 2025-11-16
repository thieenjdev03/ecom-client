"use client";

import LandingPageLayout from "src/layouts/landing-page";

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return <LandingPageLayout>{children}</LandingPageLayout>;
}

