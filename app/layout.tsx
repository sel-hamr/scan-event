import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "EventScan — Event Management Platform",
  description:
    "Back-office dashboard for managing events, tickets, speakers, and attendees",
};

const readInitialDarkModeFromCookie = async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get("settings_appearance")?.value;

  if (!raw) return true;

  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded) as { darkMode?: boolean };
    return typeof parsed.darkMode === "boolean" ? parsed.darkMode : true;
  } catch {
    return true;
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDark = await readInitialDarkModeFromCookie();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={isDark ? "dark" : undefined}
    >
      <body className="antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
