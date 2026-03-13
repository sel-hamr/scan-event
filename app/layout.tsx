import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EventScan — Event Management Platform",
  description:
    "Back-office dashboard for managing events, tickets, speakers, and attendees",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
