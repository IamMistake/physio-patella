import type { Metadata } from "next";
import { cookies } from "next/headers";
import { DM_Serif_Display, Instrument_Sans } from "next/font/google";
import { Box } from "@mui/material";
import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";
import AppThemeProvider from "@/components/providers/app-theme-provider";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: "400",
  subsets: ["latin"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Physio Patella",
  description: "Физиотерапија и хиропрактика во Скопје",
};

const THEME_COOKIE_NAME = "physio-patella-theme-mode";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieMode = cookieStore.get(THEME_COOKIE_NAME)?.value;
  const initialMode = cookieMode === "dark" || cookieMode === "light" ? cookieMode : "light";

  return (
    <html lang="mk">
      <body className={`${dmSerif.variable} ${instrumentSans.variable} antialiased`}>
        <AppThemeProvider initialMode={initialMode}>
          <a className="skip-link" href="#main-content">
            Прескокни до главната содржина
          </a>
          <Navbar />
          <Box
            component="main"
            id="main-content"
            sx={{
              mt: { xs: "56px", md: "64px" },
              pb: "env(safe-area-inset-bottom)",
            }}
          >
            {children}
          </Box>
          <Footer />
        </AppThemeProvider>
      </body>
    </html>
  );
}
