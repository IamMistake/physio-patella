"use client";

import * as React from "react";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import {
  AppBar,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import ThemeToggle from "@/components/theme/theme-toggle";

type NavLink = {
  label: string;
  href: string;
};

const navLinks: NavLink[] = [
  { label: "Home", href: "#home" },
  { label: "Team", href: "#team" },
  { label: "Therapies", href: "#therapies" },
  { label: "Blog", href: "#blog" },
];

const bookNowLink: NavLink = { label: "Book Now", href: "#booking" };

function NavTextButton({ link, onClick }: { link: NavLink; onClick?: () => void }) {
  return (
    <Button
      href={link.href}
      onClick={onClick}
      color="inherit"
      sx={{
        color: "text.secondary",
        textTransform: "uppercase",
        letterSpacing: 1.5,
        fontSize: 12,
        fontWeight: 600,
        borderRadius: 999,
        px: 1.6,
        py: 1,
        minWidth: 0,
        transition: "all 0.25s ease",
        "&:hover": {
          color: "text.primary",
          bgcolor: "action.hover",
        },
      }}
    >
      {link.label}
    </Button>
  );
}

export default function Navbar() {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const updateScrollState = () => {
      setIsScrolled(window.scrollY > 60);
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateScrollState);
    };
  }, []);

  const frostedBackground =
    theme.palette.mode === "light"
      ? alpha(theme.palette.common.white, 0.8)
      : alpha(theme.palette.common.black, 0.8);

  return (
    <>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          top: 0,
          borderBottom: "1px solid",
          borderColor: isScrolled
            ? alpha(theme.palette.divider, 0.85)
            : alpha(theme.palette.divider, 0),
          backgroundColor: isScrolled ? frostedBackground : "transparent",
          backdropFilter: isScrolled ? "blur(12px)" : "blur(0px)",
          transition:
            "background-color 0.35s ease, backdrop-filter 0.35s ease, border-color 0.35s ease",
          zIndex: theme.zIndex.appBar,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 76, md: 86 } }}>
            <Typography
              component="a"
              href="#home"
              sx={{
                fontFamily: "var(--font-dm-serif), serif",
                color: "primary.main",
                textDecoration: "none",
                fontSize: { xs: "1.5rem", md: "1.7rem" },
                lineHeight: 1,
                letterSpacing: 0.2,
                whiteSpace: "nowrap",
              }}
            >
              Physio Patella
            </Typography>

            <Stack
              direction="row"
              spacing={0.4}
              sx={{
                display: { xs: "none", md: "flex" },
                marginInline: "auto",
              }}
            >
              {navLinks.map((link) => (
                <NavTextButton key={link.label} link={link} />
              ))}

              <Button
                href={bookNowLink.href}
                variant="contained"
                size="small"
                sx={{ ml: 0.8, px: 2.5, py: 1.1 }}
              >
                {bookNowLink.label}
              </Button>
            </Stack>

            <Stack direction="row" spacing={0.8} alignItems="center" sx={{ ml: "auto" }}>
              <ThemeToggle />
              <IconButton
                onClick={() => setDrawerOpen(true)}
                aria-label="Open navigation menu"
                sx={{
                  display: { xs: "inline-flex", md: "none" },
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                <MenuRoundedIcon />
              </IconButton>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 290,
            p: 3,
            pt: 11,
            borderLeft: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        <Stack spacing={1}>
          {navLinks.map((link) => (
            <Button
              key={link.label}
              href={link.href}
              onClick={() => setDrawerOpen(false)}
              sx={{
                justifyContent: "flex-start",
                color: "text.primary",
                letterSpacing: 1.2,
                textTransform: "uppercase",
                fontSize: 12,
                fontWeight: 600,
                px: 0,
                py: 1,
                borderRadius: 0,
              }}
            >
              {link.label}
            </Button>
          ))}

          <Divider sx={{ my: 0.6 }} />

          <Button
            href={bookNowLink.href}
            onClick={() => setDrawerOpen(false)}
            variant="contained"
            sx={{ alignSelf: "flex-start", px: 3 }}
          >
            {bookNowLink.label}
          </Button>
        </Stack>
      </Drawer>
    </>
  );
}
