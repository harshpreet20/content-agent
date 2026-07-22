import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Content Agent Dashboard",
  description: "5 AI agents managing your content",
  icons: {
    icon: "/rcc-crest.webp",
    shortcut: "/rcc-crest.webp",
    apple: "/rcc-crest.webp",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-[#eef2ff] via-[#f6f7fb] to-[#fdf2f8] text-gray-900 min-h-screen antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
