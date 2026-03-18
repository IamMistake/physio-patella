import type { Metadata } from "next";
import { DM_Serif_Display, Instrument_Sans } from "next/font/google";
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
  description: "Physiotherapy and chiropractic studio website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSerif.variable} ${instrumentSans.variable} antialiased`}>
        <AppThemeProvider>
          <Navbar />
          {children}
        </AppThemeProvider>
      </body>
    </html>
  );
}
