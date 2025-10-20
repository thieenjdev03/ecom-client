import { useState, useCallback } from "react";

import Collapse from "@mui/material/Collapse";
import { stackClasses } from "@mui/material/Stack";
import { listItemButtonClasses } from "@mui/material/ListItemButton";

import { useActiveLink } from "src/routes/hooks/use-active-link";

import { NavSectionVertical } from "src/components/nav-section";

import { NavItem } from "./nav-item";
import { NavListProps } from "../types";
import MobileCategoriesDropdown from "../mobile-categories-dropdown";

// ----------------------------------------------------------------------

export default function NavList({ data }: NavListProps) {
  const active = useActiveLink(data.path, !!data.children);

  const [openMenu, setOpenMenu] = useState(false);

  const handleToggleMenu = useCallback(() => {
    if (data.children || data.hasCategories) {
      setOpenMenu((prev) => !prev);
    }
  }, [data.children, data.hasCategories]);

  return (
    <>
      <NavItem
        open={openMenu}
        onClick={handleToggleMenu}
        //
        title={data.title}
        path={data.path}
        icon={data.icon}
        //
        hasChild={!!data.children || !!data.hasCategories}
        externalLink={data.path.includes("http")}
        //
        active={active}
      />

      {data.hasCategories && (
        <MobileCategoriesDropdown
          open={openMenu}
          onToggle={handleToggleMenu}
        />
      )}

      {!!data.children && (
        <Collapse in={openMenu} unmountOnExit>
          <NavSectionVertical
            data={data.children}
            slotProps={{
              rootItem: {
                minHeight: 36,
              },
            }}
            sx={{
              [`& .${stackClasses.root}`]: {
                "&:last-of-type": {
                  [`& .${listItemButtonClasses.root}`]: {
                    height: 160,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    bgcolor: "background.neutral",
                    backgroundRepeat: "no-repeat",
                    backgroundImage:
                      "url(/assets/illustrations/illustration_dashboard.png)",
                    "& .label": {
                      display: "none",
                    },
                  },
                },
              },
            }}
          />
        </Collapse>
      )}
    </>
  );
}
