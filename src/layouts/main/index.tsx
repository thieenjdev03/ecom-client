import Box from "@mui/material/Box";

import { usePathname } from "src/routes/hooks";

import Footer from "./footer";
import HeaderEcom from "./header-ecom";
import LandingFooter from "../landing-page/footer";

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
  const pathname = usePathname();
  const isDashboardPage = pathname.includes("/dashboard");
  const homePage = pathname === "/" || !isDashboardPage;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: 1 }}>
      <HeaderEcom />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ...(!homePage && {
            pt: { xs: 8, md: 10 },
            mt: "80px",
          }),
        }}
      >
        {children}
      </Box>

      {homePage ? <LandingFooter /> : <Footer />}
    </Box>
  );
}
