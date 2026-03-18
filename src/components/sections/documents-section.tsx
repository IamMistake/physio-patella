import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { StudioDocument } from "@/types/physio";

type DocumentsSectionProps = {
  documents: StudioDocument[];
};

function getAccentColorToken(docType: string | null) {
  const normalized = docType?.toLowerCase().trim();

  if (normalized === "certificate") {
    return "primary.main";
  }

  if (normalized === "insurance") {
    return "secondary.main";
  }

  if (normalized === "brochure") {
    return "success.main";
  }

  return "divider";
}

function formatDocType(docType: string | null) {
  if (!docType) {
    return "Document";
  }

  return docType
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function DocumentsSection({ documents }: DocumentsSectionProps) {
  return (
    <Box id="documents" component="section" sx={{ py: { xs: 15, md: 18 } }}>
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
              Trust & transparency
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: "2.2rem", md: "3.4rem" } }}>
              Studio credentials
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 2.5,
            }}
          >
            {documents.map((document, index) => (
              <Paper
                key={document.id}
                sx={{
                  borderRadius: 2,
                  p: 3.5,
                  minHeight: 228,
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid",
                  borderColor: "divider",
                  borderLeft: "4px solid",
                  borderLeftColor: getAccentColorToken(document.doc_type),
                  boxShadow: "none",
                  transition:
                    "border-left-width 0.2s ease, transform 0.25s ease, background-color 0.25s ease",
                  animation: `documentReveal 0.45s ease ${index * 0.07}s both`,
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
                    transform: "translateY(-4px)",
                    borderLeftWidth: 6,
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
                    color: getAccentColorToken(document.doc_type),
                    borderColor: getAccentColorToken(document.doc_type),
                    fontSize: 11,
                  }}
                />

                <Typography
                  sx={{
                    mt: 1.5,
                    fontFamily: "var(--font-dm-serif), serif",
                    fontSize: 17,
                    lineHeight: 1.35,
                  }}
                >
                  {document.title ?? "Studio document"}
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    fontSize: 13,
                    color: "text.secondary",
                    lineHeight: 1.6,
                    display: "-webkit-box",
                    overflow: "hidden",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {document.description ?? "Official document from Physio Patella."}
                </Typography>

                {document.file_path ? (
                  <Button
                    component="a"
                    endIcon={<LaunchRoundedIcon />}
                    href={document.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      mt: "auto",
                      alignSelf: "flex-end",
                      color: "primary.main",
                      px: 0,
                      minWidth: 0,
                      "&:hover": {
                        bgcolor: "transparent",
                        color: "primary.dark",
                      },
                    }}
                  >
                    View document
                  </Button>
                ) : (
                  <Button
                    disabled
                    endIcon={<LaunchRoundedIcon />}
                    sx={{ mt: "auto", alignSelf: "flex-end", px: 0, minWidth: 0 }}
                  >
                    View document
                  </Button>
                )}
              </Paper>
            ))}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
