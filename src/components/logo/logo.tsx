import { forwardRef } from "react";
import Image from "next/image";

import Link from "@mui/material/Link";
import Box, { BoxProps } from "@mui/material/Box";

import { RouterLink } from "src/routes/components";

// ----------------------------------------------------------------------

export interface LogoProps extends BoxProps {
  disabledLink?: boolean;
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ disabledLink = false, sx, ...other }, ref) => {

    // Using Next.js Image component for better optimization
    // -------------------------------------------------------
    const logo = (
      <Box
        ref={ref}
        sx={{
          width: 80,
          height: 80,
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.3s ease',
          borderRadius: 1,
          overflow: 'hidden',
          ...sx,
        }}
        {...other}
      >
        <Image
          src="/assets/images/home/logo.png"
          alt="Logo"
          fill
          priority
          sizes="(max-width: 768px) 80px, 120px"
          style={{
            objectFit: 'contain',
            transition: 'transform 0.3s ease',
          }}
          onError={(e) => {
            // Fallback to SVG if PNG fails to load
            const target = e.target as HTMLImageElement;
            if (target.src.includes('.png')) {
              target.src = '/logo/logo_single.svg';
            }
          }}
        />
      </Box>
    );

    if (disabledLink) {
      return logo;
    }

    return (
      <Link component={RouterLink} href="/" sx={{ display: "contents" }}>
        {logo}
      </Link>
    );
  },
);

Logo.displayName = 'Logo';

export default Logo;
