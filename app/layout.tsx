import type { Metadata } from 'next';
import "./globals.css";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AdminProvider } from "./providers/AdminProvider";
import { isAdmin } from "@/lib/isAdmin";

const title = { default: 'Iran AIP Charts', template: '%s | Iran AIP Charts' };
const description = 'Access the latest AIP charts for all Iran airports, including SID, STAR, ILS, and approach procedures. Essential resources for pilots, flight planners, and aviation enthusiasts.';

export const metadata: Metadata = {
  title: title,
  description: description,
  openGraph: {
    title: title,
    description: description,
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
