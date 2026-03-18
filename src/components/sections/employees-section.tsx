import Image from "next/image";
import {
  Box,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
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

export default function EmployeesSection({ employees }: EmployeesSectionProps) {
  return (
    <Box id="team" component="section" sx={{ py: { xs: 15, md: 18 } }}>
      <Container maxWidth="xl">
        <Stack spacing={5}>
          <Stack spacing={1.3}>
            <Typography
              sx={{
                textTransform: "uppercase",
                letterSpacing: 2,
                color: "primary.main",
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              Our specialists
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: "2.2rem", md: "3.4rem" } }}>
              Hands that heal
            </Typography>
          </Stack>

          <Box sx={{ position: "relative" }}>
            <Box
              sx={{
                display: "flex",
                gap: 3,
                overflowX: "auto",
                scrollSnapType: "x mandatory",
                scrollbarWidth: "none",
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
                      width: 280,
                      height: 420,
                      flexShrink: 0,
                      overflow: "hidden",
                      borderRadius: 2.5,
                      scrollSnapAlign: "start",
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                      boxShadow: "none",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
                      animation: `employeeReveal 0.5s ease ${employeeIndex * 0.08}s both`,
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
                        transform: "translateY(-6px)",
                        boxShadow: 8,
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        height: "55%",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        bgcolor: "primary.light",
                      }}
                    >
                      {imagePath ? (
                        <Image
                          src={imagePath}
                          alt={employee.name ?? "Physio Patella specialist"}
                          fill
                          sizes="280px"
                          unoptimized
                          style={{ objectFit: "cover" }}
                        />
                      ) : null}

                      {employee.specialization ? (
                        <Chip
                          label={employee.specialization}
                          size="small"
                          color="primary"
                          sx={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        />
                      ) : null}
                    </Box>

                    <Stack spacing={1.7} sx={{ height: "45%", p: 2.5 }}>
                      <Typography
                        sx={{
                          fontFamily: "var(--font-dm-serif), serif",
                          fontSize: 18,
                          lineHeight: 1.2,
                        }}
                      >
                        {employee.name ?? "Physio Patella Specialist"}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 13,
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

                      <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
                        {visibleCertificates.map((certificate) => (
                          <Chip
                            key={certificate.id}
                            label={certificate.title ?? "Certificate"}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: "divider",
                              color: "text.secondary",
                              fontSize: 11,
                              maxWidth: "100%",
                              "& .MuiChip-label": {
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              },
                            }}
                          />
                        ))}

                        {hiddenCount > 0 ? (
                          <Chip
                            label={`+${hiddenCount} more`}
                            size="small"
                            variant="outlined"
                            sx={{ borderColor: "divider", fontSize: 11 }}
                          />
                        ) : null}
                      </Stack>
                    </Stack>
                  </Paper>
                );
              })}
            </Box>

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
