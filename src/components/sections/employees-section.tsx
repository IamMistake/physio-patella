"use client";

import * as React from "react";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import Image from "next/image";
import {
  Avatar,
  Box,
  Chip,
  Container,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import SectionOverline from "@/components/ui/section-overline";
import type { Employee } from "@/types/physio";

type EmployeesSectionProps = {
  employees: Employee[];
};

function resolveImagePath(path: string | null) {
  if (!path) {
    return null;
  }

  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path;
  }

  return `/${path}`;
}

function getInitials(name: string | null) {
  if (!name) {
    return "PP";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export default function EmployeesSection({ employees }: EmployeesSectionProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scrollCards = (direction: "left" | "right") => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    const amount = direction === "left" ? -304 : 304;
    container.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <Box
      id="team"
      component="section"
      aria-labelledby="team-heading"
      sx={{
        scrollMarginTop: { xs: "56px", md: "64px" },
        py: { xs: 6, md: 10, lg: 16 },
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Stack spacing={4}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-end" spacing={2}>
            <Stack spacing={1.3}>
              <SectionOverline>Our specialists</SectionOverline>
              <Typography
                id="team-heading"
                variant="h2"
                sx={{
                  fontFamily: "var(--font-dm-serif), serif",
                  fontSize: { xs: "2rem", md: "2.8rem" },
                }}
              >
                Hands that heal
              </Typography>
            </Stack>

            <Typography
              sx={{
                display: { xs: "none", md: "block" },
                fontSize: "0.75rem",
                color: "text.secondary",
                whiteSpace: "nowrap",
              }}
            >
              scroll to explore -&gt;
            </Typography>
          </Stack>

          <Box sx={{ position: "relative" }}>
            <Box
              ref={scrollRef}
              sx={{
                display: "flex",
                gap: 3,
                overflowX: "auto",
                scrollSnapType: "x mandatory",
                scrollbarWidth: "none",
                WebkitOverflowScrolling: "touch",
                scrollBehavior: "smooth",
                pr: { xs: 4, md: 0 },
                pb: 1,
                "&::-webkit-scrollbar": {
                  display: "none",
                },
              }}
            >
              {employees.map((employee, employeeIndex) => {
                const visibleCertificates = employee.certificates.slice(0, 3);
                const hiddenCount = Math.max(employee.certificates.length - visibleCertificates.length, 0);
                const imagePath = resolveImagePath(employee.image_path);

                return (
                  <Paper
                    key={employee.id}
                    sx={{
                      width: { xs: "80vw", md: "280px" },
                      maxWidth: 320,
                      height: 430,
                      flexShrink: 0,
                      overflow: "hidden",
                      borderRadius: 2.5,
                      scrollSnapAlign: "start",
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                      boxShadow: "none",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
                      "@media (prefers-reduced-motion: no-preference)": {
                        animation: `employeeReveal 0.5s ease ${employeeIndex * 0.08}s both`,
                      },
                      "@keyframes employeeReveal": {
                        from: {
                          opacity: 0,
                          transform: "translateY(24px)",
                        },
                        to: {
                          opacity: 1,
                          transform: "translateY(0)",
                        },
                      },
                      "&:hover": {
                        transform: { md: "translateY(-6px)" },
                        boxShadow: { md: 8 },
                        borderColor: { md: "primary.main" },
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        height: "55%",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        bgcolor: "primary.main",
                        opacity: imagePath ? 1 : 0.15,
                        backgroundImage: imagePath
                          ? "none"
                          : "repeating-linear-gradient(45deg, transparent, transparent 10px, color-mix(in srgb, var(--mui-palette-primary-main) 25%, transparent) 10px, color-mix(in srgb, var(--mui-palette-primary-main) 25%, transparent) 20px)",
                      }}
                    >
                      {imagePath ? (
                        <Image
                          src={imagePath}
                          alt={`Photo of ${employee.name ?? "Physio Patella specialist"}`}
                          fill
                          sizes="(max-width: 600px) 80vw, 280px"
                          loading={employeeIndex === 0 ? "eager" : "lazy"}
                          priority={employeeIndex === 0}
                          unoptimized
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 96,
                              height: 96,
                              fontSize: "2rem",
                              bgcolor: "primary.main",
                              color: "primary.contrastText",
                            }}
                          >
                            {getInitials(employee.name)}
                          </Avatar>
                        </Box>
                      )}
                    </Box>

                    <Stack spacing={1.25} sx={{ height: "45%", p: 2.5 }}>
                      <Typography
                        sx={{
                          fontFamily: "var(--font-dm-serif), serif",
                          fontSize: { xs: "1.1rem", md: "1.25rem" },
                          lineHeight: 1.2,
                        }}
                      >
                        {employee.name ?? "Physio Patella Specialist"}
                      </Typography>

                      {employee.specialization ? (
                        <Chip
                          label={employee.specialization}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ width: "fit-content", minHeight: 24, fontSize: "0.75rem" }}
                        />
                      ) : null}

                      <Typography
                        sx={{
                          fontSize: "0.82rem",
                          color: "text.secondary",
                          lineHeight: 1.6,
                          display: "-webkit-box",
                          overflow: "hidden",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {employee.description ?? "Personalized care focused on recovery and long-term mobility."}
                      </Typography>

                      <Stack direction="row" useFlexGap flexWrap="wrap" spacing={0.5} sx={{ maxWidth: "100%" }}>
                        {visibleCertificates.map((certificate) => (
                          <Chip
                            key={certificate.id}
                            label={certificate.title ?? "Certificate"}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: "divider",
                              color: "text.secondary",
                              fontSize: "0.75rem",
                              borderRadius: "6px",
                              height: 24,
                              maxWidth: "100%",
                              transition: "background-color 0.2s ease",
                              "& .MuiChip-label": {
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              },
                              "&:hover": {
                                bgcolor: "action.hover",
                              },
                            }}
                          />
                        ))}

                        {hiddenCount > 0 ? (
                          <Chip
                            label={`+${hiddenCount} more`}
                            size="small"
                            variant="outlined"
                            sx={{ borderColor: "divider", fontSize: "0.75rem", borderRadius: "6px", height: 24 }}
                          />
                        ) : null}
                      </Stack>
                    </Stack>
                  </Paper>
                );
              })}
            </Box>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                display: { xs: "none", md: "flex" },
                position: "absolute",
                top: "25%",
                left: -22,
                right: -22,
                transform: "translateY(-50%)",
                justifyContent: "space-between",
                pointerEvents: "none",
              }}
            >
              <IconButton
                onClick={() => scrollCards("left")}
                aria-label="Scroll specialists left"
                sx={{
                  pointerEvents: "auto",
                  width: 44,
                  height: 44,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    borderColor: "transparent",
                  },
                }}
              >
                <ChevronLeftRoundedIcon />
              </IconButton>
              <IconButton
                onClick={() => scrollCards("right")}
                aria-label="Scroll specialists right"
                sx={{
                  pointerEvents: "auto",
                  width: 44,
                  height: 44,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    borderColor: "transparent",
                  },
                }}
              >
                <ChevronRightRoundedIcon />
              </IconButton>
            </Stack>

            <Box
              aria-hidden
              sx={{
                display: { xs: "block", md: "none" },
                pointerEvents: "none",
                position: "absolute",
                top: 0,
                right: 0,
                width: 56,
                height: "100%",
                bgcolor: "background.default",
                maskImage: "linear-gradient(to right, transparent, black)",
              }}
            />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
