import { Alert, Box, Button, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/admin-auth";
import { adminLoginAction } from "../actions";

type LoginPageProps = {
  searchParams?:
    | {
        error?: string;
      }
    | Promise<{
        error?: string;
      }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const isLoggedIn = await hasAdminSession();

  if (isLoggedIn) {
    redirect("/admin");
  }

  const resolvedSearchParams =
    searchParams && typeof (searchParams as Promise<{ error?: string }>).then === "function"
      ? await (searchParams as Promise<{ error?: string }>)
      : (searchParams as { error?: string } | undefined);

  const hasInvalidPassword = resolvedSearchParams?.error === "invalid";

  return (
    <Box
      sx={{
        minHeight: "calc(100dvh - 56px)",
        display: "grid",
        alignItems: "center",
        py: { xs: 4, md: 8 },
      }}
    >
      <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}>
          <Stack spacing={2.4}>
            <Stack spacing={0.7}>
              <Typography sx={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "primary.main" }}>
                Администрација
              </Typography>
              <Typography variant="h1" sx={{ fontFamily: "var(--font-dm-serif), serif", fontSize: { xs: "1.8rem", md: "2.2rem" } }}>
                Најава во админ панел
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: "0.95rem" }}>
                Внесете ја админ лозинката за управување со термини, вработени, сертификати и документи.
              </Typography>
            </Stack>

            {hasInvalidPassword ? (
              <Alert severity="error">Невалидна лозинка. Обидете се повторно.</Alert>
            ) : null}

            <Box component="form" action={adminLoginAction}>
              <Stack spacing={1.5}>
                <TextField
                  name="password"
                  type="password"
                  label="Админ лозинка"
                  required
                  autoComplete="current-password"
                  fullWidth
                />
                <Button type="submit" variant="contained" sx={{ minHeight: 44 }}>
                  Најави се
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
