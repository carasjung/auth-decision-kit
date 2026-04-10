import type { Metadata } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@descope/nextjs-sdk";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Auth Decision Kit",
  description:
    "An interactive playground for understanding which Descope auth method fits your product context.",
  openGraph: {
    title: "Auth Decision Kit",
    description:
      "Compare magic links, social login, and passkeys then decide which one belongs in your product.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${syne.variable} ${jetbrains.variable} antialiased`}
      >
        <AuthProvider
          projectId={process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID || ""}
        >
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
