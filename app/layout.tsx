import type { Metadata } from 'next';
import "./globals.css";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AdminProvider } from "./providers/AdminProvider";
import { isAdmin } from "@/lib/isAdmin";

export const metadata: Metadata = {
  title: {
    default: 'Iran AIP Charts',
    template: '%s | Iran AIP Charts'
  },
  description: 'Access all updated AIP charts of Iran airports including SID, STAR, and ILS.',
  openGraph: {
    title: {
      default: 'Iran AIP Charts',
      template: '%s | Iran AIP Charts'
    },
    description: 'Access all updated AIP charts of Iran airports.',
    type: 'website',
  }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();

  return (
    <html lang="en">
      <body>
        <AdminProvider isAdmin={admin}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AdminProvider>
      </body>
    </html>
  );
}
