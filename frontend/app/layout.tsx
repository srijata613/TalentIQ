import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TalentIQ – AI Talent Intelligence Platform",
    template: "%s | TalentIQ",
  },
  description:
    "Semantic resume analysis, AI-powered candidate matching, and intelligent recruitment workflows.",
  keywords: ["recruitment", "AI", "resume analyzer", "job matching", "talent intelligence"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}