import { useState, useRef } from "react";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";

import { RouterLink } from "src/routes/components";

type Item = { label: string; href: string };

type Group = { title: string; items: Item[] };

type Props = {
  label: string;
  color?: string;
  textShadow?: string;
  items?: Item[];
  groups?: Group[];
};

export default function EcomDropdown({
  label,
  color,
  textShadow,
  items,
  groups,
}: Props) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const handleOpen = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setOpen(true);
  };

  const handleClose = () => {
    timerRef.current = window.setTimeout(() => setOpen(false), 120);
  };

  return (
    <Box
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
      ref={anchorRef}
      sx={{ position: "relative" }}
    >
      <Typography
        component="span"
        sx={{
          typography: "subtitle2",
          letterSpacing: 1,
          color,
          textShadow,
          cursor: "pointer",
          transition: "all 0.3s ease",
          "&:hover": {
            color: "primary.main",
            transform: "translateY(-2px)",
            textShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        {label}
      </Typography>

      <Popover
        open={open}
        disableRestoreFocus
        anchorEl={anchorRef.current}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{ sx: { mt: 1, p: 2 } }}
      >
        {!!groups?.length ? (
          <Stack direction="row" spacing={4} sx={{ minWidth: 400 }}>
            {groups.map((g) => (
              <Box key={g.title} sx={{ minWidth: 160 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {g.title}
                </Typography>
                <List dense disablePadding>
                  {g.items.map((it) => (
                    <ListItemButton
                      key={it.label}
                      component={RouterLink}
                      href={it.href}
                      sx={{ 
                        px: 1,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "primary.lighter",
                          transform: "translateX(4px)",
                        },
                      }}
                    >
                      {it.label}
                    </ListItemButton>
                  ))}
                </List>
              </Box>
            ))}
          </Stack>
        ) : (
          <Paper elevation={0} sx={{ p: 1 }}>
            <Stack spacing={0.5} sx={{ minWidth: 200 }}>
              {items?.map((it) => (
                <Link
                  key={it.label}
                  component={RouterLink}
                  href={it.href}
                  underline="none"
                  sx={{ 
                    py: 0.75,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      color: "primary.main",
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  {it.label}
                </Link>
              ))}
            </Stack>
          </Paper>
        )}
      </Popover>
    </Box>
  );
}
