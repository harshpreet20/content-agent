import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Content Agent Dashboard",
  description: "5 AI agents managing your content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
