import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ApplyBurst — Search beyond the job title",
  description: "Detailed job discovery, explainable matches and verified sandbox applications. Runs on your CPU with no AI loop.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
