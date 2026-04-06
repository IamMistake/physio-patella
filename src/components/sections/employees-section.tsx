import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import Image from "next/image";
import { Avatar, Box, Chip, Container, Paper, Stack, Typography } from "@mui/material";
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

function getShortDescription(description: string | null) {
  if (!description) {
    return "Персонализирана нега фокусирана на опоравување и долгорочна мобилност.";
  }

  const trimmed = description.trim();
  const firstSentence = trimmed.split(/[.!?]\s/)[0]?.trim() ?? trimmed;
  const shortValue = firstSentence.length > 120 ? `${firstSentence.slice(0, 117)}...` : firstSentence;

  return shortValue;
}

export default function EmployeesSection({ employees }: EmployeesSectionProps) {
  const desktopColumns =
    employees.length >= 3
      ? "repeat(3, minmax(0, 1fr))"
      : `repeat(${Math.max(employees.length, 1)}, minmax(0, 340px))`;

  return (
    <Box
      id="team"
      component="section"
      aria-labelledby="team-heading"
      sx={{
        scrollMarginTop: { xs: "56px", md: "64px" },
        py: { xs: 6, md: 10 },
        bgcolor: "background.paper",
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Stack spacing={4}>
          <Stack spacing={1.3}>
            <SectionOverline>Наши специјалисти</SectionOverline>
            <Typography
              id="team-heading"
              variant="h2"
              sx={{ fontFamily: "var(--font-dm-serif), serif", fontSize: { xs: "2rem", md: "2.8rem" } }}
            >
              Тим што лекува
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: desktopColumns,
              },
              gap: 3,
              justifyContent: "center",
            }}
          >
            {employees.map((employee, employeeIndex) => {
              const visibleCertificates = employee.certificates.slice(0, 2);
              const hiddenCount = Math.max(employee.certificates.length - visibleCertificates.length, 0);
              const imagePath = resolveImagePath(employee.image_path);

              return (
                <Paper
                  key={employee.id}
                  sx={{
                    p: { xs: 2.25, md: 3 },
                    borderRadius: "20px",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    maxWidth: { xs: 360, sm: "none" },
                    mx: "auto",
                    minHeight: { md: "320px" },
                    boxShadow: "none",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow:
                        "0 8px 32px color-mix(in srgb, var(--mui-palette-primary-main) 15%, transparent)",
                    },
                    "@media (prefers-reduced-motion: no-preference)": {
                      animation: `employeeCardIn 0.45s ease ${employeeIndex * 0.08}s both`,
                    },
                    "@keyframes employeeCardIn": {
                      from: {
                        opacity: 0,
                        transform: "translateY(18px)",
                      },
                      to: {
                        opacity: 1,
                        transform: "translateY(0)",
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      overflow: "hidden",
                      mx: "auto",
                      mb: 1.5,
                      border:
                        "3px solid color-mix(in srgb, var(--mui-palette-primary-main) 30%, transparent)",
                      boxShadow:
                        "0 0 0 3px var(--mui-palette-background-paper), 0 0 0 5px color-mix(in srgb, var(--mui-palette-primary-main) 40%, transparent)",
                      position: "relative",
                    }}
                  >
                    {imagePath ? (
                      <Image
                        src={imagePath}
                        alt={`Фотографија од ${employee.name ?? "специјалист на Physio Patella"}`}
                        fill
                        sizes="120px"
                        loading="lazy"
                        unoptimized
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <Avatar
                        sx={{
                          width: 120,
                          height: 120,
                          fontSize: "2rem",
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                        }}
                      >
                        {getInitials(employee.name)}
                      </Avatar>
                    )}
                  </Box>

                  <Typography
                    sx={{
                      fontFamily: "var(--font-dm-serif), serif",
                      fontSize: "1.25rem",
                      textAlign: "center",
                      color: "text.primary",
                    }}
                  >
                    {employee.name ?? "Специјалист на Physio Patella"}
                  </Typography>

                  {employee.specialization ? (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 0.7 }}>
                      <Chip
                        label={employee.specialization}
                        variant="outlined"
                        color="primary"
                        size="small"
                        sx={{ minHeight: 24 }}
                      />
                    </Box>
                  ) : null}

                  <Typography
                    sx={{
                      mt: 1.5,
                      fontSize: "0.82rem",
                      color: "text.secondary",
                      textAlign: "center",
                      lineHeight: 1.6,
                      display: "-webkit-box",
                      overflow: "hidden",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {getShortDescription(employee.description)}
                  </Typography>

                  <Stack spacing={0.7} alignItems="center" sx={{ flexGrow: 1, justifyContent: "flex-end", mt: 1.5 }}>
                    <Box sx={{ width: 40, height: "1px", bgcolor: "divider", mx: "auto", my: 1.5 }} />
                    {employee.phone_primary ? (
                      <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", textAlign: "center" }}>
                        Тел: {employee.phone_primary}
                      </Typography>
                    ) : null}
                    {employee.phone_secondary ? (
                      <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", textAlign: "center" }}>
                        Бизнис: {employee.phone_secondary}
                      </Typography>
                    ) : null}
                    {visibleCertificates.map((certificate) => (
                      <Stack key={certificate.id} direction="row" spacing={0.6} alignItems="center">
                        <CheckRoundedIcon sx={{ fontSize: 12, color: "primary.main" }} />
                        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", textAlign: "center" }}>
                          {certificate.title ?? "Сертификат"}
                        </Typography>
                      </Stack>
                    ))}

                    {hiddenCount > 0 ? (
                      <Typography sx={{ fontSize: "0.75rem", color: "primary.main" }}>
                        + {hiddenCount} повеќе
                      </Typography>
                    ) : null}
                  </Stack>
                </Paper>
              );
            })}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
