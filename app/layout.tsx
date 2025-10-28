import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Iran AIP Charts",
    description: "Access all updated AIP charts of Iran Airports.",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}