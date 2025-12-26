import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./providers/ThemeProvider";

export const metadata: Metadata = {
    title: "Iran AIP Charts",
    description: "Access all updated AIP charts of Iran Airports.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
