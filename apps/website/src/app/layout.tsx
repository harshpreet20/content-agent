import "./globals.css";

export const metadata = {
  title: "RCC — Racquets Club Community",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
