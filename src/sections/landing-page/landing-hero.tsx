import { m, useScroll } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { alpha, styled, useTheme } from "@mui/material/styles";

import { useResponsive } from "src/hooks/use-responsive";

import { bgBlur, bgGradient, textGradient } from "src/theme/css";

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

  const heroRef = useRef<HTMLDivElement | null>(null);

  const { scrollY } = useScroll();

  const [percent, setPercent] = useState(0);

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

  // Ensure videos in the hero autoplay on initial page load across browsers
  useEffect(() => {
    const root = heroRef.current;
    if (!root) return;
    const videos = root.querySelectorAll<HTMLVideoElement>("video");
    videos.forEach((video) => {
      video.muted = true;
      // Some browsers require setting attributes directly for inline playback
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      const result = video.play();
      if (result && typeof (result as Promise<void>).catch === "function") {
        (result as Promise<void>).catch(() => {
          // Swallow autoplay rejections; user interaction will resume playback
        });
      }
    });
  }, []);

  const hide = percent > 120;

  const textBlurPx = Math.min(12, percent * 0.12);
  const textTranslateY = Math.min(60, percent * 0.6);
  const textOpacity = Math.max(0, 1 - percent * 0.012);

  // Slides can be either image or video. Provide `type` and `src`.
  // For video slides, ensure the file is placed under `public/` and is optimized for web playback.
  const slides: Array<
    | { id: number; type: "image"; src: string }
    | { id: number; type: "video"; src: string; poster?: string }
  > = [
    { id: 1, type: "video", src: "/assets/images/home/hero/banner-video.mp4", poster: "/assets/images/home/hero/bg-banner.jpg" },
    { id: 2, type: "image", src: "/assets/images/home/hero/bg-banner.jpg" },
    { id: 3, type: "image", src: "/assets/images/home/hero/bg-banner-1.avif" },
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
            {slides.map((slide) => (
              <Box
                key={slide.id}
                onClick={carousel.onNext}
                sx={{
                  height: "100vh",
                  cursor: "pointer",
                  position: "relative",
                  ...(slide.type === "image" && {
                    backgroundImage: `url(${slide.src})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }),
                }}
              >
                {slide.type === "video" && (
                  <Box
                    component="video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    poster={(slide as { poster?: string }).poster}
                    sx={{
                      position: "absolute",
                      inset: 0,
                      width: 1,
                      height: 1,
                      objectFit: "cover",
                    }}
                  >
                    {/* Use a single MP4 source or multiple sources for broader compatibility */}
                    <source src={(slide as { src: string }).src} type="video/mp4" />
                  </Box>
                )}
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
                            fontSize: "22px",
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
      {/* {mdUp && renderPolygons} */}

      <Box sx={{ height: { md: "100vh" } }} />
    </>
  );
}
