"use client";

import * as React from "react";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import Image from "next/image";
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { usePathname } from "next/navigation";
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

export default function Navbar() {
  const theme = useTheme();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [activeHash, setActiveHash] = React.useState("#home");

  React.useEffect(() => {
    const updateScrollState = () => {
      setIsScrolled(window.scrollY > 60);
    };

    const updateActiveHash = () => {
      setActiveHash(window.location.hash || "#home");
    };

    updateScrollState();
    updateActiveHash();

    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("hashchange", updateActiveHash, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("hashchange", updateActiveHash);
    };
  }, []);

  const frostedBackground =
    theme.palette.mode === "light"
      ? alpha(theme.palette.common.white, 0.85)
      : alpha(theme.palette.common.black, 0.8);

  const getNavColor = (isActive: boolean) => {
    if (isActive) {
      return "primary.main";
    }

    if (isScrolled) {
      return "text.primary";
    }

    return theme.palette.mode === "dark"
      ? alpha(theme.palette.common.white, 0.85)
      : alpha(theme.palette.text.primary, 0.85);
  };

  const isActiveLink = React.useCallback(
    (href: string) => {
      if (href.startsWith("/")) {
        return pathname === href;
      }

      return pathname === "/" && activeHash === href;
    },
    [activeHash, pathname],
  );

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{
          top: 0,
          height: { xs: 56, md: 64 },
          borderBottom: "1px solid",
          borderColor: isScrolled ? alpha(theme.palette.divider, 0.85) : alpha(theme.palette.divider, 0),
          bgcolor: isScrolled ? frostedBackground : "transparent",
          backdropFilter: isScrolled ? "blur(12px)" : "none",
          boxShadow: isScrolled ? 1 : 0,
          pb: "env(safe-area-inset-bottom)",
          transition:
            "background-color 0.35s ease, backdrop-filter 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease",
          zIndex: theme.zIndex.appBar,
        }}
      >
        <Container maxWidth="lg" sx={{ height: "100%", px: { xs: 2, sm: 3, md: 4 } }}>
          <Toolbar disableGutters sx={{ minHeight: "100%", height: "100%" }}>
            <Typography
              component="div"
            >
              <Box
                component="a"
                href="#home"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  textDecoration: "none",
                }}
              >
                <Image
                  src="/physiopatella_logo.jpg"
                  alt="Physio Patella logo"
                  width={36}
                  height={36}
                  style={{ borderRadius: 8 }}
                />
                <Typography
                  sx={{
                    fontFamily: "var(--font-dm-serif), serif",
                    color: "primary.main",
                    textDecoration: "none",
                    fontSize: { xs: "1.2rem", md: "1.25rem" },
                    lineHeight: 1,
                    letterSpacing: 0.01,
                    transition: "color 0.3s ease",
                  }}
                >
                  Physio Patella
                </Typography>
              </Box>
            </Typography>

            <Stack
              direction="row"
              spacing={4}
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                marginInline: "auto",
              }}
            >
              {navLinks.map((link) => {
                const isActive = isActiveLink(link.href);

                return (
                  <Button
                    key={link.label}
                    href={link.href}
                    color="inherit"
                    sx={{
                      minHeight: 44,
                      minWidth: 44,
                      color: getNavColor(isActive),
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      borderRadius: 999,
                      px: 0,
                      py: 0,
                      transition: "color 0.3s ease, background-color 0.25s ease",
                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    <Box sx={{ position: "relative", display: "inline-flex", pb: 0.4 }}>
                      {link.label}
                      <Box
                        aria-hidden
                        sx={{
                          position: "absolute",
                          left: 0,
                          bottom: -5,
                          width: isActive ? "100%" : 0,
                          height: 2,
                          bgcolor: "primary.main",
                          borderRadius: 1,
                          transition: "width 0.3s ease",
                        }}
                      />
                    </Box>
                  </Button>
                );
              })}

              <Button
                href={bookNowLink.href}
                variant="contained"
                size="small"
                sx={{
                  minHeight: 44,
                  px: "20px",
                  py: "8px",
                  fontWeight: 600,
                  borderRadius: 999,
                  boxShadow: `0 2px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                  transition: "filter 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    filter: "brightness(1.1)",
                    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.45)}`,
                  },
                }}
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
                  minHeight: 44,
                  minWidth: 44,
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
        onClose={closeDrawer}
        PaperProps={{
          sx: {
            width: 280,
            height: "100%",
            p: 3,
            display: "flex",
            flexDirection: "column",
            borderLeft: "1px solid",
            borderColor: "divider",
            pb: "calc(env(safe-area-inset-bottom) + 20px)",
          },
        }}
      >
        <Typography
          component="div"
        >
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Image
              src="/physiopatella_logo.jpg"
              alt="Physio Patella logo"
              width={36}
              height={36}
              style={{ borderRadius: 8 }}
            />
            <Typography
              sx={{
                fontFamily: "var(--font-dm-serif), serif",
                color: "primary.main",
                fontSize: "1.5rem",
              }}
            >
              Physio Patella
            </Typography>
          </Box>
        </Typography>

        <List sx={{ py: 0 }}>
          {[...navLinks, bookNowLink].map((link) => {
            const isActive = isActiveLink(link.href);

            return (
              <ListItem key={link.label} disablePadding>
                <ListItemButton
                  component="a"
                  href={link.href}
                  onClick={closeDrawer}
                  sx={{
                    minHeight: 52,
                    borderRadius: 1.2,
                    color: isActive ? "primary.main" : "text.primary",
                    bgcolor: isActive ? "action.hover" : "transparent",
                  }}
                >
                  <ListItemText
                    primary={link.label}
                    primaryTypographyProps={{
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      sx: { transition: "color 0.3s ease" },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Box sx={{ mt: "auto", pt: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>Theme</Typography>
            <ThemeToggle />
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
