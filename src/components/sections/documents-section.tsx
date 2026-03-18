import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import SectionOverline from "@/components/ui/section-overline";
import type { StudioDocument } from "@/types/physio";

type DocumentsSectionProps = {
  documents: StudioDocument[];
};

function getAccent(docType: string | null) {
  const normalized = docType?.toLowerCase().trim();

  if (normalized === "certificate") {
    return { token: "primary.main", cssVar: "var(--mui-palette-primary-main)" };
  }

  if (normalized === "insurance") {
    return { token: "secondary.main", cssVar: "var(--mui-palette-secondary-main)" };
  }

  if (normalized === "brochure" || normalized === "policy") {
    return { token: "success.main", cssVar: "var(--mui-palette-success-main, #4caf50)" };
  }

  return { token: "text.disabled", cssVar: "var(--mui-palette-text-disabled)" };
}

function formatDocType(docType: string | null) {
  if (!docType) {
    return "Документ";
  }

  const normalized = docType.toLowerCase().trim();

  if (normalized === "certificate") {
    return "Сертификат";
  }

  if (normalized === "insurance") {
    return "Осигурување";
  }

  if (normalized === "brochure") {
    return "Брошура";
  }

  if (normalized === "policy") {
    return "Политика";
  }

  if (normalized === "license") {
    return "Лиценца";
  }

  return docType
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function DocumentsSection({ documents }: DocumentsSectionProps) {
  return (
    <Box
      id="documents"
      component="section"
      aria-labelledby="documents-heading"
      sx={{ py: { xs: 6, md: 10 }, bgcolor: "background.paper" }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Stack spacing={4}>
          <Stack spacing={1.3}>
            <SectionOverline>Доверба и транспарентност</SectionOverline>
            <Typography
              id="documents-heading"
              variant="h2"
              sx={{ fontFamily: "var(--font-dm-serif), serif", fontSize: { xs: "2rem", md: "2.8rem" } }}
            >
              Сертификати
            </Typography>
          </Stack>

          {documents.length === 0 ? (
            <Paper sx={{ border: "1px solid", borderColor: "divider", p: 3, borderRadius: 2 }}>
              <Typography sx={{ color: "text.secondary", fontSize: { xs: "1rem", md: "1.125rem" } }}>
                Документите наскоро ќе бидат достапни.
              </Typography>
            </Paper>
          ) : (
            <Box
              sx={{
                mx: { xs: 0 },
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 2.5,
              }}
            >
              {documents.map((document, index) => {
                const accent = getAccent(document.doc_type);

                return (
                  <Paper
                    key={document.id ?? index}
                    sx={{
                      borderRadius: 2,
                      p: 3.5,
                      minHeight: 200,
                      display: "flex",
                      flexDirection: "column",
                      border: "1px solid",
                      borderColor: "divider",
                      boxShadow: `inset 0 5px 0 0 ${accent.cssVar}`,
                      transition: "transform 0.25s ease, background-color 0.25s ease",
                      "@media (prefers-reduced-motion: no-preference)": {
                        animation: `documentReveal 0.45s ease ${index * 0.07}s both`,
                      },
                      "@keyframes documentReveal": {
                        from: {
                          opacity: 0,
                          transform: "translateY(18px)",
                        },
                        to: {
                          opacity: 1,
                          transform: "translateY(0)",
                        },
                      },
                      "&:hover": {
                        transform: { md: "translateY(-4px)" },
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    <Chip
                      label={formatDocType(document.doc_type)}
                      size="small"
                      variant="outlined"
                      sx={{
                        width: "fit-content",
                        color: accent.token,
                        borderColor: accent.token,
                        fontSize: "0.7rem",
                        minHeight: 28,
                      }}
                    />

                    <Typography
                      sx={{
                        mt: 1.5,
                        fontFamily: "var(--font-dm-serif), serif",
                        fontSize: "1.125rem",
                        color: "text.primary",
                        lineHeight: 1.35,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {document.title ?? "Документ од студио"}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 1,
                        fontSize: "0.82rem",
                        color: "text.secondary",
                        lineHeight: 1.6,
                        display: "-webkit-box",
                        overflow: "hidden",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {document.description ?? "Официјален документ од Physio Patella."}
                    </Typography>

                    {document.file_path ? (
                      <Button
                        component="a"
                        href={document.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        size="small"
                        endIcon={<OpenInNewRoundedIcon />}
                        sx={{
                          mt: 2,
                          width: "100%",
                          minHeight: 44,
                          color: accent.token,
                          borderColor: accent.token,
                          "&:hover": {
                            bgcolor: `color-mix(in srgb, ${accent.cssVar} 8%, transparent)`,
                          },
                       }}
                      >
                        Види документ
                      </Button>
                    ) : (
                      <Button
                        disabled
                        variant="outlined"
                        size="small"
                        sx={{
                          mt: 2,
                          width: "100%",
                          minHeight: 44,
                        }}
                      >
                        Наскоро
                      </Button>
                    )}
                  </Paper>
                );
              })}
            </Box>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
