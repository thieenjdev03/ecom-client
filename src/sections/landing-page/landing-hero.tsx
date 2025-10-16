import { m, useScroll } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import { alpha, styled, useTheme } from "@mui/material/styles";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { useResponsive } from "src/hooks/use-responsive";

import { HEADER } from "src/layouts/config-layout";
import { bgBlur, bgGradient, textGradient } from "src/theme/css";

import { varFade, MotionContainer } from "src/components/animate";
import Carousel, { useCarousel, CarouselDots } from "src/components/carousel";

// ----------------------------------------------------------------------

const StyledRoot = styled("div")(({ theme }) => ({
  width: "100%",
  height: "100vh",
  position: "relative",
  [theme.breakpoints.up("md")]: {
    top: 0,
    left: 0,
    position: "fixed",
  },
}));

const StyledWrapper = styled("div")(({ theme }) => ({
  height: "100%",
  overflow: "hidden",
  position: "relative",
  [theme.breakpoints.up("md")]: {
    marginTop: HEADER.H_DESKTOP_OFFSET,
  },
}));

const StyledTextGradient = styled(m.h1)(({ theme }) => ({
  ...textGradient(
    `300deg, ${theme.palette.primary.main} 0%, ${theme.palette.warning.main} 25%, ${theme.palette.primary.main} 50%, ${theme.palette.warning.main} 75%, ${theme.palette.primary.main} 100%`,
  ),
  padding: 0,
  marginTop: 8,
  lineHeight: 1,
  fontWeight: 900,
  marginBottom: 24,
  letterSpacing: 8,
  textAlign: "center",
  backgroundSize: "400%",
  fontSize: `${64 / 16}rem`,
  fontFamily: theme.typography.fontSecondaryFamily,
  [theme.breakpoints.up("md")]: {
    fontSize: `${96 / 16}rem`,
  },
}));

const StyledEllipseTop = styled("div")(({ theme }) => ({
  top: -80,
  width: 480,
  right: -80,
  height: 480,
  borderRadius: "50%",
  position: "absolute",
  filter: "blur(100px)",
  WebkitFilter: "blur(100px)",
  backgroundColor: alpha(theme.palette.primary.darker, 0.12),
}));

const StyledEllipseBottom = styled("div")(({ theme }) => ({
  height: 400,
  bottom: -200,
  left: "10%",
  right: "10%",
  borderRadius: "50%",
  position: "absolute",
  filter: "blur(100px)",
  WebkitFilter: "blur(100px)",
  backgroundColor: alpha(theme.palette.primary.darker, 0.12),
}));

type StyledPolygonProps = {
  opacity?: number;
  anchor?: "left" | "right";
};

const StyledPolygon = styled("div")<StyledPolygonProps>(
  ({ opacity = 1, anchor = "left", theme }) => ({
    ...bgBlur({
      opacity,
      color: theme.palette.background.default,
    }),
    zIndex: 9,
    bottom: 0,
    height: 80,
    width: "50%",
    position: "absolute",
    clipPath: "polygon(0% 0%, 100% 100%, 0% 100%)",
    ...(anchor === "left" && {
      left: 0,
      ...(theme.direction === "rtl" && {
        transform: "scale(-1, 1)",
      }),
    }),
    ...(anchor === "right" && {
      right: 0,
      transform: "scaleX(-1)",
      ...(theme.direction === "rtl" && {
        transform: "scaleX(1)",
      }),
    }),
  }),
);

// ----------------------------------------------------------------------

export default function LandingHero() {
  const mdUp = useResponsive("up", "md");

  const theme = useTheme();

  const heroRef = useRef<HTMLDivElement | null>(null);

  const { scrollY } = useScroll();

  const [percent, setPercent] = useState(0);

  const lightMode = theme.palette.mode === "light";

  const getScroll = useCallback(() => {
    let heroHeight = 0;

    if (heroRef.current) {
      heroHeight = heroRef.current.offsetHeight;
    }

    scrollY.on("change", (scrollHeight) => {
      const scrollPercent = (scrollHeight * 100) / heroHeight;

      setPercent(Math.floor(scrollPercent));
    });
  }, [scrollY]);

  useEffect(() => {
    getScroll();
  }, [getScroll]);

  const transition = {
    repeatType: "loop",
    ease: "linear",
    duration: 60 * 4,
    repeat: Infinity,
  } as const;

  const opacity = 1 - percent / 100;

  const hide = percent > 120;

  const textBlurPx = Math.min(12, percent * 0.12);
  const textTranslateY = Math.min(60, percent * 0.6);
  const textOpacity = Math.max(0, 1 - percent * 0.012);

  const slides = [
    { id: 1, img: "/assets/images/home/hero/bg-banner.jpg" },
    { id: 2, img: "/assets/images/home/hero/bg-banner-1.avif" },
    { id: 3, img: "/assets/images/home/hero/bg-banner-2.jpg" },
  ];

  const carousel = useCarousel({
    dots: true,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 6000,
    pauseOnHover: false,
    infinite: true,
    fade: true,
    speed: 800,
    ...CarouselDots({
      sx: {
        color: "common.white",
        position: "absolute",
        bottom: 24,
        left: 0,
        right: 0,
      },
    }),
  });

  const renderPolygons = (
    <>
      <StyledPolygon />
      <StyledPolygon anchor="right" opacity={0.48} />
      <StyledPolygon
        anchor="right"
        opacity={0.48}
        sx={{ height: 48, zIndex: 10 }}
      />
      <StyledPolygon anchor="right" sx={{ zIndex: 11, height: 24 }} />
    </>
  );

  const renderEllipses = (
    <>
      {mdUp && <StyledEllipseTop />}
      <StyledEllipseBottom />
    </>
  );

  return (
    <>
      <StyledRoot
        ref={heroRef}
        sx={{
          ...(hide && { opacity: 0 }),
        }}
      >
        <Box sx={{ position: "absolute", inset: 0 }}>
          <Carousel ref={carousel.carouselRef} {...carousel.carouselSettings}>
            {slides.map((slide, index) => (
              <Box
                key={slide.id}
                onClick={carousel.onNext}
                sx={{
                  height: "100vh",
                  cursor: "pointer",
                  position: "relative",
                  backgroundImage: `url(${slide.img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <Container sx={{ height: 1 }}>
                  <Stack
                    alignItems="center"
                    justifyContent="end"
                    sx={{ height: 1, pb: 10 }}
                  >
                    <m.div
                      style={{
                        y: textTranslateY,
                        opacity: textOpacity,
                        filter: `blur(${textBlurPx}px)`,
                      }}
                    >
                      <Typography
                        variant="h1"
                        sx={{
                          color: "common.white",
                          fontWeight: 700,
                          letterSpacing: 2,
                          mb: 3,
                        }}
                      >
                        "SOLUNA"
                      </Typography>
                    </m.div>
                    <m.div
                      style={{
                        y: textTranslateY + 10,
                        opacity: textOpacity,
                        filter: `blur(${Math.max(0, textBlurPx - 2)}px)`,
                      }}
                    >
                      <Stack direction="row" spacing={2}>
                        <Button
                          variant="outlined"
                          color="inherit"
                          sx={{
                            color: "common.white",
                            borderColor: "common.white",
                          }}
                        >
                          Shop Now
                        </Button>
                      </Stack>
                    </m.div>
                  </Stack>
                </Container>
              </Box>
            ))}
          </Carousel>
        </Box>
      </StyledRoot>
      {mdUp && renderPolygons}

      <Box sx={{ height: { md: "100vh" } }} />
    </>
  );
}
