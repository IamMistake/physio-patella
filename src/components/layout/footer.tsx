import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import InstagramIcon from "@mui/icons-material/Instagram";
import Image from "next/image";
import { Box, Container, Link, Stack, Typography } from "@mui/material";

const instagramUrl = "https://instagram.com/physio.patella";
const emailAddress = "antonio_gurcinoski@hotmail.com";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={1.5}
          sx={{ py: { xs: 2.5, md: 3 } }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
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
                fontSize: { xs: "1rem", md: "1.1rem" },
                color: "text.primary",
              }}
            >
              Physio Patella
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Link
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.8,
                color: "text.secondary",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 999,
                px: 1.6,
                minHeight: 44,
                transition: "all 0.2s ease",
                "&:hover": {
                  color: "primary.main",
                  borderColor: "primary.main",
                  bgcolor: "action.hover",
                },
              }}
            >
              <InstagramIcon sx={{ fontSize: 18 }} />
              <Typography sx={{ fontSize: "0.82rem" }}>Instagram</Typography>
            </Link>

            <Link
              href={`mailto:${emailAddress}`}
              underline="none"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.8,
                color: "text.secondary",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 999,
                px: 1.6,
                minHeight: 44,
                transition: "all 0.2s ease",
                "&:hover": {
                  color: "primary.main",
                  borderColor: "primary.main",
                  bgcolor: "action.hover",
                },
              }}
            >
              <EmailOutlinedIcon sx={{ fontSize: 18 }} />
              <Typography sx={{ fontSize: "0.82rem" }}>{emailAddress}</Typography>
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
