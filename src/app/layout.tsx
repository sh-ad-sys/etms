import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/* ✅ GLOBAL METADATA (SERVER ONLY) */
export const metadata: Metadata = {
  title: {
    default: "Royal Mabati Factory – ETMS",
    template: "%s | Royal Mabati Factory",
  },
  description:
    "Employee Tracking and Management System for attendance, scheduling, lost ID retrieval, and AI-assisted support at Royal Mabati Factory.",
  icons: {
    icon: "/logo.jpeg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/* ✅ ROOT LAYOUT (NO CLIENT LOGIC HERE) */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background`}
      >
        {children}
      </body>
    </html>
  );
}
