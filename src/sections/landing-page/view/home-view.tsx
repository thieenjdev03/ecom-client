"use client";

import { useScroll } from "framer-motion";

import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

import MainLayout from "src/layouts/main";
import Footer from "src/layouts/main/footer";

import ScrollProgress from "src/components/scroll-progress";

import LandingHero from "../landing-hero";

import HomeProductShowcase from "../home-product-showcase";
import HomeContactForm from "../home-contact-form";

// ----------------------------------------------------------------------

type StyledPolygonProps = {
  anchor?: "top" | "bottom";
};

const StyledPolygon = styled("div")<StyledPolygonProps>(
  ({ anchor = "top", theme }) => ({
    left: 0,
    zIndex: 9,
    height: 80,
    width: "100%",
    position: "absolute",
    clipPath: "polygon(0% 0%, 100% 100%, 0% 100%)",
    backgroundColor: theme.palette.background.default,
    display: "block",
    lineHeight: 0,
    ...(anchor === "top" && {
      top: -1,
      transform: "scale(-1, -1)",
    }),
    ...(anchor === "bottom" && {
      bottom: -1,
      backgroundColor: theme.palette.grey[900],
    }),
  }),
);

// ----------------------------------------------------------------------

export default function LandingPageView() {
  const { scrollYProgress } = useScroll();

  return (
    <MainLayout>
      <ScrollProgress scrollYProgress={scrollYProgress} />
      <Box
        sx={{
          height: "100vh",
          overflowY: "auto",
          scrollSnapType: "y mandatory",
          scrollBehavior: "smooth",
        }}
      >
        <LandingHero />
      </Box>
      <Box
        sx={{
          scrollSnapAlign: "start",
          position: "relative",
          bgcolor: "background.default",
        }}
      >
        <HomeProductShowcase priceBottom={true} title="New Arrivals"/>
      </Box>
      <Box
        sx={{
          scrollSnapAlign: "start",
          position: "relative",
          bgcolor: "background.default",
        }}
      >
        <HomeProductShowcase priceBottom={true} showAddToCart title="Best Sellers"/>
      </Box>
      <Box
        sx={{
          scrollSnapAlign: "start",
          position: "relative",
          bgcolor: "background.default",
        }}
      >
        <HomeContactForm />
      </Box>
    </MainLayout>
  );
}
