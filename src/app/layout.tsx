import type { Metadata } from "next";
import { K2D } from "next/font/google";
import "./globals.css";
import StyledComponentsRegistry from "../lib/registry";
import { AuthProvider } from "@/contexts/AuthContext";

const k2d = K2D({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-k2d",
});

export const metadata: Metadata = {
  title: "NOVEL CMU - Vet Nurse System",
  description: "Veterinary Nurse Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${k2d.variable} antialiased`} suppressHydrationWarning>
        <StyledComponentsRegistry>
          <AuthProvider>
            {children}
          </AuthProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}